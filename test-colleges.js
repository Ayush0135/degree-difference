import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColleges() {
  const { data, error } = await supabase.from('colleges').select('id, name').limit(2);
  console.log('Colleges:', { data, error });
}

checkColleges();
