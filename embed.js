import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
// Hardcoding Gemini API key for this background script as provided
const geminiApiKey = 'AQ.Ab8RN6K21MPFoskW53bsL3qh5mt3ZN4cWhiWlZ5PxlFBTs12gQ';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateEmbedding(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${geminiApiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/gemini-embedding-2',
      content: { parts: [{ text }] }
    })
  });

  if (!res.ok) {
    throw new Error(`Gemini API Error: ${await res.text()}`);
  }

  const data = await res.json();
  return data.embedding.values;
}

async function run() {
  console.log("Fetching colleges to embed...");
  
  // Fetch ALL colleges to re-embed with rich data
  const { data: colleges, error } = await supabase.from('colleges').select('*');
  
  if (error) {
    console.error("Error fetching colleges", error);
    return;
  }

  console.log(`Found ${colleges.length} colleges needing embeddings.`);

  for (const college of colleges) {
    console.log(`Embedding ${college.name}...`);
    const contentToEmbed = `
      College Name: ${college.name}
      Location: ${college.location}, ${college.city}, ${college.state}
      Type: ${college.type}
      Courses: ${college.courses_offered?.join(', ') || ''}
      Facilities: ${college.facilities?.join(', ') || ''}
      Description: ${college.description || ''}
      Average Package: ${college.avg_package || ''}
      Highest Package: ${college.highest_package || ''}
      Placement Rate: ${college.placement_rate || ''}%
      Placement Review: ${college.placement_review || ''}
      College Life: ${college.college_life_review || ''}
      Hostel: ${college.hostel_details || ''}
      Food Quality: ${college.food_quality || ''}
      Gym: ${college.gym_facilities || ''}
      Scholarships: ${college.scholarships_available ? 'Available' : 'Not specified'}
    `.trim();

    try {
      const vector = await generateEmbedding(contentToEmbed);
      
      const { error: updateError } = await supabase
        .from('colleges')
        .update({ embedding: vector })
        .eq('id', college.id);
        
      if (updateError) throw updateError;
      console.log(`✅ Success: ${college.name}`);
    } catch (err) {
      console.error(`❌ Failed: ${college.name}`, err.message);
    }
    
    // Slight delay to respect rate limits
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log("Embeddings complete!");
}

run();
