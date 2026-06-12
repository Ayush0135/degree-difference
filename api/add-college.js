import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zmsqbysmpxkqeoapxnbo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FieXNtcHhrcWVvYXB4bmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODE0NDAsImV4cCI6MjA5MTc1NzQ0MH0.iN_FeepWWIXZmv-ofgkdv3gAXali77yebxGdqjBe8pI';
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiApiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6K21MPFoskW53bsL3qh5mt3ZN4cWhiWlZ5PxlFBTs12gQ';
const GOOGLE_API_KEY = "AIzaSyAwiu1_3qQbwMLDFFMtNQ4dYxrF5a62VoY";
const CX = "57f7ee5d76e55489b";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}
