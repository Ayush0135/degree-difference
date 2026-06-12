import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zmsqbysmpxkqeoapxnbo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FieXNtcHhrcWVvYXB4bmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODE0NDAsImV4cCI6MjA5MTc1NzQ0MH0.iN_FeepWWIXZmv-ofgkdv3gAXali77yebxGdqjBe8pI';
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiApiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6K21MPFoskW53bsL3qh5mt3ZN4cWhiWlZ5PxlFBTs12gQ';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { formData } = req.body;

  if (!formData || !formData.email) {
    return res.status(400).json({ error: "Missing counselor form data" });
  }

  try {
    // Generate text to embed based on counselor profile
    const contentToEmbed = `
      Name: ${formData.fullName || ''}
      Specialization: ${formData.specialization || ''}
      Experience: ${formData.experience || ''} years
      Students Counseled: ${formData.studentsCounseled || ''}
      Location: ${formData.city || ''}, ${formData.state || ''}, ${formData.country || ''}
      Organization: ${formData.orgName || ''}
      Designation: ${formData.designation || ''}
    `.trim();

    let embedding = null;
    const embedUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${geminiApiKey}`;
    
    const embedRes = await fetch(embedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-2',
        content: { parts: [{ text: contentToEmbed }] }
      })
    });

    if (embedRes.ok) {
      const embedData = await embedRes.json();
      if (embedData.embedding && embedData.embedding.values) {
        embedding = embedData.embedding.values;
      }
    } else {
      console.error("Failed to generate embedding for counselor");
    }

    // Insert into Supabase
    const dbPayload = {
      data: formData,
      status: 'pending'
    };

    if (embedding) {
      dbPayload.embedding = embedding;
    }

    const { data: newCounselor, error } = await supabase
      .from('counselor_applications')
      .insert(dbPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ success: true, application: newCounselor });
  } catch (err) {
    console.error("Register Counselor Error:", err);
    res.status(500).json({ error: "Failed to register counselor." });
  }
}
