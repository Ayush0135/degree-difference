import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const dummyCollege = {
    name: 'Test',
    location: 'Loc',
    city: 'City',
    state: 'State',
    type: 'Engineering',
    affiliation: 'Aff',
    established: 2000,
    rating: 4.5,
    total_seats: 1000,
    courses_offered: ['B.Tech'],
    facilities: ['Wi-Fi'],
    fees_min: 100,
    fees_max: 200,
    image: 'http',
    description: 'Desc',
    nirf_rank: 1,
    accreditation: ['NAAC'],
    avg_package: 10,
    highest_package: 20,
    placement_rate: 90.0,
    website: 'http',
    campus_size: '10',
    hostel_details: 'Yes',
    food_quality: 'Good',
    gym_facilities: 'Yes',
    college_life_review: 'Good',
    scholarships_available: true,
    placement_review: 'Good'
  };

  const { data, error } = await supabase.from('colleges').insert([dummyCollege]).select().single();
  if (error) {
    console.error("SUPABASE ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("SUCCESS:", data);
  }
}

testInsert();
