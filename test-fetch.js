import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testFetch() {
  const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false }).limit(5);
  if (error) {
    console.error('SUPABASE ERROR:', error);
  } else {
    console.log(data);
  }
}

testFetch();
