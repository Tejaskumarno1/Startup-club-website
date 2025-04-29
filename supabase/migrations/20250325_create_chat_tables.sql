
-- Check if chat_rooms table exists, create if it doesn't
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_private BOOLEAN DEFAULT false
);

-- Add RLS policies for chat_rooms
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- Chat rooms are readable by all authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_rooms' AND policyname = 'Chat rooms readable by all users'
  ) THEN
    CREATE POLICY "Chat rooms readable by all users" 
    ON public.chat_rooms 
    FOR SELECT 
    USING (true);
  END IF;
END
$$;

-- Chat rooms can be created by any authenticated user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_rooms' AND policyname = 'Users can create chat rooms'
  ) THEN
    CREATE POLICY "Users can create chat rooms" 
    ON public.chat_rooms 
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END
$$;

-- Chat rooms are modifiable by creators or admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_rooms' AND policyname = 'Creators or admins can modify rooms'
  ) THEN
    CREATE POLICY "Creators or admins can modify rooms" 
    ON public.chat_rooms 
    FOR UPDATE 
    USING (
      auth.uid() = created_by OR 
      auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'
      )
    );
  END IF;
END
$$;

-- Check if chat_messages table exists, create if it doesn't
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id),
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Messages are readable by all authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' AND policyname = 'Messages readable by all users'
  ) THEN
    CREATE POLICY "Messages readable by all users" 
    ON public.chat_messages 
    FOR SELECT 
    USING (true);
  END IF;
END
$$;

-- Messages can be created by any authenticated user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' AND policyname = 'Users can create messages'
  ) THEN
    CREATE POLICY "Users can create messages" 
    ON public.chat_messages 
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END
$$;

-- Messages are modifiable only by the author
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chat_messages' AND policyname = 'Users can modify their own messages'
  ) THEN
    CREATE POLICY "Users can modify their own messages" 
    ON public.chat_messages 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create a default General chat room if none exists
INSERT INTO public.chat_rooms (name, description)
SELECT 'General', 'General discussion for all members'
WHERE NOT EXISTS (
  SELECT 1 FROM public.chat_rooms WHERE name = 'General'
);
