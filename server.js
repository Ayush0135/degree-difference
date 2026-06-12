import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = 3001;

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zmsqbysmpxkqeoapxnbo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FieXNtcHhrcWVvYXB4bmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODE0NDAsImV4cCI6MjA5MTc1NzQ0MH0.iN_FeepWWIXZmv-ofgkdv3gAXali77yebxGdqjBe8pI';
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiApiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6K21MPFoskW53bsL3qh5mt3ZN4cWhiWlZ5PxlFBTs12gQ';
const groqApiKey = process.env.GROQ_API_KEY || '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';
const GOOGLE_API_KEY = "AIzaSyAwiu1_3qQbwMLDFFMtNQ4dYxrF5a62VoY";
const CX = "57f7ee5d76e55489b";

// Resend initialization with the provided API key
const resend = new Resend('re_fDU7oDNr_HJQWegTM6L7G3w9hKZJYXX5c');

app.use(cors());
app.use(express.json());

app.post('/api/send-otp', async (req, res) => {
  const { email, otp, name } = req.body;

  if (!email || !otp || !name) {
    return res.status(400).json({ error: 'Email, OTP, and Name are required.' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'DegreeDifference <noreply@degreedifference.com>',
      to: [email],
      subject: 'Your DegreeDifference Verification Code',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to DegreeDifference, ${name}!</h2>
          <p>Thank you for signing up. Please use the following One-Time Password (OTP) to complete your verification process:</p>
          <div style="background-color: #f3f4f6; padding: 16px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 8px; letter-spacing: 4px; color: #0d9488;">
            ${otp}
          </div>
          <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">This code is valid for your current session.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Failed to send OTP.' });
  }
});

app.post('/api/enhance-college', async (req, res) => {
  const data = req.body;

  try {
    const prompt = `You are an expert educational consultant and copywriter.
Please review the following raw data submitted by an admin for a new college profile.
Your job is to fix any spelling or grammatical errors, improve the vocabulary to sound professional and appealing, and format the text clearly.

Raw Data:
- Description: ${data.description || ''}
- Hostel Details: ${data.hostelDetails || ''}
- Food Quality: ${data.foodQuality || ''}
- Gym Facilities: ${data.gymFacilities || ''}
- College Life Review: ${data.collegeLifeReview || ''}
- Placement Review: ${data.placementReview || ''}

Return ONLY a valid JSON object with the exact same keys, but with the enhanced text. Do not include markdown formatting like \`\`\`json or any other text.
{
  "description": "...",
  "hostelDetails": "...",
  "foodQuality": "...",
  "gymFacilities": "...",
  "collegeLifeReview": "...",
  "placementReview": "..."
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API Error:', errText);
      return res.status(500).json({ error: 'Failed to enhance data.' });
    }

    const groqData = await response.json();
    
    // Merge the enhanced data back into the original payload
    const jsonStr = groqData.choices[0].message.content;
    const finalData = { ...data, ...JSON.parse(jsonStr) };

    // After generating the enhanced data, also generate the vector embedding for it
    const contentToEmbed = `
      College Name: ${finalData.name}
      Location: ${finalData.location}
      Type: ${finalData.type}
      Courses: ${finalData.coursesOffered?.join(', ') || ''}
      Facilities: ${finalData.facilities?.join(', ') || ''}
      Description: ${finalData.description || ''}
    `.trim();

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
      finalData.embedding = embedData.embedding.values;
    } else {
      console.error("Failed to generate embedding during enhancement");
    }

    res.json({ data: finalData });
  } catch (error) {
    console.error('Enhancement error:', error);
    res.status(500).json({ error: 'Failed to enhance data' });
  }
});

app.post('/api/search', async (req, res) => {
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
    return res.json({ matches: matchedIds });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Internal server error during search." });
  }
});

app.post('/api/ai-match', async (req, res) => {
  try {
    const { city, program, budget, custom } = req.body;
    
    // Combine into a single semantic string
    const preferenceString = `A college located in ${city || 'any city'}, offering ${program || 'any program'} courses. Budget: ${budget ? 'under ' + budget : 'any budget'}. Extra preferences: ${custom || 'none'}`;

    // 1. Generate embedding for query via Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${geminiApiKey}`;
    const embedRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      return res.json({ 
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

    // 4. Generate AI response via Groq
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are an expert college admission counselor for 'DegreeDifference'. You MUST ONLY recommend the colleges provided in the data below. DO NOT invent, hallucinate, or mention any other colleges. Keep your response conversational, encouraging, and directly address the student. Format using markdown. Summarize why these matches fit the student's preferences."
          },
          {
            role: "user",
            content: `My preferences are: City: ${city || 'Any'}, Program: ${program || 'Any'}, Budget: ${budget ? 'Under ' + budget : 'Any'}, Extra: ${custom || 'None'}.\n\nHere are the best matches from our directory: ${JSON.stringify(collegesForGroq)}\n\nPlease explain why these are good matches.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq API Error in ai-match:", errText);
      throw new Error("Failed to generate Groq response");
    }

    const groqData = await groqResponse.json();
    const aiText = groqData.choices[0].message.content;

    res.json({ response: aiText, colleges: sortedColleges });

  } catch (error) {
    console.error("AI Matchmaker Error:", error);
    res.status(500).json({ error: "Internal server error during AI matchmaking." });
  }
});

app.post('/api/add-college', async (req, res) => {
  const college = req.body;
  
  try {
    // 1. Check and Fetch Logo if empty
    let imageUrl = college.image;
    if (!imageUrl) {
      const query = encodeURIComponent(`${college.name} logo site:wikipedia.org`);
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${CX}&q=${query}&searchType=image&num=1`;
      
      const response = await fetch(searchUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          imageUrl = data.items[0].link;
        }
      }
      
      // Fallback to UI-Avatars if Wikipedia fails
      if (!imageUrl) {
        imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(college.name)}&background=random&color=fff&size=400&font-size=0.33`;
      }
      
      college.image = imageUrl;
    }
    
    // 2. Generate Vector Embedding
    const semanticText = `Name: ${college.name}
Location: ${college.location}, ${college.city}, ${college.state}
Type: ${college.type}
Affiliation: ${college.affiliation}
Established: ${college.established}
Rating: ${college.rating}
Courses: ${Array.isArray(college.coursesOffered) ? college.coursesOffered.join(', ') : ''}
Facilities: ${Array.isArray(college.facilities) ? college.facilities.join(', ') : ''}
Fees: ${college.fees?.min || ''} to ${college.fees?.max || ''}
Description: ${college.description || ''}
NIRF Rank: ${college.nirf_rank || 'N/A'}
Placements: Average ${college.placements?.averagePackage || ''}, Highest ${college.placements?.highestPackage || ''}, Rate ${college.placements?.placementRate || ''}%`;

    const embedUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${geminiApiKey}`;
    const embedRes = await fetch(embedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-2',
        content: { parts: [{ text: semanticText }] }
      })
    });

    let embedding = null;
    if (embedRes.ok) {
      const embedData = await embedRes.json();
      embedding = embedData.embedding.values;
    } else {
      console.error("Failed to generate embedding during add-college");
    }

    // 3. Prepare payload for Supabase
    const dbPayload = {
      name: college.name,
      slug: college.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      location: college.location,
      city: college.city,
      state: college.state,
      type: college.type,
      affiliation: college.affiliation,
      established: college.established,
      rating: college.rating,
      total_seats: college.totalSeats,
      courses_offered: college.coursesOffered || [],
      facilities: college.facilities || [],
      fees_min: college.fees?.min || 0,
      fees_max: college.fees?.max || 0,
      image: college.image,
      description: college.description,
      nirf_rank: college.nirf_rank,
      accreditation: college.accreditation || [],
      avg_package: college.placements?.averagePackage || null,
      highest_package: college.placements?.highestPackage || null,
      placement_rate: college.placements?.placementRate || null,
      website: college.website,
      campus_size: college.campusSize,
      hostel_details: college.hostelDetails,
      food_quality: college.foodQuality,
      gym_facilities: college.gymFacilities,
      college_life_review: college.collegeLifeReview,
      scholarships_available: college.scholarshipsAvailable,
      placement_review: college.placementReview,
      embedding: embedding
    };

    // 4. Insert into Supabase
    const { data, error } = await supabase.from('colleges').insert([dbPayload]).select();
    
    if (error) {
      console.error("DB Insert Error:", error);
      return res.status(500).json({ error: "Database error" });
    }
    
    // Convert back to Frontend model to return
    const insertedCollege = {
      id: data[0].id,
      name: data[0].name,
      location: data[0].location,
      city: data[0].city,
      state: data[0].state,
      type: data[0].type,
      affiliation: data[0].affiliation,
      established: data[0].established,
      rating: data[0].rating,
      totalSeats: data[0].total_seats,
      coursesOffered: data[0].courses_offered || [],
      facilities: data[0].facilities || [],
      fees: { min: data[0].fees_min, max: data[0].fees_max },
      image: data[0].image,
      description: data[0].description,
      nirf_rank: data[0].nirf_rank,
      accreditation: data[0].accreditation || [],
      placements: data[0].avg_package ? {
        averagePackage: data[0].avg_package,
        highestPackage: data[0].highest_package,
        placementRate: data[0].placement_rate,
      } : undefined,
    };

    res.status(200).json({ success: true, college: insertedCollege });
  } catch (error) {
    console.error("Add College Error:", error);
    res.status(500).json({ error: "Failed to add college" });
  }
});

