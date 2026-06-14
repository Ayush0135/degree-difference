import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDB() {
  // Test 1: Update Platform Settings
  const { data: psData, error: psError } = await supabase.from('platform_settings').upsert({ key: 'counselor_marquee_offer', value: 'Test Offer 123' }, { onConflict: 'key' }).select();
  console.log('Platform Settings Upsert:', { psData, psError });

  // Test 2: Update Application Status
  // Let's get one application
  const { data: apps, error: appsError } = await supabase.from('applications').select('id, status').limit(1);
  console.log('Apps Fetch:', { apps, appsError });

  if (apps && apps.length > 0) {
    const appId = apps[0].id;
    const { data: updateData, error: updateError } = await supabase.from('applications').update({ status: 'approved' }).eq('id', appId).select();
    console.log('App Update:', { updateData, updateError });
  }
}

checkDB();
