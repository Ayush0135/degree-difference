import 'dotenv/config';
import { addApplicationToDB } from './src/lib/supabase.ts';

async function testInsert() {
  const newApp = {
    studentId: 'student-test',
    studentName: 'Test Student',
    studentEmail: 'test@example.com',
    studentPhone: '1234567890',
    collegeId: 'c1',
    collegeName: 'Test College',
    course: 'BTech',
    status: 'pending',
    appliedDate: new Date().toISOString(),
    documents: [],
    progress: {
      currentStage: 'Application Received',
      step: 1,
      totalSteps: 5
    }
  };
  
  const res = await addApplicationToDB(newApp);
  console.log('Added:', res);
}

testInsert();
