-- Add missing columns to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS college TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'Weekends',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create resources table if not exists
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  link TEXT,
  author_id UUID REFERENCES public.profiles(id),
  upvotes INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for resources
DROP POLICY IF EXISTS "Resources are viewable by everyone." ON public.resources;
CREATE POLICY "Resources are viewable by everyone." ON public.resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert resources." ON public.resources;
CREATE POLICY "Authenticated users can insert resources." ON public.resources FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to increment upvotes
CREATE OR REPLACE FUNCTION public.increment_upvotes(resource_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.resources
  SET upvotes = upvotes + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Robust handle_new_user with fallback for NOT NULL username constraint
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate a fallback username from email if not provided
  generated_username := COALESCE(
    new.raw_user_meta_data->>'username', 
    split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4)
  );

  INSERT INTO public.profiles (id, username, full_name, email, avatar_url)
  VALUES (
    new.id, 
    generated_username,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO UPDATE 
  SET full_name = EXCLUDED.full_name, 
      avatar_url = EXCLUDED.avatar_url;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
