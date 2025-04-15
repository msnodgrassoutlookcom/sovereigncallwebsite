-- Create a function to increment thread view count
CREATE OR REPLACE FUNCTION increment_thread_view(thread_id VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE forum_threads
  SET view_count = view_count + 1
  WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql;
