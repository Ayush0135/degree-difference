import { createClient } from '@supabase/supabase-js';
import type { College, Application, Query, CounselorApplication } from '../types';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseAnonKey.length > 20);
}

export const supabase = isSupabaseConfigured() ? createClient(supabaseUrl, supabaseAnonKey) : null;

// COLLEGES
export async function fetchColleges(): Promise<College[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('colleges').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(transformCollegeFromDB);
}

export async function addCollegeToDB(college: Omit<College, 'id'>): Promise<College | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('colleges').insert([transformCollegeToDB(college)]).select().single();
  if (error) return null;
  return transformCollegeFromDB(data);
}

export async function deleteCollegeFromDB(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('colleges').delete().eq('id', id);
  return !error;
}

// Transform helpers
function safeArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // If it's a PG array literal like {A,B} or just comma separated
      return val.replace(/^\{|\}$/g, '').split(',').map(s => s.trim());
    }
  }
  return [];
}

function transformCollegeFromDB(data: any): College {
  return {
    id: data.id,
    name: data.name,
    location: data.location,
    city: data.city,
    state: data.state,
    type: data.type,
    affiliation: data.affiliation,
    established: data.established,
    rating: data.rating,
    totalSeats: data.total_seats,
    coursesOffered: safeArray(data.courses_offered),
    facilities: safeArray(data.facilities),
    fees: { min: data.fees_min, max: data.fees_max },
    image: data.image,
    description: data.description,
    nirf_rank: data.nirf_rank,
    accreditation: safeArray(data.accreditation),
    placements: data.avg_package ? {
      averagePackage: data.avg_package,
      highestPackage: data.highest_package,
      placementRate: data.placement_rate,
    } : undefined,
    website: data.website,
    campusSize: data.campus_size,
    hostelDetails: data.hostel_details,
    foodQuality: data.food_quality,
    gymFacilities: data.gym_facilities,
    collegeLifeReview: data.college_life_review,
    scholarshipsAvailable: data.scholarships_available,
    placementReview: data.placement_review,
  };
}

function transformCollegeToDB(college: any): any {
  return {
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
    embedding: college.embedding || null,
  };
}

// APPLICATIONS
export async function fetchApplicationsFromDB(studentId?: string): Promise<Application[]> {
  if (!supabase) return [];
  
  let query = supabase.from('applications').select('*').order('created_at', { ascending: false });
  if (studentId) {
    query = query.eq('student_id', studentId);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
  
  return (data || []).map(app => ({
    id: app.id,
    studentId: app.student_id,
    studentName: app.student_name,
    studentEmail: app.student_email,
    studentPhone: app.student_phone,
    collegeId: app.college_id,
    collegeName: app.college_name,
    course: app.course,
    studentDob: app.student_dob,
    studentGender: app.student_gender,
    studentCity: app.student_city,
    highSchoolMarks: app.high_school_marks,
    status: app.status,
    appliedDate: app.applied_date,
    documents: typeof app.documents === 'string' ? JSON.parse(app.documents) : (app.documents || []),
    counselorId: app.counselor_id,
    assignedCounselorName: app.assigned_counselor_name,
    counselorNotes: app.counselor_notes,
    scholarshipAmount: app.scholarship_amount,
    scholarshipDetails: app.scholarship_details,
    incentiveAmount: app.counselor_incentive,
    progress: (typeof app.progress === 'string' ? JSON.parse(app.progress) : app.progress) || { currentStage: 'Application Received', step: 1, totalSteps: 5 }
  }));
}

export async function addApplicationToDB(app: Omit<Application, 'id'>): Promise<Application | null> {
  if (!supabase) return null;
  
  const payload = {
    student_id: app.studentId,
    student_name: app.studentName,
    student_email: app.studentEmail,
    student_phone: app.studentPhone,
    college_id: app.collegeId,
    college_name: app.collegeName,
    course: app.course,
    student_dob: app.studentDob,
    student_gender: app.studentGender,
    student_city: app.studentCity,
    high_school_marks: app.highSchoolMarks,
    status: app.status,
    applied_date: app.appliedDate,
    documents: app.documents,
    counselor_id: app.counselorId,
    assigned_counselor_name: app.assignedCounselorName,
    counselor_notes: app.counselorNotes,
    scholarship_amount: app.scholarshipAmount,
    scholarship_details: app.scholarshipDetails,
    counselor_incentive: app.incentiveAmount,
    progress: app.progress
  };

  const { data, error } = await supabase.from('applications').insert([payload]).select().single();
  
  if (error) {
    console.error('Error adding application:', error);
    return null;
  }
  
  return {
    ...app,
    id: data.id
  } as Application;
}

export async function updateApplicationStatusInDB(id: string, status: string): Promise<boolean> {
  if (!supabase) return false;
  
  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating application status:', error);
    return false;
  }
  return true;
}

