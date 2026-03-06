-- Migration: 006_seed_restaurant_locations
-- Source: 19 from OSM Overpass/Nominatim, 11 from Google Maps (verified exact)
-- Created: 2026-03-06

-- ── OSM-verified restaurants ─────────────────────────────────────────────────
-- Saad's Halal Restaurant [OSM exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.2118953, 39.9550211), 4326)::geography WHERE id = '14f0e1f5-3b96-400f-8c29-f4bdc51688d5';
-- Pasha's Halal Food [OSM exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.1382988, 39.9761073), 4326)::geography WHERE id = 'a18c0550-cf2a-4bcb-a6c3-163de5f8e322';
-- Malooga [OSM exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.1438265, 39.9482674), 4326)::geography WHERE id = 'c0b530b1-e932-4e41-a74e-049179cf940a';
-- Tent Halal Food [OSM]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.1382988, 39.9761073), 4326)::geography WHERE id = '86d2589f-e0c0-42c2-a512-41c49071ed56';
-- Dave's Hot Chicken [OSM]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.2166089, 40.0349779), 4326)::geography WHERE id = '5a0b75b6-5991-48b3-982c-c8a85ed1b0eb';
-- Indian Char House [OSM]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.1406785, 39.9723966), 4326)::geography WHERE id = 'af1bfe9c-5d8c-4268-b799-cfafb4098235';
-- Manakeesh Cafe Bakery [OSM exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.2115307, 39.9550873), 4326)::geography WHERE id = '7a9af704-617a-4907-a5ce-207bc4bd8519';
-- Kabobeesh [OSM exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.2065339, 39.9565219), 4326)::geography WHERE id = 'e5472a1b-db4e-4098-b8a3-a2491fb78ca4';
-- Sansom Kabob House [OSM]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.1634652, 39.9433178), 4326)::geography WHERE id = '387925b8-43f8-473c-8ffa-90e73d67c252';
-- Shaban Kabab & Curry [OSM]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.2663388, 39.9516901), 4326)::geography WHERE id = '911ca484-e8bf-4b17-83cf-7fb7e0cde5f3';
-- Old Towne Pizza & Wings [OSM]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.0960306, 39.9055731), 4326)::geography WHERE id = '84471616-754b-4020-94c4-b153da7201bd';
-- Haveli Virasat [OSM exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.2037529, 39.9575693), 4326)::geography WHERE id = '2d7adec7-4a13-418d-a3f9-d94782800879';
-- Sura Indian Bistro [OSM]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.2076021, 40.076849), 4326)::geography WHERE id = '0674b198-9c88-4cac-a75f-ebc1665da076';
-- Mood Cafe [OSM exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.215798, 39.9486266), 4326)::geography WHERE id = '9fe67ea1-41f8-42e2-b444-ffa97e830c8d';
-- Uyghur Noodle King [OSM exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.1995035, 39.955133), 4326)::geography WHERE id = 'b3f03a86-eae0-496a-8b63-cfdd2fc835ae';
-- Goldie [OSM exact - Rittenhouse]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.1925145, 39.9530359), 4326)::geography WHERE id = '0f53489a-8bf0-40de-a506-d75948f8d134';
-- Al-Sham Restaurant [Nominatim]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.1446329, 39.9613644), 4326)::geography WHERE id = '9b2a2046-a76e-49ee-8dd5-6ded45b56a07';
-- Turkey Berry [Nominatim]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.0371644, 40.0820986), 4326)::geography WHERE id = 'ed106e1e-057b-4766-9da4-e087977bf730';
-- Suraya [Nominatim - Fishtown]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.1339056, 39.9737281), 4326)::geography WHERE id = '4aef1182-5297-466e-93d5-2fa090bf4239';

-- ── Google Maps verified coordinates ─────────────────────────────────────────
-- Hadramout [Google Maps exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.2117546, 39.9557177), 4326)::geography WHERE name = 'Hadramout';
-- Tang's Halal Chinese Restaurant [Google Maps exact - 2223 Ridge Ave]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.1717646, 39.9802551), 4326)::geography WHERE name = 'Tang''s Halal Chinese Restaurant';
-- Paprica Modern Mediterranean Grill [Google Maps exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.1545841, 39.9489797), 4326)::geography WHERE name = 'Paprica Modern Mediterranean Grill';
-- Bon Kif Grill [Google Maps exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.1532384, 39.9422847), 4326)::geography WHERE name = 'Bon Kif Grill';
-- Halal Heaven LLC [Google Maps exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.2081485, 39.9460405), 4326)::geography WHERE name = 'Halal Heaven LLC';
-- Zaffron Grill [Google Maps exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.1681836, 39.9521043), 4326)::geography WHERE name = 'Zaffron Grill';
-- Wah Ji Wah [Google Maps exact - 4447 Chestnut St]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.2111934, 39.9568937), 4326)::geography WHERE name = 'Wah Ji Wah';
-- Tarka Indian Kitchen [Google Maps exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.198691, 39.955349), 4326)::geography WHERE name = 'Tarka';
-- Youma Cuisine [Google Maps exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.2137767, 39.9491001), 4326)::geography WHERE name = 'Youma Cuisine';
-- Cilantro Mediterranean Cuisine [Google Maps exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.1490884, 39.9411149), 4326)::geography WHERE name = 'Cilantro Mediterranean Cuisine';
-- Pera Turkish Cuisine [Google Maps exact]
UPDATE public.restaurants SET location = ST_SetSRID(ST_MakePoint(-75.1406507, 39.9653367), 4326)::geography WHERE name = 'Pera Turkish Cuisine';
