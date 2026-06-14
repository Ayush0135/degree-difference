import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkInit() {
  const [apps, qs, dbCounselors, cApps, dbSubadmins, marquee] = await Promise.all([
    supabase.from('applications').select('*').order('created_at', { ascending: false }),
    supabase.from('queries').select('*').order('created_at', { ascending: false }),
    supabase.from('users').select('*').eq('role', 'counselor'),
    supabase.from('counselor_applications').select('*').order('created_at', { ascending: false }),
    supabase.from('users').select('*').eq('role', 'subadmin'),
    supabase.from('platform_settings').select('value').eq('key', 'counselor_marquee_offer').single()
  ]);
  
  console.log(`Apps: ${apps.data?.length || 0} Error: ${apps.error?.message || null}`);
  console.log(`Queries: ${qs.data?.length || 0} Error: ${qs.error?.message || null}`);
  console.log(`Counselors: ${dbCounselors.data?.length || 0} Error: ${dbCounselors.error?.message || null}`);
  console.log(`Counselor Apps: ${cApps.data?.length || 0} Error: ${cApps.error?.message || null}`);
  console.log(`Subadmins: ${dbSubadmins.data?.length || 0} Error: ${dbSubadmins.error?.message || null}`);
  console.log(`Marquee: ${marquee.data?.value || null} Error: ${marquee.error?.message || null}`);
}

checkInit();