export async function updateApplicationScholarshipInDB(id: string, amount: number, details: string): Promise<boolean> {
  if (!supabase) return false;
  
  const { error } = await supabase
    .from('applications')
    .update({ scholarship_amount: amount, scholarship_details: details })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating scholarship:', error);
    return false;
  }
  return true;
}

export async function updateApplicationCounselorInDB(id: string, counselorId: string, counselorName: string): Promise<boolean> {
  if (!supabase) return false;
  
  const { error } = await supabase
    .from('applications')
    .update({ counselor_id: counselorId, assigned_counselor_name: counselorName })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating counselor:', error);
    return false;
  }
  return true;
}

export async function updateApplicationIncentiveInDB(id: string, amount: number): Promise<boolean> {
  if (!supabase) return false;
  
  const { error } = await supabase
    .from('applications')
    .update({ counselor_incentive: amount })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating incentive:', error);
    return false;
  }
  return true;
}

export async function updateApplicationProgressInDB(id: string, progress: any, status: string): Promise<boolean> {
  if (!supabase) return false;
  
  const { error } = await supabase
    .from('applications')
    .update({ progress, status })
    .eq('id', id);
    
  if (error) {
    console.error('Error updating progress:', error);
    return false;
  }
  return true;
}

export async function uploadDocumentToDB(file: File, applicationId: string, currentDocs: any[]): Promise<any[] | null> {
  if (!supabase) return null;
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${applicationId}-${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, file);
    
  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    return null;
  }
  
  const { data: publicUrlData } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName);
    
  const newDoc = {
    id: `doc-${Date.now()}`,
    name: file.name,
    type: fileExt?.toLowerCase() === 'pdf' ? 'pdf' : 'image',
    url: publicUrlData.publicUrl,
    uploadedAt: new Date().toISOString()
  };
  
  const updatedDocs = [...currentDocs, newDoc];
  
  const { error: updateError } = await supabase
    .from('applications')
    .update({ documents: updatedDocs })
    .eq('id', applicationId);
    
  if (updateError) {
    console.error('Error linking document to application:', updateError);
    return null;
  }
  
  return updatedDocs;
}

// QUERIES
export async function fetchQueriesFromDB(studentId?: string): Promise<Query[]> {
  if (!supabase) return [];
  
  let query = supabase.from('queries').select('*').order('created_at', { ascending: false });
  if (studentId) {
    query = query.eq('student_id', studentId);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching queries:', error);
    return [];
  }
  if (!data) return [];
  
  return (data || []).map(q => ({
    id: q.id,
    studentId: q.student_id,
    studentName: q.student_name,
    studentEmail: q.student_email,
    subject: q.subject,
    message: q.message,
    status: q.status,
    createdDate: q.created_date,
    response: q.response,
    respondedBy: q.responded_by,
    respondedDate: q.responded_date
  }));
}

export async function addQueryToDB(q: Omit<Query, 'id'>): Promise<Query | null> {
  if (!supabase) return null;
  
  const payload = {
    student_id: q.studentId,
    student_name: q.studentName,
    student_email: q.studentEmail,
    subject: q.subject,
    message: q.message,
    status: q.status,
    created_date: q.createdDate
  };

  const { data, error } = await supabase.from('queries').insert([payload]).select().single();
  
  if (error) {
    console.error('Error adding query:', error);
    return null;
  }
  
  return {
    ...q,
    id: data.id
  } as Query;
}

