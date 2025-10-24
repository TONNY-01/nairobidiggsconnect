-- Add admin and mover roles to user_role enum (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'admin') THEN
    ALTER TYPE user_role ADD VALUE 'admin';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'mover') THEN
    ALTER TYPE user_role ADD VALUE 'mover';
  END IF;
END $$;

-- Add Groq API key columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'groq_api_key') THEN
    ALTER TABLE profiles ADD COLUMN groq_api_key TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ai_enabled') THEN
    ALTER TABLE profiles ADD COLUMN ai_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add video_url to properties
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'video_url') THEN
    ALTER TABLE properties ADD COLUMN video_url TEXT;
  END IF;
END $$;

-- Movers table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'movers') THEN
    CREATE TABLE movers (
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
    
    CREATE POLICY "Movers are viewable by everyone" ON movers FOR SELECT USING (true);
    CREATE POLICY "Movers can manage own profile" ON movers FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Mover services table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mover_services') THEN
    CREATE TABLE mover_services (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      mover_id UUID REFERENCES movers(id) ON DELETE CASCADE NOT NULL,
      van_size TEXT NOT NULL CHECK (van_size IN ('small', 'medium', 'large')),
      hourly_rate NUMERIC NOT NULL,
      fixed_rate NUMERIC,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    ALTER TABLE mover_services ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Mover services are viewable by everyone" ON mover_services FOR SELECT USING (true);
    CREATE POLICY "Movers can manage own services" ON mover_services FOR ALL
      USING (EXISTS (SELECT 1 FROM movers WHERE movers.id = mover_services.mover_id AND movers.user_id = auth.uid()));
  END IF;
END $$;

-- Move requests table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'move_requests') THEN
    CREATE TABLE move_requests (
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
    
    CREATE POLICY "Tenants can view own move requests" ON move_requests FOR SELECT USING (auth.uid() = tenant_id);
    CREATE POLICY "Movers can view requests for them" ON move_requests FOR SELECT
      USING (EXISTS (SELECT 1 FROM movers WHERE movers.id = move_requests.mover_id AND movers.user_id = auth.uid()));
    CREATE POLICY "Tenants can create move requests" ON move_requests FOR INSERT WITH CHECK (auth.uid() = tenant_id);
    CREATE POLICY "Movers can update their requests" ON move_requests FOR UPDATE
      USING (EXISTS (SELECT 1 FROM movers WHERE movers.id = move_requests.mover_id AND movers.user_id = auth.uid()));
  END IF;
END $$;

-- Messages table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    CREATE TABLE messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
      content TEXT NOT NULL,
      read BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view messages they sent or received" ON messages FOR SELECT
      USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
    CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
    CREATE POLICY "Users can update read status of received messages" ON messages FOR UPDATE USING (auth.uid() = receiver_id);
    
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;

-- Mover reviews table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mover_reviews') THEN
    CREATE TABLE mover_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      mover_id UUID REFERENCES movers(id) ON DELETE CASCADE NOT NULL,
      reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      move_request_id UUID REFERENCES move_requests(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    ALTER TABLE mover_reviews ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Reviews are viewable by everyone" ON mover_reviews FOR SELECT USING (true);
    CREATE POLICY "Users can create reviews for completed moves" ON mover_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
  END IF;
END $$;

-- Create triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_movers_updated_at') THEN
    CREATE TRIGGER update_movers_updated_at BEFORE UPDATE ON movers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_move_requests_updated_at') THEN
    CREATE TRIGGER update_move_requests_updated_at BEFORE UPDATE ON move_requests
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;