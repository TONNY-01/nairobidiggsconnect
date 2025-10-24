-- Add admin role and update user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'mover';

-- Add Groq API key to profiles (encrypted storage)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS groq_api_key TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT false;

-- Create user_roles table for secure role management
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Movers table
CREATE TABLE IF NOT EXISTS movers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  description TEXT,
  service_areas TEXT[] DEFAULT '{}',
  phone TEXT NOT NULL,
  email TEXT,
  verification_status TEXT DEFAULT 'pending',
  rating NUMERIC DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE movers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Movers are viewable by everyone"
  ON movers FOR SELECT USING (true);

CREATE POLICY "Movers can manage own profile"
  ON movers FOR ALL
  USING (auth.uid() = user_id);

-- Mover services (van sizes, pricing)
CREATE TABLE IF NOT EXISTS mover_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mover_id UUID REFERENCES movers(id) ON DELETE CASCADE NOT NULL,
  van_size TEXT NOT NULL CHECK (van_size IN ('small', 'medium', 'large')),
  hourly_rate NUMERIC NOT NULL,
  fixed_rate NUMERIC,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE mover_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mover services are viewable by everyone"
  ON mover_services FOR SELECT USING (true);

CREATE POLICY "Movers can manage own services"
  ON mover_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM movers
      WHERE movers.id = mover_services.mover_id
      AND movers.user_id = auth.uid()
    )
  );

-- Move requests/quotes
CREATE TABLE IF NOT EXISTS move_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mover_id UUID REFERENCES movers(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  van_size TEXT NOT NULL,
  move_date DATE NOT NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  distance_km NUMERIC,
  packing_help BOOLEAN DEFAULT false,
  estimated_cost NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE move_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can view own move requests"
  ON move_requests FOR SELECT
  USING (auth.uid() = tenant_id);

CREATE POLICY "Movers can view requests for them"
  ON move_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM movers
      WHERE movers.id = move_requests.mover_id
      AND movers.user_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can create move requests"
  ON move_requests FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Movers can update their requests"
  ON move_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM movers
      WHERE movers.id = move_requests.mover_id
      AND movers.user_id = auth.uid()
    )
  );

-- Messages table for in-app messaging
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they sent or received"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update read status of received messages"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Mover reviews
CREATE TABLE IF NOT EXISTS mover_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mover_id UUID REFERENCES movers(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  move_request_id UUID REFERENCES move_requests(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE mover_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON mover_reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for completed moves"
  ON mover_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Add video_url to properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_movers_updated_at
  BEFORE UPDATE ON movers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_move_requests_updated_at
  BEFORE UPDATE ON move_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;