const groqApiKey = process.env.GROQ_API_KEY || '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';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    res.status(200).json({ response: reply });

  } catch (error) {
    console.error("Chat College Error:", error);
    res.status(500).json({ error: "Failed to generate chat response" });
  }
}
