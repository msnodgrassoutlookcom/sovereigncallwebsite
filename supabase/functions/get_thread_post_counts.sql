-- Create a stored procedure to efficiently count posts per thread
CREATE OR REPLACE FUNCTION get_thread_post_counts(thread_ids TEXT[])
RETURNS TABLE (thread_id TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fp.thread_id::TEXT, 
    COUNT(fp.id)::BIGINT
  FROM 
    forum_posts fp
  WHERE 
    fp.thread_id = ANY(thread_ids)
  GROUP BY 
    fp.thread_id;
END;
$$ LANGUAGE plpgsql;
