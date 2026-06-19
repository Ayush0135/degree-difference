import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zmsqbysmpxkqeoapxnbo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FieXNtcHhrcWVvYXB4bmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODE0NDAsImV4cCI6MjA5MTc1NzQ0MH0.iN_FeepWWIXZmv-ofgkdv3gAXali77yebxGdqjBe8pI';
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiApiKey = process.env.GEMINI_API_KEY || 'AIzaSyD4-uRzquwtN_yA8kHBISBgb5_WwuxxVyM';
const groqApiKey = process.env.GROQ_API_KEY || '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';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { city, program, budget, custom } = req.body;
    
    // Combine into a single semantic string
    const preferenceString = `A college located in ${city || 'any city'}, offering ${program || 'any program'} courses. Budget: ${budget ? 'under ' + budget : 'any budget'}. Extra preferences: ${custom || 'none'}`;

    // 1. Generate embedding for query via Gemini
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
        content: { parts: [{ text: preferenceString }] }
      })
    });

    if (!embedRes.ok) {
      throw new Error("Failed to embed query via Gemini");
    }

    const embedData = await embedRes.json();
    const queryVector = embedData.embedding.values;

    // 2. Perform vector search in Supabase
    const { data: matches, error: matchError } = await supabase.rpc('match_colleges', {
      query_embedding: queryVector,
      match_threshold: 0.1, // lower threshold to get enough results
      match_count: 5
    });

    if (matchError || !matches || matches.length === 0) {
      return res.status(200).json({ 
        response: "I couldn't find any exact matches in our directory for those specific preferences right now, but our counselors can still help you! Please adjust your filters or request direct counseling.", 
        colleges: [] 
      });
    }

    const matchedIds = matches.map(m => m.id);

    // 3. Fetch full college details for the matches
    const { data: fullColleges, error: fetchError } = await supabase
      .from('colleges')
      .select('*')
      .in('id', matchedIds);

    if (fetchError || !fullColleges) {
      throw new Error("Failed to fetch college profiles from DB");
    }

    // Sort to match the vector ranking order
    const sortedColleges = matchedIds.map(id => fullColleges.find(c => c.id === id)).filter(Boolean);

    // Clean up data sent to Groq to save tokens
    const collegesForGroq = sortedColleges.map(c => ({
      name: c.name,
      location: `${c.city}, ${c.state}`,
      type: c.type,
      courses: c.courses_offered,
      facilities: c.facilities,
      fees_min: c.fees_min,
      fees_max: c.fees_max,
      description: c.description
    }));

    // 4. Generate AI response via Gemini
    const geminiChatUrl = isBearer
      ? 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    const geminiChatResponse = await fetch(geminiChatUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: "You are an expert college admission counselor for 'DegreeDifference'. You MUST ONLY recommend the colleges provided in the data below. DO NOT invent, hallucinate, or mention any other colleges. Keep your response conversational, encouraging, and directly address the student. Format using markdown. Summarize why these matches fit the student's preferences." }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: `My preferences are: City: ${city || 'Any'}, Program: ${program || 'Any'}, Budget: ${budget ? 'Under ' + budget : 'Any'}, Extra: ${custom || 'None'}.\n\nHere are the best matches from our directory: ${JSON.stringify(collegesForGroq)}\n\nPlease explain why these are good matches.` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    if (!geminiChatResponse.ok) {
      const errText = await geminiChatResponse.text();
      console.error("Gemini API Error in ai-match chat:", errText);
      throw new Error("Failed to generate Gemini response");
    }

    const geminiChatData = await geminiChatResponse.json();
    const aiText = geminiChatData.candidates?.[0]?.content?.parts?.[0]?.text || "Here are some top recommendations based on your preferences!";

    res.status(200).json({ response: aiText, colleges: sortedColleges });

  } catch (error) {
    console.error("AI Matchmaker Error:", error);
    res.status(500).json({ error: "Internal server error during AI matchmaking." });
  }
}
