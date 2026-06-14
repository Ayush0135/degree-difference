import { fetchApplicationsFromDB, fetchCounselorsFromDB } from './src/lib/supabase.js';

async function check() {
  const apps = await fetchApplicationsFromDB();
  console.log('Total applications in DB:', apps.length);
  const counselors = await fetchCounselorsFromDB();
  console.log('Total counselors in DB:', counselors.length);
}
check();
