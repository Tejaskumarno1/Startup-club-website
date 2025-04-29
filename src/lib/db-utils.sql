
-- This is the SQL file that needs to be run to create the helper functions for the user dashboard
-- Create a function to get data from a table based on user
CREATE OR REPLACE FUNCTION get_table_data(
  table_name TEXT,
  user_column TEXT,
  user_id UUID,
  limit_rows INT DEFAULT NULL,
  order_column TEXT DEFAULT 'created_at',
  ascending BOOLEAN DEFAULT TRUE
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  query TEXT;
  order_direction TEXT;
BEGIN
  IF ascending THEN
    order_direction := 'ASC';
  ELSE
    order_direction := 'DESC';
  END IF;
  
  query := format('SELECT row_to_json(t) FROM (SELECT * FROM %I WHERE %I = ''%s'' ORDER BY %I %s', 
               table_name, user_column, user_id, order_column, order_direction);
               
  IF limit_rows IS NOT NULL THEN
    query := query || format(' LIMIT %s', limit_rows);
  END IF;
  
  query := query || ') t';
  
  EXECUTE query INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update a record in a table
CREATE OR REPLACE FUNCTION update_record(
  table_name TEXT,
  record_id UUID,
  update_column TEXT,
  update_value TEXT,
  user_column TEXT,
  user_id UUID
)
RETURNS VOID AS $$
DECLARE
  query TEXT;
BEGIN
  query := format('UPDATE %I SET %I = ''%s'' WHERE id = ''%s'' AND %I = ''%s''', 
               table_name, update_column, update_value, record_id, user_column, user_id);
  
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to insert activity records
CREATE OR REPLACE FUNCTION insert_activity(
  user_id UUID,
  activity_type TEXT,
  activity_description TEXT,
  related_entity TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activity (
    user_id,
    activity_type,
    activity_description,
    related_entity
  ) VALUES (
    user_id,
    activity_type,
    activity_description,
    related_entity
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
