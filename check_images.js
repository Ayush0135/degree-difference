import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zmsqbysmpxkqeoapxnbo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FieXNtcHhrcWVvYXB4bmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODE0NDAsImV4cCI6MjA5MTc1NzQ0MH0.iN_FeepWWIXZmv-ofgkdv3gAXali77yebxGdqjBe8pI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: colleges } = await supabase.from('colleges').select('id, name, image').limit(5);
  console.log(JSON.stringify(colleges, null, 2));
}
check();
