import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function deleteCounselor() {
  const { error } = await supabase.from('users').delete().eq('id', 'aa27f933-f6b6-4bff-8931-c4646c0f9da3');
  if (error) console.error(error);
  else console.log('Successfully deleted the duplicate uppercase counselor account.');
}

deleteCounselor();
