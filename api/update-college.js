import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zmsqbysmpxkqeoapxnbo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FieXNtcHhrcWVvYXB4bmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODE0NDAsImV4cCI6MjA5MTc1NzQ0MH0.iN_FeepWWIXZmv-ofgkdv3gAXali77yebxGdqjBe8pI';
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiApiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6K21MPFoskW53bsL3qh5mt3ZN4cWhiWlZ5PxlFBTs12gQ';

export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const college = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'Missing college id' });
  }

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

    res.status(200).json({ college: updatedCollege });
  } catch (err) {
    console.error("Update College Error:", err);
    res.status(500).json({ error: "Failed to update college." });
  }
}
