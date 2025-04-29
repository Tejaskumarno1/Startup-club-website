
-- Update events table to match frontend requirements
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS attendees_count INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_end_datetime ON events(end_datetime);

-- Update role level security for events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'events' AND policyname = 'Allow read access for all users'
  ) THEN
    CREATE POLICY "Allow read access for all users" 
    ON public.events 
    FOR SELECT 
    USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'events' AND policyname = 'Allow all access for admins'
  ) THEN
    CREATE POLICY "Allow all access for admins" 
    ON public.events 
    USING (
      auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'
      )
    );
  END IF;
END
$$;

-- Ensure event_registrations has the correct fields and constraints
ALTER TABLE public.event_registrations
ADD COLUMN IF NOT EXISTS registered_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update security policies for event_registrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_registrations' AND policyname = 'Users can view their own registrations'
  ) THEN
    CREATE POLICY "Users can view their own registrations" 
    ON public.event_registrations 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_registrations' AND policyname = 'Users can register for events'
  ) THEN
    CREATE POLICY "Users can register for events" 
    ON public.event_registrations 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_registrations' AND policyname = 'Users can update their own registrations'
  ) THEN
    CREATE POLICY "Users can update their own registrations" 
    ON public.event_registrations 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'event_registrations' AND policyname = 'Admins can view all registrations'
  ) THEN
    CREATE POLICY "Admins can view all registrations" 
    ON public.event_registrations 
    FOR SELECT 
    USING (
      auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'
      )
    );
  END IF;
END
$$;

-- Insert sample event data to match frontend fallbacks if no events exist
INSERT INTO public.events (
  title, 
  description, 
  start_datetime, 
  end_datetime, 
  location_type, 
  physical_address, 
  event_type, 
  is_public, 
  created_by, 
  image_url, 
  highlights, 
  attendees_count
)
SELECT 
  'Startup Pitch Day', 
  'Join us for our monthly pitch day where startup founders present their ideas to potential investors and mentors. This is a great opportunity to get feedback on your startup idea or learn from others.',
  (NOW() + INTERVAL '21 days')::TIMESTAMP, 
  (NOW() + INTERVAL '21 days' + INTERVAL '3 hours')::TIMESTAMP, 
  'physical', 
  'Innovation Center, Building 3', 
  'pitch', 
  true, 
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), 
  'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', 
  ARRAY['10 startups will pitch their ideas', 'Panel of investors and industry experts', 'Networking session after the event', 'Refreshments provided'], 
  50
WHERE NOT EXISTS (SELECT 1 FROM public.events);

INSERT INTO public.events (
  title, 
  description, 
  start_datetime, 
  end_datetime, 
  location_type, 
  physical_address, 
  event_type, 
  is_public, 
  created_by, 
  image_url, 
  highlights, 
  attendees_count
)
SELECT 
  'Entrepreneurship Workshop', 
  'A hands-on workshop on business model canvas and value proposition for aspiring entrepreneurs. Learn how to validate your business idea and create a compelling value proposition for your target customers.',
  (NOW() + INTERVAL '25 days')::TIMESTAMP, 
  (NOW() + INTERVAL '25 days' + INTERVAL '2 hours')::TIMESTAMP, 
  'physical', 
  'Conference Hall, Main Campus', 
  'workshop', 
  true, 
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), 
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', 
  ARRAY['Interactive workshop format', 'Take home templates and resources', 'One-on-one feedback sessions', 'Certificate of participation'], 
  100
WHERE NOT EXISTS (SELECT 1 FROM public.events WHERE title = 'Entrepreneurship Workshop');

INSERT INTO public.events (
  title, 
  description, 
  start_datetime, 
  end_datetime, 
  location_type, 
  virtual_meeting_url, 
  event_type, 
  is_public, 
  created_by, 
  image_url, 
  highlights, 
  attendees_count
)
SELECT 
  'Venture Capital Panel', 
  'Learn about fundraising strategies directly from venture capitalists investing in early-stage startups. This virtual panel will feature VCs from leading firms discussing what they look for in startups.',
  (NOW() + INTERVAL '32 days')::TIMESTAMP, 
  (NOW() + INTERVAL '32 days' + INTERVAL '2 hours')::TIMESTAMP, 
  'virtual', 
  'https://zoom.us/j/123456789', 
  'general', 
  true, 
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), 
  'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80', 
  ARRAY['Panel of 5 venture capitalists', 'Q&A session with the audience', 'Insights on current investment trends', 'Recording available after the event'], 
  150
WHERE NOT EXISTS (SELECT 1 FROM public.events WHERE title = 'Venture Capital Panel');

-- Create admin function to update all event attributes
CREATE OR REPLACE FUNCTION update_event_as_admin(
  event_id UUID,
  new_title TEXT DEFAULT NULL,
  new_description TEXT DEFAULT NULL,
  new_start_datetime TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  new_end_datetime TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  new_location_type TEXT DEFAULT NULL,
  new_physical_address TEXT DEFAULT NULL,
  new_virtual_meeting_url TEXT DEFAULT NULL,
  new_event_type TEXT DEFAULT NULL,
  new_is_public BOOLEAN DEFAULT NULL,
  new_image_url TEXT DEFAULT NULL,
  new_highlights TEXT[] DEFAULT NULL
) RETURNS SETOF events AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can use this function';
  END IF;

  RETURN QUERY
  UPDATE public.events SET
    title = COALESCE(new_title, title),
    description = COALESCE(new_description, description),
    start_datetime = COALESCE(new_start_datetime, start_datetime),
    end_datetime = COALESCE(new_end_datetime, end_datetime),
    location_type = COALESCE(new_location_type, location_type),
    physical_address = COALESCE(new_physical_address, physical_address),
    virtual_meeting_url = COALESCE(new_virtual_meeting_url, virtual_meeting_url),
    event_type = COALESCE(new_event_type, event_type),
    is_public = COALESCE(new_is_public, is_public),
    image_url = COALESCE(new_image_url, image_url),
    highlights = COALESCE(new_highlights, highlights),
    updated_at = NOW()
  WHERE id = event_id
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION update_event_as_admin TO authenticated;
