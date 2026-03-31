-- Fix Supabase Schema for Messages/Conversations
-- Run this in Supabase SQL Editor

-- 1. Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create conversation_members table
CREATE TABLE IF NOT EXISTS public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- 3. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation_id 
  ON public.conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id 
  ON public.conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
  ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
  ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
  ON public.messages(created_at DESC);

-- 5. Enable RLS (Row Level Security)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for conversations
CREATE POLICY "Users can view conversations they are part of"
  ON public.conversations FOR SELECT
  USING (
    id IN (
      SELECT conversation_id FROM public.conversation_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (true);

-- 7. Create RLS Policies for conversation_members
CREATE POLICY "Users can view conversation members"
  ON public.conversation_members FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add members to conversations"
  ON public.conversation_members FOR INSERT
  WITH CHECK (true);

-- 8. Create RLS Policies for messages
CREATE POLICY "Users can view messages in conversations they are part of"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to conversations they are part of"
  ON public.messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_members 
      WHERE user_id = auth.uid()
    )
    AND sender_id = auth.uid()
  );

-- 9. Verify tables exist
SELECT 
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'conversation_members', 'messages');
