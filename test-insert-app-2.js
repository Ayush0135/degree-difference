import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const payload = {
    student_id: 'test-student-' + Date.now(),
    student_name: 'Test Student',
    student_email: 'test@example.com',
    student_phone: '1234567890',
    college_id: '1',
    college_name: 'Test College',
    course: 'B.Tech',
    student_dob: '2000-01-01',
    student_gender: 'Male',
    student_city: 'Delhi',
    high_school_marks: '90%',
    status: 'pending',
    applied_date: new Date().toISOString(),
    documents: [],
    counselor_id: 'counselor-1',
    assigned_counselor_name: 'Test Counselor',
    counselor_notes: '',
    scholarship_amount: 0,
    scholarship_details: '',
    counselor_incentive: 0,
    progress: { currentStage: 'Application Received', step: 1, totalSteps: 5 }
  };

  const { data, error } = await supabase.from('applications').insert([payload]).select().single();
  console.log('Insert Result:', { data, error });
}

testInsert();
