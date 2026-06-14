export interface College {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  type: 'Engineering' | 'Medical' | 'Business' | 'Arts' | 'Science' | 'Law';
  affiliation: string;
  established: number;
  rating: number;
  totalSeats: number;
  coursesOffered: string[];
  facilities: string[];
  fees: {
    min: number;
    max: number;
  };
  image: string;
  description: string;
  nirf_rank?: number;
  accreditation: string[];
  placements?: {
    averagePackage: number;
    highestPackage: number;
    placementRate: number;
  };
  website?: string;
  campusSize?: string;
  hostelDetails?: string;
  foodQuality?: string;
  gymFacilities?: string;
  collegeLifeReview?: string;
  scholarshipsAvailable?: boolean;
  placementReview?: string;
  embedding?: number[];
}

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  collegeId: string;
  collegeName: string;
  course: string;
  studentDob?: string;
  studentGender?: string;
  studentCity?: string;
  highSchoolMarks?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'counseling';
  appliedDate: string;
  documents: (string | { id: string; name: string; type: string; url: string; uploadedAt: string })[];
  counselorId?: string;
  assignedCounselorName?: string;
  counselorNotes?: string;
  scholarshipAmount?: number;
  scholarshipDetails?: string;
  incentiveAmount?: number;
  progress: {
    step: number;
    totalSteps: number;
    currentStage: string;
  };
}

export interface Query {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdDate: string;
  response?: string;
  respondedBy?: string;
  respondedDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'counselor' | 'subadmin';
  phone?: string;
  avatar?: string;
}

export interface Counselor extends User {
  role: 'counselor';
  password?: string;
  assignedStudents: string[];
  specialization: string[];
  realAdmissions?: number;
  fakeAdmissions?: number;
  totalAdmissions?: number;
}

export type FilterOptions = {
  search: string;
  type: string[];
  location: string[];
  fees: { min: number; max: number };
  rating: number;
};

export interface CounselorApplication {
  id?: string;
  fullName: string;
  gender: string;
  dob: string;
  aadhaar: string;
  pan: string;
  mobile: string;
  altMobile?: string;
  email: string;
  whatsapp: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  orgName?: string;
  designation: string;
  experience: string;
  specialization: string;
  studentsCounseled?: string;
  accHolder: string;
  bankName: string;
  accNumber: string;
  ifsc: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}
