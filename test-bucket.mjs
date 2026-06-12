import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// We MUST use the service role key to create a bucket properly via the API
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY); // Or VITE_SUPABASE_SERVICE_ROLE_KEY if available. Wait, let's just run SQL to DELETE and then recreate if needed. 

async function checkAndRecreateBucket() {
  console.log("Checking buckets...");
  
  // Try creating via API
  const { data: createData, error: createError } = await supabase.storage.createBucket('avatars', {
    public: true,
    fileSizeLimit: 52428800, // 50MB
  });
  
  console.log("Create Bucket result:", createData, "Error:", createError);
}

checkAndRecreateBucket();
