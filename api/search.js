import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zmsqbysmpxkqeoapxnbo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FieXNtcHhrcWVvYXB4bmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODE0NDAsImV4cCI6MjA5MTc1NzQ0MH0.iN_FeepWWIXZmv-ofgkdv3gAXali77yebxGdqjBe8pI';
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiApiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6K21MPFoskW53bsL3qh5mt3ZN4cWhiWlZ5PxlFBTs12gQ';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Missing query" });
    }

    // 1. Generate embedding for query
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${geminiApiKey}`;
    const embedRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-2',
        content: { parts: [{ text: query }] }
      })
    });

    if (!embedRes.ok) {
      const errText = await embedRes.text();
      console.error("Gemini API Error:", errText);
      return res.status(500).json({ error: "Failed to embed query" });
    }

    const embedData = await embedRes.json();
    const queryVector = embedData.embedding.values;

    // 2. Perform vector search in Supabase
    const { data: matches, error } = await supabase.rpc('match_colleges', {
      query_embedding: queryVector,
      match_threshold: 0.5,
      match_count: 10
    });

    if (error) {
      console.error("Supabase RPC Error:", error);
      return res.status(500).json({ error: "Database search failed" });
    }

    // Return the matched IDs
    const matchedIds = matches.map(m => m.id);
    return res.status(200).json({ matches: matchedIds });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Internal server error during search." });
  }
}
