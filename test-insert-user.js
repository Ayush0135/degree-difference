import 'dotenv/config';
import { updatePlatformSettings, fetchPlatformSettings } from './src/lib/supabase.ts';

async function testSubadmin() {
  console.log('Testing update...');
  const success = await updatePlatformSettings('subadmins_data', '[]');
  console.log('Success:', success);
  
  const val = await fetchPlatformSettings('subadmins_data');
  console.log('Val:', val);
}

testSubadmin();
