-- Create email_change_requests table
CREATE TABLE IF NOT EXISTS email_change_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  new_email TEXT NOT NULL,
  confirmation_code TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_pending_request UNIQUE (user_id, verified_at) WHERE verified_at IS NULL
);

-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_email_requests()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete expired unverified requests (older than 10 minutes)
  DELETE FROM email_change_requests
  WHERE verified_at IS NULL
    AND sent_at < NOW() - INTERVAL '10 minutes';
    
  -- Delete old verified requests (older than 24 hours)
  DELETE FROM email_change_requests
  WHERE verified_at IS NOT NULL
    AND verified_at < NOW() - INTERVAL '24 hours';
END;
$$;
