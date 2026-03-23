import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjtbovxvmhguunqfzhnx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdGJvdnh2bWhndXVucWZ6aG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMjI4NDcsImV4cCI6MjA4OTc5ODg0N30.thiMZChev7709AsEVErz_6ZVscFse4qJ4Rus8yOhnZE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