// Mocks
export async function fetchApplications(): Promise<Application[]> { return []; }
export async function updateApplicationInDB(_1: string, _2: any) { return false; }
export async function fetchQueries(): Promise<Query[]> { return []; }
export async function respondToQueryInDB(_1: string, _2: string, _3: string) { return false; }
export async function fetchFavorites(_: string): Promise<string[]> { return []; }
export async function addFavorite(_1: string, _2: string) { return false; }
export async function removeFavorite(_1: string, _2: string) { return false; }

// USERS
export async function getUserByEmail(email: string): Promise<any | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
  if (error) return null;
  return data;
}

export async function createUser(user: { name: string, email: string, role: string, password?: string }): Promise<any | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('users').insert([user]).select().single();
  if (error) {
    console.error('Error creating user:', error);
    return null;
  }
  return data;
}

export async function fetchCounselorsFromDB(): Promise<any[]> {
  if (!supabase) return [];
  const { data: users, error: uError } = await supabase.from('users').select('*').eq('role', 'counselor');
  if (uError || !users) return [];

  const { data: applications, error: aError } = await supabase.from('applications').select('counselor_id, status').eq('status', 'approved');
  const appCounts: Record<string, number> = {};
  if (!aError && applications) {
    applications.forEach(app => {
      if (app.counselor_id) {
        appCounts[app.counselor_id] = (appCounts[app.counselor_id] || 0) + 1;
      }
    });
  }

  return users.map(u => {
    const realAdmissions = appCounts[u.id] || 0;
    const fakeAdmissions = u.fake_admissions_count || 0;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      password: u.password,
      assignedStudents: [],
      specialization: [],
      realAdmissions,
      fakeAdmissions,
      totalAdmissions: realAdmissions + fakeAdmissions
    };
  });
}

export async function fetchSubadminsFromDB(): Promise<any[]> {
  if (!supabase) return [];
  const val = await fetchPlatformSettings('subadmins_data');
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch(e) {
    return [];
  }
}

export async function addSubadminToDB(email: string): Promise<any | null> {
  if (!supabase) return null;
  const current = await fetchSubadminsFromDB();
  const newUser = {
    id: `subadmin-${Date.now()}`,
    name: email.split('@')[0],
    email: email,
    role: 'subadmin'
  };
  current.push(newUser);
  const success = await updatePlatformSettings('subadmins_data', JSON.stringify(current));
  if (success) return newUser;
  return null;
}

export async function removeSubadminFromDB(id: string): Promise<boolean> {
  if (!supabase) return true;
  const current = await fetchSubadminsFromDB();
  const next = current.filter((u: any) => u.id !== id);
  return await updatePlatformSettings('subadmins_data', JSON.stringify(next));
}

export async function updateCounselorFakeAdmissionsInDB(id: string, count: number): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('users').update({ fake_admissions_count: count }).eq('id', id);
  if (error) {
    console.error('Error updating fake admissions:', error);
    return false;
  }
  return true;
}

// COUNSELOR APPLICATIONS
export async function submitCounselorApplication(appData: Omit<CounselorApplication, 'id' | 'status' | 'created_at'>): Promise<boolean> {
  if (!supabase) return false;
  
  const payload = {
    full_name: appData.fullName,
    gender: appData.gender,
    dob: appData.dob,
    aadhaar: appData.aadhaar,
    pan: appData.pan,
    mobile: appData.mobile,
    alt_mobile: appData.altMobile || null,
    whatsapp: appData.whatsapp,
    email: appData.email,
    address: appData.address,
    state: appData.state,
    city: appData.city,
    pincode: appData.pincode,
    org_name: appData.orgName || null,
    designation: appData.designation,
    experience: appData.experience,
    specialization: appData.specialization,
    students_counseled: appData.studentsCounseled || null,
    acc_holder: appData.accHolder,
    bank_name: appData.bankName,
    acc_number: appData.accNumber,
    ifsc: appData.ifsc,
    status: 'pending'
  };

  const { error } = await supabase.from('counselor_applications').insert([payload]);
  
  if (error) {
    console.error('Error submitting counselor application:', error);
    return false;
  }
  return true;
}

