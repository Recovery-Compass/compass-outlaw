-- Create audit log table for edge function usage
-- PFV V16 Protocol - Security & Compliance

CREATE TABLE IF NOT EXISTS public.function_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  request_payload JSONB,
  response_length INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  
  CONSTRAINT valid_function_name CHECK (function_name IN ('gemini-draft', 'intelligence-report'))
);

CREATE INDEX idx_function_logs_user ON public.function_usage_logs(user_id, timestamp DESC);
CREATE INDEX idx_function_logs_function ON public.function_usage_logs(function_name, timestamp DESC);

ALTER TABLE public.function_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own function logs"
  ON public.function_usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert logs"
  ON public.function_usage_logs
  FOR INSERT
  WITH CHECK (true);

GRANT SELECT ON public.function_usage_logs TO authenticated;