app.post('/api/chat-college', async (req, res) => {
  try {
    const { message, college, history } = req.body;
    
    // Construct the context about the college
    const collegeContext = `You are an expert AI admissions counselor representing ${college.name}.
Your job is to answer the user's questions specifically about this college based ONLY on the following data:

College Name: ${college.name}
Location: ${college.city}, ${college.state}
Type: ${college.type}
Affiliation: ${college.affiliation}
Established: ${college.established}
Rating: ${college.rating}/5.0
Total Seats: ${college.totalSeats}
NIRF Rank: ${college.nirf_rank || 'Not available'}

Fees: Minimum ₹${college.fees?.min || 'N/A'}, Maximum ₹${college.fees?.max || 'N/A'}
Courses Offered: ${college.coursesOffered?.join(', ') || 'Not available'}
Facilities: ${college.facilities?.join(', ') || 'Not available'}
Accreditations: ${college.accreditation?.join(', ') || 'Not available'}

Placements:
- Average Package: ₹${college.placements?.averagePackage ? (college.placements.averagePackage/100000) + ' Lakhs' : 'N/A'}
- Highest Package: ₹${college.placements?.highestPackage ? (college.placements.highestPackage/100000) + ' Lakhs' : 'N/A'}
- Placement Rate: ${college.placements?.placementRate || 'N/A'}%

Campus Size: ${college.campusSize || 'Not available'}
Hostel Details: ${college.hostelDetails || 'Not available'}
Food Quality: ${college.foodQuality || 'Not available'}
Gym Facilities: ${college.gymFacilities || 'Not available'}

Reviews:
- College Life: ${college.collegeLifeReview || 'Not available'}
- Placements: ${college.placementReview || 'Not available'}

Scholarships: ${college.scholarshipsAvailable || 'Not available'}
Website: ${college.website || 'Not available'}
Description: ${college.description || 'Not available'}

Instructions:
1. Be friendly, encouraging, and professional.
2. Use markdown formatting (bold, bullet points) to make your answer easy to read.
3. Answer the user's question using ONLY the data above.
4. If the user asks something not covered by the data above, say: "I don't have that specific information right now, but you can request a callback from our human counselors to learn more!" Do NOT make up information.
5. Keep your answer concise (under 150 words).`;

    // Map history to Groq format
    const messages = [
      { role: "system", content: collegeContext },
      ...(history || []).map(msg => ({ role: msg.role, content: msg.content })),
      { role: "user", content: message }
    ];

    const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
    const groqRes = await fetch(groqUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: messages,
        temperature: 0.5,
        max_tokens: 500
      })
    });

    if (!groqRes.ok) {
      throw new Error(`Groq API error: ${groqRes.statusText}`);
    }

    const groqData = await groqRes.json();
    const reply = groqData.choices[0].message.content;

    res.json({ response: reply });

  } catch (error) {
    console.error("Chat College Error:", error);
    res.status(500).json({ error: "Failed to generate chat response" });
  }
});

