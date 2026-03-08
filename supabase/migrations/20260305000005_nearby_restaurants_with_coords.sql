-- Migration: 005_nearby_restaurants_with_coords
-- Description: Update nearby_restaurants RPC to return lat/lng for map markers
-- Created: 2026-03-05

-- Must drop first because we're changing the return type (adding latitude, longitude, cuisine)
DROP FUNCTION IF EXISTS public.nearby_restaurants(double precision, double precision, integer);

CREATE OR REPLACE FUNCTION public.nearby_restaurants(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  address TEXT,
  certification_type certification_type,
  image_url TEXT,
  distance_meters DOUBLE PRECISION,
  avg_rating DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  cuisine TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.description,
    r.address,
    r.certification_type,
    r.image_url,
    ST_Distance(
      r.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) AS distance_meters,
    COALESCE(AVG(rev.rating), 0)::DOUBLE PRECISION AS avg_rating,
    ST_Y(r.location::geometry) AS latitude,
    ST_X(r.location::geometry) AS longitude,
    r.cuisine
  FROM public.restaurants r
  LEFT JOIN public.reviews rev ON rev.restaurant_id = r.id
  WHERE
    r.status = 'approved'
    AND ST_DWithin(
      r.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_meters
    )
  GROUP BY r.id
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql STABLE;
