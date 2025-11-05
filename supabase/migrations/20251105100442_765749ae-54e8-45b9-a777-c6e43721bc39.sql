-- Drop the existing check constraint on van_size
ALTER TABLE mover_services DROP CONSTRAINT IF EXISTS mover_services_van_size_check;

-- Add new check constraint with motorbike, pickup, and truck options
ALTER TABLE mover_services 
ADD CONSTRAINT mover_services_van_size_check 
CHECK (van_size = ANY (ARRAY['small'::text, 'medium'::text, 'large'::text, 'motorbike'::text, 'pickup'::text, 'truck'::text]));