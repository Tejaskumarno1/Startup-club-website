
-- Create functions for incrementing and decrementing attendees count

CREATE OR REPLACE FUNCTION increment_attendees_count(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET attendees_count = COALESCE(attendees_count, 0) + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_attendees_count(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET attendees_count = GREATEST(COALESCE(attendees_count, 0) - 1, 0)
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to create these functions from client side if needed
CREATE OR REPLACE FUNCTION create_increment_function()
RETURNS text AS $$
BEGIN
  -- This function just returns "success" since the actual functions are created by this migration
  RETURN 'success';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_attendees_count TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_attendees_count TO authenticated;
GRANT EXECUTE ON FUNCTION create_increment_function TO authenticated;
