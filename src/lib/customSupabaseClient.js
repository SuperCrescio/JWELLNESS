import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iipawxtfojpyyxgvanup.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcGF3eHRmb2pweXl4Z3ZhbnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjgzMTAsImV4cCI6MjA2NzUwNDMxMH0.SnuFa3SjPHxLesGektbWUsb96D4_ZVg8wyHMdf2j9pw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);