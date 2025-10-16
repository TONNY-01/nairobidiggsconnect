-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('tenant', 'caretaker');

-- Create enum for property types
CREATE TYPE property_type AS ENUM ('studio', 'one_bedroom', 'two_bedroom', 'three_bedroom_plus', 'bedsitter');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  user_role user_role NOT NULL DEFAULT 'tenant',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caretaker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  deposit DECIMAL(10, 2),
  location TEXT NOT NULL,
  neighborhood TEXT,
  property_type property_type NOT NULL,
  rooms INTEGER NOT NULL DEFAULT 1,
  amenities TEXT[] DEFAULT '{}',
  is_furnished BOOLEAN DEFAULT false,
  utilities_included BOOLEAN DEFAULT false,
  available_from DATE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Properties are viewable by everyone"
  ON properties FOR SELECT
  USING (true);

CREATE POLICY "Caretakers can insert own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = caretaker_id);

CREATE POLICY "Caretakers can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = caretaker_id);

CREATE POLICY "Caretakers can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = caretaker_id);

-- Create property_images table
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on property_images
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Property images policies
CREATE POLICY "Property images are viewable by everyone"
  ON property_images FOR SELECT
  USING (true);

CREATE POLICY "Property owners can insert images"
  ON property_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE id = property_id AND caretaker_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can update images"
  ON property_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE id = property_id AND caretaker_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can delete images"
  ON property_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE id = property_id AND caretaker_id = auth.uid()
    )
  );

-- Create saved_properties table (bookmarks)
CREATE TABLE saved_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Enable RLS on saved_properties
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;

-- Saved properties policies
CREATE POLICY "Users can view own saved properties"
  ON saved_properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save properties"
  ON saved_properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved properties"
  ON saved_properties FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, user_role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    new.raw_user_meta_data->>'phone',
    COALESCE((new.raw_user_meta_data->>'user_role')::user_role, 'tenant')
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property images
CREATE POLICY "Property images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own uploads"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'property-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );