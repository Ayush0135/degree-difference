import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zmsqbysmpxkqeoapxnbo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiApiKey = process.env.GEMINI_API_KEY || '';

async function syncEmbeddings() {
  console.log('Fetching colleges without embeddings...');
  
  // Fetch colleges that need embeddings
  const { data: colleges, error } = await supabase
    .from('colleges')
    .select('*')
    .is('embedding', null);

  if (error) {
    console.error('Error fetching colleges:', error);
    return;
  }

  console.log(`Found ${colleges.length} colleges needing embeddings.`);

  for (const college of colleges) {
    console.log(`Generating embedding for: ${college.name}`);
    
    // Create a semantic string representing the college
    const contentToEmbed = `College Name: ${college.name}. Location: ${college.city}, ${college.state}. Type: ${college.type}. Courses: ${college.courses_offered ? college.courses_offered.join(', ') : 'Various'}. Annual Fees: between ${college.fees_min} and ${college.fees_max}. Description: ${college.description}. Facilities: ${college.facilities ? college.facilities.join(', ') : 'Standard'}.`;

    try {
      const isBearer = geminiApiKey.startsWith('AQ.') || geminiApiKey.startsWith('ya29.');
      const url = isBearer 
        ? 'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent'
        : `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${geminiApiKey}`;
        
      const headers = { 'Content-Type': 'application/json' };
      if (isBearer) {
        headers['Authorization'] = `Bearer ${geminiApiKey}`;
      }

      const embedRes = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'models/gemini-embedding-2',
          content: { parts: [{ text: contentToEmbed }] }
        })
      });

      if (!embedRes.ok) {
        throw new Error(`Failed to embed: ${await embedRes.text()}`);
      }

      const embedData = await embedRes.json();
      const embedding = embedData.embedding.values;

      // Update the college with the new embedding
      const { error: updateError } = await supabase
        .from('colleges')
        .update({ embedding })
        .eq('id', college.id);

      if (updateError) {
        console.error(`Error updating embedding for ${college.name}:`, updateError);
      } else {
        console.log(`✅ Success for ${college.name}`);
      }

    } catch (e) {
      console.error(`Failed to process ${college.name}:`, e);
    }
    
    // Add a small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('Sync complete!');
}

syncEmbeddings();
