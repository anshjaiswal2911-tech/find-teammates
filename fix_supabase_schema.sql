-- 1. Fix Profiles table (Safe to run multiple times)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS college TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT 'Beginner',
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'Weekends',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Drop existing collaboration tables to ensure clean schema (ONLY IF DATA LOSS IS OK FOR THESE TABLES)
-- These tables were part of the new real-time features migration.
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversation_members CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.event_registrations CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.meetings CASCADE;

-- 3. Re-create Conversations & Messaging
CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.conversation_members (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Re-create Events & Hackathons
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('Hackathon', 'Workshop', 'Webinar', 'Conference')),
  date DATE NOT NULL,
  end_date DATE,
  location TEXT,
  mode TEXT CHECK (mode IN ('Online', 'Offline', 'Hybrid')),
  prize TEXT,
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  organizer_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.event_registrations (
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- 5. Re-create Meetings & Video Calls
CREATE TABLE public.meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  meeting_id TEXT UNIQUE NOT NULL,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  meeting_link TEXT,
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Active', 'Ended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- 7. Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can see conversations they are part of" ON public.conversations;
CREATE POLICY "Users can see conversations they are part of" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members 
      WHERE conversation_id = conversations.id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can see members of their conversations" ON public.conversation_members;
CREATE POLICY "Users can see members of their conversations" ON public.conversation_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members 
      WHERE conversation_id = conversation_members.conversation_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can read messages in their conversations" ON public.messages;
CREATE POLICY "Users can read messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members 
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages into their conversations" ON public.messages;
CREATE POLICY "Users can insert messages into their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversation_members 
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can register for events" ON public.event_registrations;
CREATE POLICY "Users can register for events" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can see their own registrations" ON public.event_registrations;
CREATE POLICY "Users can see their own registrations" ON public.event_registrations FOR SELECT USING (auth.uid() = user_id);

-- 8. Finalize
-- Note: Profiles must be created through Supabase Auth to maintain referential integrity.


