import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollegeStore } from '../store/collegeStore';
import { useAdminStore } from '../store/adminStore';
import { GraduationCap, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentSelfRegister() {
  const { counselorId } = useParams<{ counselorId: string }>();
  const navigate = useNavigate();
  const { colleges } = useCollegeStore();
  const { manuallyRegisterStudent } = useAdminStore();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // We decode counselor name if passed via query, else we just use ID
  const searchParams = new URLSearchParams(window.location.search);
  const counselorName = searchParams.get('cName') || 'Your Counselor';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      studentId: `self-${Date.now()}`,
      studentName: formData.get('name') as string,
      studentEmail: formData.get('email') as string,
      studentPhone: formData.get('phone') as string,
      studentDob: formData.get('dob') as string,
      studentGender: formData.get('gender') as string,
      studentCity: formData.get('city') as string,
      highSchoolMarks: formData.get('marks') as string,
      course: formData.get('course') as string,
      collegeId: formData.get('college') as string,
      collegeName: colleges.find(c => c.id === formData.get('college'))?.name || '',
      counselorId: counselorId,
      assignedCounselorName: counselorName,
      status: 'pending' as any,
      appliedDate: new Date().toISOString(),
      documents: [],
      progress: {
        currentStage: 'Application Received',
        step: 1,
        totalSteps: 5
      }
    };

    await manuallyRegisterStudent(payload);
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful!</h2>
          <p className="text-slate-600 mb-8">Thank you for registering. {counselorName} will be in touch with you shortly.</p>
          <button onClick={() => window.location.href = '/'} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">Return Home</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-teal-600 mb-4">
            <GraduationCap className="h-10 w-10" />
            <span className="text-2xl font-black tracking-tight">Edu<span className="text-slate-900">Quest</span></span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Student Registration</h2>
          <p className="text-slate-500 text-sm">Registering with counselor: <strong>{counselorName}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input required name="name" className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
            <input type="email" name="email" className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-colors" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input required type="tel" name="phone" className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
            <input required type="date" name="dob" className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
            <select required name="gender" className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-colors">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">City / Address</label>
            <input required name="city" placeholder="e.g. New Delhi" className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">High School Marks (%)</label>
            <input required type="number" step="0.1" min="0" max="100" name="marks" placeholder="e.g. 85.5" className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target College</label>
            <select required name="college" className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-colors">
              <option value="">Select College</option>
              {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Interested Course</label>
            <input required name="course" placeholder="e.g. B.Tech Computer Science" className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-colors" />
          </div>

          <div className="md:col-span-2 mt-4">
            <button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center">
              {loading ? 'Submitting...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
