const geminiApiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6K21MPFoskW53bsL3qh5mt3ZN4cWhiWlZ5PxlFBTs12gQ';
const groqApiKey = process.env.GROQ_API_KEY || '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';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    res.status(200).json({ data: finalData });
  } catch (error) {
    console.error('Enhancement error:', error);
    res.status(500).json({ error: 'Failed to enhance data' });
  }
}
