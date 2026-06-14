import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAllCounts() {
  const [colleges, apps, queries, users, cApps, settings] = await Promise.all([
    supabase.from('colleges').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('queries').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('counselor_applications').select('*', { count: 'exact', head: true }),
    supabase.from('platform_settings').select('*', { count: 'exact', head: true })
  ]);
  
  console.log('--- DATABASE COUNTS ---');
  console.log(`Colleges: ${colleges.count} (Error: ${colleges.error?.message || 'none'})`);
  console.log(`Applications: ${apps.count} (Error: ${apps.error?.message || 'none'})`);
  console.log(`Queries: ${queries.count} (Error: ${queries.error?.message || 'none'})`);
  console.log(`Users: ${users.count} (Error: ${users.error?.message || 'none'})`);
  console.log(`Counselor Apps: ${cApps.count} (Error: ${cApps.error?.message || 'none'})`);
  console.log(`Platform Settings: ${settings.count} (Error: ${settings.error?.message || 'none'})`);
}

checkAllCounts();