app.put('/api/update-college/:id', async (req, res) => {
  const { id } = req.params;
  const college = req.body;
  
  try {
    // 1. Generate Vector Embedding
    const semanticText = `Name: ${college.name}
Location: ${college.location}, ${college.city}, ${college.state}
Type: ${college.type}
Affiliation: ${college.affiliation}
Established: ${college.established}
Rating: ${college.rating}
Courses: ${Array.isArray(college.coursesOffered) ? college.coursesOffered.join(', ') : ''}
Facilities: ${Array.isArray(college.facilities) ? college.facilities.join(', ') : ''}
Fees: ${college.fees?.min || ''} to ${college.fees?.max || ''}
Description: ${college.description || ''}
NIRF Rank: ${college.nirf_rank || 'N/A'}
Placements: Average ${college.placements?.averagePackage || ''}, Highest ${college.placements?.highestPackage || ''}, Rate ${college.placements?.placementRate || ''}%`;

    const embedUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${geminiApiKey}`;
    const embedRes = await fetch(embedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-2',
        content: { parts: [{ text: semanticText }] }
      })
    });

    let embedding = null;
    if (embedRes.ok) {
      const embedData = await embedRes.json();
      embedding = embedData.embedding.values;
    } else {
      console.error("Failed to generate embedding during update-college");
    }

    const safeArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          return val.replace(/^\{|\}$/g, '').split(',').map(s => s.trim());
        }
      }
      return [];
    };

    // 2. Prepare payload for Supabase
    const dbPayload = {
      name: college.name,
      slug: college.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      location: college.location,
      city: college.city,
      state: college.state,
      type: college.type,
      affiliation: college.affiliation,
      established: college.established,
      rating: college.rating,
      total_seats: college.totalSeats,
      courses_offered: college.coursesOffered,
      facilities: safeArray(college.facilities),
      fees_min: college.fees?.min || 0,
      fees_max: college.fees?.max || 0,
      image: college.image,
      description: college.description,
      nirf_rank: college.nirf_rank,
      accreditation: college.accreditation,
      avg_package: college.placements?.averagePackage,
      highest_package: college.placements?.highestPackage,
      placement_rate: college.placements?.placementRate,
      website: college.website,
      campus_size: college.campusSize,
      hostel_details: college.hostelDetails,
      food_quality: college.foodQuality,
      gym_facilities: college.gymFacilities,
      college_life_review: college.collegeLifeReview,
      scholarships_available: college.scholarshipsAvailable,
      placement_review: college.placementReview,
    };
    if (embedding) {
      dbPayload.embedding = embedding;
    }

    const { data: updatedCollege, error } = await supabase
      .from('colleges')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ college: updatedCollege });
  } catch (err) {
    console.error("Update College Error:", err);
    res.status(500).json({ error: "Failed to update college." });
  }
});

app.post('/api/register-counselor', async (req, res) => {
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
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
