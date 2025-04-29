
-- Insert sample event data if no events exist
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
  'Join us for our monthly pitch day where startup founders present their ideas to potential investors and mentors.',
  (NOW() + INTERVAL '10 days')::TIMESTAMP, 
  (NOW() + INTERVAL '10 days' + INTERVAL '3 hours')::TIMESTAMP, 
  'physical', 
  'Innovation Center, Building 3', 
  'pitch', 
  true, 
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), 
  'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=1200&q=80', 
  ARRAY['10 startups will pitch their ideas', 'Panel of investors and industry experts', 'Networking session after the event'], 
  50
WHERE NOT EXISTS (SELECT 1 FROM public.events WHERE title = 'Startup Pitch Day');

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
  'A hands-on workshop on business model canvas and value proposition for aspiring entrepreneurs.',
  (NOW() + INTERVAL '15 days')::TIMESTAMP, 
  (NOW() + INTERVAL '15 days' + INTERVAL '2 hours')::TIMESTAMP, 
  'physical', 
  'Conference Hall, Main Campus', 
  'workshop', 
  true, 
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), 
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 
  ARRAY['Interactive workshop format', 'Take home templates and resources', 'One-on-one feedback sessions'], 
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
  'Learn about fundraising strategies directly from venture capitalists investing in early-stage startups.',
  (NOW() + INTERVAL '20 days')::TIMESTAMP, 
  (NOW() + INTERVAL '20 days' + INTERVAL '2 hours')::TIMESTAMP, 
  'virtual', 
  'https://zoom.us/j/123456789', 
  'general', 
  true, 
  (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), 
  'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1200&q=80', 
  ARRAY['Panel of 5 venture capitalists', 'Q&A session with the audience', 'Insights on current investment trends'], 
  150
WHERE NOT EXISTS (SELECT 1 FROM public.events WHERE title = 'Venture Capital Panel');
