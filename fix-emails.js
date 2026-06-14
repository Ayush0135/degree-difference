import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixEmails() {
  const { data: users, error } = await supabase.from('users').select('*');
  if (error || !users) return console.error(error);
  
  for (const user of users) {
    if (user.email !== user.email.trim().toLowerCase()) {
      const { error: updateError } = await supabase.from('users').update({ email: user.email.trim().toLowerCase() }).eq('id', user.id);
      if (updateError) console.error(`Error updating user ${user.id}:`, updateError);
      else console.log(`Fixed email for ${user.id}: ${user.email} -> ${user.email.trim().toLowerCase()}`);
    }
  }
}

fixEmails();
