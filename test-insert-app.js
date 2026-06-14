import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testInsert() {
  const payload = {
    student_id: `student-${Date.now()}`,
    student_name: 'Test Student',
    student_email: 'test@example.com',
    student_phone: '1234567890',
    college_id: 'col-1',
    college_name: 'Test College',
    course: 'B.Tech',
    status: 'pending',
    applied_date: new Date().toISOString()
  };

  const { data, error } = await supabase.from('applications').insert([payload]);
  
  if (error) {
    console.error('SUPABASE ERROR:', JSON.stringify(error, null, 2));
  } else {
    console.log('SUCCESS:', data);
  }
}

testInsert();
