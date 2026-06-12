import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load .env
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zmsqbysmpxkqeoapxnbo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inptc3FieXNtcHhrcWVvYXB4bmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODE0NDAsImV4cCI6MjA5MTc1NzQ0MH0.iN_FeepWWIXZmv-ofgkdv3gAXali77yebxGdqjBe8pI';
const supabase = createClient(supabaseUrl, supabaseKey);

const GOOGLE_API_KEY = "AIzaSyAwiu1_3qQbwMLDFFMtNQ4dYxrF5a62VoY";
const CX = "57f7ee5d76e55489b";

async function fetchImageForCollege(collegeName) {
  try {
    // Search Wikipedia specifically to avoid hotlinking protection
    const query = encodeURIComponent(`${collegeName} logo site:wikipedia.org`);
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${CX}&q=${query}&searchType=image&num=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].link; 
    }
    return null;
  } catch (err) {
    return null;
  }
}

function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=400&font-size=0.33`;
}

async function updateCollegeImages() {
  console.log("Fetching colleges from Supabase...");
  const { data: colleges, error } = await supabase.from('colleges').select('id, name, image');
  
  if (error) {
    console.error("Error fetching colleges:", error);
    return;
  }
  
  console.log(`Found ${colleges.length} colleges. Starting forced update for ALL...`);
  
  for (const college of colleges) {
    console.log(`Updating ${college.name}...`);
    
    let newImageUrl = await fetchImageForCollege(college.name);
    
    if (!newImageUrl) {
      console.log(`No Wikipedia image found for ${college.name}, falling back to Avatar`);
      newImageUrl = getAvatarUrl(college.name);
    }
    
    const { error: updateError } = await supabase
      .from('colleges')
      .update({ image: newImageUrl })
      .eq('id', college.id);
      
    if (updateError) {
      console.error(`Failed to update DB for ${college.name}:`, updateError);
    } else {
      console.log(`Successfully updated ${college.name} -> ${newImageUrl}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log("Update complete!");
}

updateCollegeImages();