export async function fetchCounselorApplicationsFromDB(): Promise<CounselorApplication[]> {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('counselor_applications')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching counselor applications:', error);
    return [];
  }
  
  if (!data) return [];
  
  return data.map(app => ({
    id: app.id,
    fullName: app.full_name,
    gender: app.gender,
    dob: app.dob,
    aadhaar: app.aadhaar,
    pan: app.pan,
    mobile: app.mobile,
    altMobile: app.alt_mobile,
    email: app.email,
    whatsapp: app.whatsapp,
    address: app.address,
    state: app.state,
    city: app.city,
    pincode: app.pincode,
    orgName: app.org_name,
    designation: app.designation,
    experience: app.experience,
    specialization: app.specialization,
    studentsCounseled: app.students_counseled,
    accHolder: app.acc_holder,
    bankName: app.bank_name,
    accNumber: app.acc_number,
    ifsc: app.ifsc,
    status: app.status,
    created_at: app.created_at
  }));
}

export async function approveCounselorApplicationInDB(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('counselor_applications')
    .update({ status: 'approved' })
    .eq('id', id);
  return !error;
}

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  if (!supabase) return null;
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { 
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg'
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    return null;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function updateUserProfile(userId: string, updates: any): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('users').update(updates).eq('id', userId);
  
  if (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
  return true;
}

// SETTINGS
export async function fetchPlatformSettings(key: string): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('platform_settings').select('value').eq('key', key).single();
  if (error || !data) return null;
  return data.value;
}

export async function updatePlatformSettings(key: string, value: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('platform_settings').upsert({ key, value }, { onConflict: 'key' });
  if (error) {
    console.error('Error updating platform setting:', error);
    return false;
  }
  return true;
}

// COUNSELOR TASKS
export async function fetchCounselorTasks(counselorId: string): Promise<any[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('counselor_tasks').select('*').eq('counselor_id', counselorId).order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  return data || [];
}

export async function addCounselorTask(counselorId: string, text: string, dueDate: string | null = null): Promise<any | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('counselor_tasks').insert([{ counselor_id: counselorId, task_text: text, due_date: dueDate }]).select().single();
  if (error) {
    console.error('Error adding task:', error);
    return null;
  }
  return data;
}

export async function updateCounselorTask(id: string, isCompleted: boolean): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('counselor_tasks').update({ is_completed: isCompleted }).eq('id', id);
  if (error) return false;
  return true;
}

export async function deleteCounselorTask(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('counselor_tasks').delete().eq('id', id);
  if (error) return false;
  return true;
}

// APPLICATION NOTES (Messaging)
export async function fetchApplicationNotes(appId: string): Promise<any[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('application_notes').select('*').eq('application_id', appId).order('created_at', { ascending: true });
  if (error) return [];
  return data || [];
}

export async function addApplicationNote(appId: string, senderId: string, senderRole: string, message: string): Promise<any | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('application_notes').insert([{ application_id: appId, sender_id: senderId, sender_role: senderRole, message }]).select().single();
  if (error) return null;
  return data;
}

// COUNSELOR BADGES
export async function fetchCounselorBadges(counselorId: string): Promise<any[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('counselor_badges').select('*').eq('counselor_id', counselorId);
  if (error) return [];
  return data || [];
}

export async function awardCounselorBadge(counselorId: string, badgeType: string, badgeName: string, iconUrl: string): Promise<boolean> {
  if (!supabase) return false;
  // Use upsert to avoid duplicate badges
  const { error } = await supabase.from('counselor_badges').upsert(
    [{ counselor_id: counselorId, badge_type: badgeType, badge_name: badgeName, icon_url: iconUrl }],
    { onConflict: 'counselor_id,badge_type' }
  );
  return !error;
}
