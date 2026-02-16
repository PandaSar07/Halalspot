-- Seed data for development and testing
-- This file is optional and should only be run in development

-- Insert test users (these will be created via Supabase Auth in production)
-- Note: In development, create users via Supabase Dashboard or Auth API

-- Insert sample restaurants (approved for testing)
INSERT INTO public.restaurants (
  name,
  description,
  location,
  address,
  certification_type,
  certification_details,
  phone,
  website,
  created_by,
  status
) VALUES
  (
    'Halal Guys NYC',
    'Famous halal street food serving chicken and gyro over rice',
    ST_SetSRID(ST_MakePoint(-73.9876, 40.7614), 4326)::geography,
    '53rd & 6th Ave, New York, NY 10019',
    'halal_certified',
    'Certified by Islamic Food and Nutrition Council of America (IFANCA)',
    '+1-212-555-0100',
    'https://thehalalguys.com',
    (SELECT id FROM public.users LIMIT 1), -- Replace with actual user ID
    'approved'
  ),
  (
    'Nandos',
    'Flame-grilled PERi-PERi chicken restaurant',
    ST_SetSRID(ST_MakePoint(-0.1276, 51.5074), 4326)::geography,
    'London, UK',
    'halal_options',
    'Select locations serve halal chicken - check with staff',
    '+44-20-7946-0958',
    'https://www.nandos.com',
    (SELECT id FROM public.users LIMIT 1),
    'approved'
  ),
  (
    'Saffron Mediterranean',
    'Authentic Mediterranean cuisine with halal options',
    ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
    'San Francisco, CA 94102',
    'muslim_owned',
    'Muslim-owned restaurant serving halal meat',
    '+1-415-555-0200',
    null,
    (SELECT id FROM public.users LIMIT 1),
    'approved'
  );

-- Note: Reviews and favorites should be added through the application
-- to ensure proper user authentication and RLS policies
