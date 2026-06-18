import { syncUserStateToDB, fetchUserStateFromDB } from './src/lib/supabase';

async function test() {
  const userId = '1c2321c1-b7fb-4926-afd3-87f7e86e1daa'; // student user id
  console.log('Syncing state...');
  const success = await syncUserStateToDB(userId, { favorites: ['college1', 'college2'] });
  console.log('Sync success:', success);

  console.log('Fetching state...');
  const state = await fetchUserStateFromDB(userId);
  console.log('Fetched state:', state);
}
test();
