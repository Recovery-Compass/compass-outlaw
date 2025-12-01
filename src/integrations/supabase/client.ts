import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bnymvgzpojsnlljdqhld.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW12Z3pwb2pzbmxsamRxaGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NjA3ODcsImV4cCI6MjA4MDEzNjc4N30.ohufcP15kCtCUgIXfDllWribfIJYmiRvTl8MDFqJGKo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
