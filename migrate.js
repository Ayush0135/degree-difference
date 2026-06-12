import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const groqApiKey = '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';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse Excel
const file = '35 College List.xlsx';
const workbook = xlsx.readFile(file);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

// Row 3 (index 2) is headers
// [ 'City & State', 'College Name', 'Stream', 'Course', 'Specializations', 'Semester Fee', 'Fee (Annual)', 'Duration', 'Placement Partners', 'Special Note' ]
const rows = rawData.slice(3).filter(r => r[1]); // Skip headers, ensure college name exists

const collegeGroups = {};

rows.forEach(row => {
  const cityState = row[0] || '';
  const collegeName = row[1];
  const stream = row[2] || '';
  const course = row[3] || '';
  const spec = row[4] || '';
  const feeAnnualStr = row[6] || '';
  const placementPartners = row[8] || '';

  // Parse fee
  let fee = 0;
  if (typeof feeAnnualStr === 'string') {
    fee = parseInt(feeAnnualStr.replace(/[^0-9]/g, ''), 10) || 0;
  } else if (typeof feeAnnualStr === 'number') {
    fee = feeAnnualStr;
  }

  if (!collegeGroups[collegeName]) {
    collegeGroups[collegeName] = {
      name: collegeName,
      location: cityState,
      type: stream,
      courses: new Set(),
      fees: [],
      partners: new Set()
    };
  }

  if (course) collegeGroups[collegeName].courses.add(`${course} ${spec}`.trim());
  if (fee > 0) collegeGroups[collegeName].fees.push(fee);
  if (placementPartners) collegeGroups[collegeName].partners.add(placementPartners);
});

const colleges = Object.values(collegeGroups).map(c => {
  const fees = c.fees.length > 0 ? c.fees : [0];
  const minFee = Math.min(...fees);
  const maxFee = Math.max(...fees);
  
  let city = c.location;
  let state = '';
  if (c.location.includes(',')) {
    const parts = c.location.split(',');
    city = parts[0].trim();
    state = parts[1].trim();
  }

  return {
    name: c.name,
    location: c.location,
    city,
    state,
    type: c.type || 'Engineering',
    coursesOffered: Array.from(c.courses).slice(0, 5), // Take top 5 to keep prompt short
    fees: { min: minFee, max: maxFee },
    placementPartners: Array.from(c.partners).join(', ')
  };
});

console.log(`Found ${colleges.length} unique colleges. Starting processing...`);

const promptTemplate = `
You are a helpful assistant populating a college directory database. 
I have extracted basic data for a list of colleges from an Excel file:

{colleges_data}

Please generate a beautifully enhanced and realistic college profile for EACH college as a JSON array strictly adhering to the following schema. Use realistic placeholder data (like facilities, description, ratings, NIRF rank, placements, and reviews) to make the profile look rich and complete.

EXPECTED JSON SCHEMA FOR EACH OBJECT IN THE ARRAY:
{
  "name": "Exact College Name as provided",
  "location": "Location as provided",
  "city": "Parsed City",
  "state": "Parsed State",
  "type": "Stream as provided",
  "affiliation": "String (e.g. Autonomous, State University)",
  "established": 2000,
  "rating": 4.5,
  "total_seats": 1000,
  "courses_offered": ["Course 1", "Course 2"],
  "facilities": ["Library", "Hostel", "Wi-Fi"],
  "fees_min": 50000,
  "fees_max": 150000,
  "image": "String URL (find a realistic unsplash photo of a college campus)",
  "description": "2-3 sentences of appealing description",
  "nirf_rank": 50,
  "accreditation": ["NAAC A", "NBA"],
  "avg_package": 800000,
  "highest_package": 2500000,
  "placement_rate": 90,
  "website": "www.example.edu",
  "campus_size": "100 Acres",
  "hostel_details": "Brief detail",
  "food_quality": "Brief detail",
  "gym_facilities": "Brief detail",
  "college_life_review": "Brief positive review",
  "scholarships_available": true,
  "placement_review": "Brief positive review"
}

Output ONLY the JSON array containing an object for each college provided. Do not wrap it in markdown block quotes like \`\`\`json.
`;

async function processChunk(chunk) {
  // First filter out existing colleges to save tokens
  const collegesToProcess = [];
  for (const c of chunk) {
    const { data: existing } = await supabase.from('colleges').select('id').eq('name', c.name).single();
    if (existing) {
      console.log(`⏩ Skipped (Already exists): ${c.name}`);
    } else {
      collegesToProcess.push(c);
    }
  }

  if (collegesToProcess.length === 0) return;

  const collegesDataString = collegesToProcess.map((c, idx) => `
COLLEGE ${idx + 1}:
NAME: ${c.name}
LOCATION: ${c.location}
CITY: ${c.city}
STATE: ${c.state}
TYPE: ${c.type}
COURSES: ${c.coursesOffered.join(', ')}
PLACEMENT PARTNERS: ${c.placementPartners}
MIN_FEE: ${c.fees.min}
MAX_FEE: ${c.fees.max}
`).join('\\n');

  const prompt = promptTemplate.replace('{colleges_data}', collegesDataString);

  try {
    let attempt = 0;
    while (attempt < 5) {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 429) {
          console.warn(`Rate limited on chunk. Retrying in 10s...`);
          await new Promise(r => setTimeout(r, 10000));
          attempt++;
          continue;
        }
        console.error(`Groq error for chunk:`, errText);
        return null;
      }

      const groqData = await res.json();
      let jsonStr = groqData.choices[0].message.content;
      
      // Sometimes it wraps the array in an object like {"colleges": [...]}
      let dbPayloads = JSON.parse(jsonStr);
      if (!Array.isArray(dbPayloads)) {
        if (dbPayloads.colleges && Array.isArray(dbPayloads.colleges)) {
          dbPayloads = dbPayloads.colleges;
        } else if (dbPayloads.data && Array.isArray(dbPayloads.data)) {
          dbPayloads = dbPayloads.data;
        } else {
          // Wrap in array if it returned a single object
          dbPayloads = [dbPayloads];
        }
      }

      // Format payload
      const payloadsToInsert = dbPayloads.map(dbPayload => {
         return {
            ...dbPayload,
            slug: dbPayload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
         };
      });

      // insert to supabase
      const { data, error } = await supabase.from('colleges').insert(payloadsToInsert).select();
      if (error) {
        console.error(`Supabase error for chunk:`, error);
        return null;
      }
      console.log(`✅ Successfully processed and inserted chunk with ${payloadsToInsert.length} colleges.`);
      return data;
    }
    console.error(`Failed after 5 attempts for chunk`);
    return null;
  } catch (err) {
    console.error(`Failed processing chunk:`, err.message);
    return null;
  }
}

async function run() {
  console.log("Processing colleges in chunks of 3...");
  const chunkSize = 3;
  for (let i = 0; i < colleges.length; i += chunkSize) {
    const chunk = colleges.slice(i, i + chunkSize);
    console.log(`[Chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(colleges.length/chunkSize)}] Processing...`);
    await processChunk(chunk);
    // slight delay between chunks
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log("Migration Complete!");
}

run();
