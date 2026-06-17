import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Application, Query, CounselorApplication, Counselor, User } from '../types';
import { fetchApplicationsFromDB, fetchQueriesFromDB, updateApplicationStatusInDB, updateApplicationScholarshipInDB, updateApplicationCounselorInDB, updateApplicationProgressInDB, updateApplicationIncentiveInDB, isSupabaseConfigured, fetchCounselorsFromDB, createUser, addApplicationToDB, fetchCounselorApplicationsFromDB, approveCounselorApplicationInDB, awardCounselorBadge, fetchSubadminsFromDB, addSubadminToDB, removeSubadminFromDB, fetchStudentsFromDB, updateCounselorFakeAdmissionsInDB, updatePlatformSettings, supabase, getUserByEmail } from '../lib/supabase';
import { mockApplications, mockQueries, mockCounselors } from '../data/mockData';

interface AdminState {
  applications: Application[];
  queries: Query[];
  counselors: Counselor[];
  subadmins: User[];
  counselorApplications: CounselorApplication[];
  students: User[];
  isLoading: boolean;
  isInitialized: boolean;
  marqueeOffer: string;
  
  initializeData: () => Promise<void>;
  updateApplicationStatus: (id: string, status: Application['status']) => Promise<void>;
  assignCounselor: (id: string, counselorId: string, counselorName: string) => Promise<void>;
  manuallyRegisterStudent: (app: Partial<Application>) => Promise<void>;
  updateScholarship: (id: string, amount: number, details: string) => Promise<void>;
  assignIncentive: (id: string, amount: number) => Promise<void>;
  advanceApplicationStep: (id: string) => Promise<void>;
  addCounselor: (counselor: Partial<Counselor>) => void;
  updateCounselorFakeAdmissions: (counselorId: string, count: number) => Promise<void>;
  addQuery: (query: Partial<Query>) => void;
  approveCounselorApp: (id: string) => Promise<boolean>;
  addSubadmin: (email: string) => Promise<void>;
  removeSubadmin: (id: string) => Promise<void>;
  updateMarqueeOffer: (offer: string) => Promise<void>;
  setupRealtime: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      applications: [],
      queries: [],
      counselors: [],
      subadmins: [],
      counselorApplications: [],
      students: [],
      isLoading: false,
      isInitialized: false,
      marqueeOffer: '🎉 Special Bonus: Complete 5 admissions this month and get a ₹10,000 bonus!',

  initializeData: async () => {
    set({ isLoading: true });
    
    try {
      if (isSupabaseConfigured()) {
        const [apps, qs, dbCounselors, cApps, dbSubadmins, marquee, dbStudents] = await Promise.all([
          fetchApplicationsFromDB(), 
          fetchQueriesFromDB(),
          fetchCounselorsFromDB(),
          fetchCounselorApplicationsFromDB(),
          fetchSubadminsFromDB(),
          fetchPlatformSettings('counselor_marquee_offer'),
          fetchStudentsFromDB()
        ]);
        
        let finalApps = apps;
        let finalQueries = qs;
        let finalCounselors = dbCounselors;
        
        // Sync local data to DB if DB is empty
        const localApps = get().applications;
        if (apps.length === 0 && localApps.length > 0) {
          console.log('Syncing local applications to DB...');
          for (const app of localApps) await addApplicationToDB(app);
          finalApps = await fetchApplicationsFromDB();
        }
        
        const localCounselors = get().counselors;
        if (dbCounselors.length === 0 && localCounselors.length > 0) {
          console.log('Syncing local counselors to DB...');
          
          for (const c of localCounselors) {
            await createUser({ name: c.name, email: c.email, role: 'counselor', password: c.password });
          }
          finalCounselors = await fetchCounselorsFromDB();
        }

        finalCounselors = finalCounselors.length > 0 ? finalCounselors : (mockCounselors as Counselor[]);
        set({ applications: finalApps, queries: finalQueries, counselors: finalCounselors as Counselor[], counselorApplications: cApps, subadmins: dbSubadmins, students: dbStudents, marqueeOffer: marquee || get().marqueeOffer, isInitialized: true, isLoading: false });
      } else {
        const finalCounselors = get().counselors.length > 0 ? get().counselors : (mockCounselors as Counselor[]);
        const finalApps = get().applications.length > 0 ? get().applications : mockApplications;
        const finalQueries = get().queries.length > 0 ? get().queries : mockQueries;
        set({ applications: finalApps, queries: finalQueries, counselors: finalCounselors, counselorApplications: get().counselorApplications || [], subadmins: get().subadmins || [], students: get().students || [], isInitialized: true, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to initialize admin data", error);
      set({ isLoading: false });
    }
  },

  setupRealtime: async () => {
    if (!isSupabaseConfigured()) return;
    if (!supabase) return;

    const fetchAllData = async () => {
      const [apps, qs, dbCounselors, cApps, dbSubadmins, marquee, dbStudents] = await Promise.all([
        fetchApplicationsFromDB(), 
        fetchQueriesFromDB(),
        fetchCounselorsFromDB(),
        fetchCounselorApplicationsFromDB(),
        fetchSubadminsFromDB(),
        fetchPlatformSettings('counselor_marquee_offer'),
        fetchStudentsFromDB()
      ]);
      const finalCounselors = dbCounselors.length > 0 ? dbCounselors : (mockCounselors as Counselor[]);
      set({ applications: apps, queries: qs, counselors: finalCounselors as Counselor[], counselorApplications: cApps, subadmins: dbSubadmins, students: dbStudents, marqueeOffer: marquee || get().marqueeOffer });
    };

    // 1. Realtime subscription (instant push updates)
    const channelTopic = 'realtime:schema-db-changes';
    const existing = supabase.getChannels().find(c => c.topic === channelTopic);
    if (!existing) {
      supabase.channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => { fetchAllData(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => { fetchAllData(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'queries' }, () => { fetchAllData(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'counselor_applications' }, () => { fetchAllData(); })
        .subscribe((status) => {
          console.log('Supabase realtime status:', status);
        });
    }

    // 2. Polling fallback — re-fetch from DB every 15 seconds no matter what
    const existingInterval = (window as any).__adminPollInterval;
    if (existingInterval) clearInterval(existingInterval);
    (window as any).__adminPollInterval = setInterval(() => {
      fetchAllData();
    }, 15000);
  },

  updateApplicationStatus: async (id, status) => {
    try {
      if (isSupabaseConfigured()) {
        const success = await updateApplicationStatusInDB(id, status);
        if (success) {
          set(state => {
            const nextApps = state.applications.map(app => 
              app.id === id ? { ...app, status } : app
            );
            
            // Auto-award badges logic
            if (status === 'approved') {
              const targetApp = state.applications.find(a => a.id === id);
              if (targetApp && targetApp.counselorId) {
                const cId = targetApp.counselorId;
                // Count newly approved + existing approved for this counselor
                const totalApproved = nextApps.filter(a => a.counselorId === cId && a.status === 'approved').length;
                
                if (totalApproved === 1) awardCounselorBadge(cId, 'first_admission', 'First Admission', 'star');
                else if (totalApproved === 10) awardCounselorBadge(cId, 'ten_admissions', 'Rising Star (10)', 'medal');
                else if (totalApproved === 50) awardCounselorBadge(cId, 'fifty_admissions', 'Top Counselor (50)', 'crown');
              }
            }

            return { applications: nextApps };
          });
        }
      } else {
        // Local update
        set(state => ({
          applications: state.applications.map(app => 
            app.id === id ? { ...app, status } : app
          )
        }));
      }
    } catch (error) {
      console.error("Failed to update application status", error);
    }
  },

  assignCounselor: async (id, counselorId, counselorName) => {
    if (isSupabaseConfigured()) {
      await updateApplicationCounselorInDB(id, counselorId, counselorName);
    }
    set(state => ({
      applications: state.applications.map(app => 
        app.id === id ? { ...app, counselorId, assignedCounselorName: counselorName } : app
      )
    }));
  },

  manuallyRegisterStudent: async (app) => {
    let newApp: Application = {
      id: `app-${Date.now()}`,
      studentId: `student-${Date.now()}`,
      studentName: app.studentName || 'Unknown Student',
      studentEmail: app.studentEmail || '',
      studentPhone: app.studentPhone || '',
      collegeId: app.collegeId || 'walk-in',
      collegeName: app.collegeName || 'Walk-in Registration',
      course: app.course || '',
      studentDob: app.studentDob || '',
      studentGender: app.studentGender || '',
      studentCity: app.studentCity || '',
      highSchoolMarks: app.highSchoolMarks || '',
      status: 'pending',
      appliedDate: new Date().toISOString(),
      documents: [],
      counselorId: app.counselorId,
      assignedCounselorName: app.assignedCounselorName,
      progress: {
        step: 1,
        totalSteps: 5,
        currentStage: 'Application Received'
      }
    };
    
    if (isSupabaseConfigured()) {
      
      let dbUser = null;
      if (app.studentEmail) {
        dbUser = await getUserByEmail(app.studentEmail);
        if (!dbUser) {
          dbUser = await createUser({
            name: app.studentName || 'Unknown Student',
            email: app.studentEmail,
            role: 'student',
            phone: app.studentPhone
          });
        }
      }
      if (dbUser) {
        newApp.studentId = dbUser.id;
      }
      
      const dbApp = await addApplicationToDB(newApp);
      if (dbApp) {
        newApp = dbApp;
      }
      
      // Refresh students list
      
      const students = await fetchStudentsFromDB();
      set({ students });
    }
    
    set(state => ({ applications: [newApp, ...state.applications] }));
  },

  updateScholarship: async (id, amount, details) => {
    if (isSupabaseConfigured()) {
      await updateApplicationScholarshipInDB(id, amount, details);
    }
    set(state => ({
      applications: state.applications.map(app => 
        app.id === id ? { ...app, scholarshipAmount: amount, scholarshipDetails: details } : app
      )
    }));
  },

  assignIncentive: async (id, amount) => {
    if (isSupabaseConfigured()) {
      await updateApplicationIncentiveInDB(id, amount);
    }
    set(state => ({
      applications: state.applications.map(app => 
        app.id === id ? { ...app, incentiveAmount: amount } : app
      )
    }));
  },

  advanceApplicationStep: async (id) => {
    const stages = ['Application Received', 'Document Verification', 'Eligibility Check', 'Counseling Round', 'Final Approval'];
    
    set(state => {
      const app = state.applications.find(a => a.id === id);
      if (!app || app.progress.step >= app.progress.totalSteps) return state;
      
      const newStep = app.progress.step + 1;
      const newStage = stages[newStep - 1] || 'Completed';
      const newProgress = { ...app.progress, step: newStep, currentStage: newStage };
      const newStatus = newStep === 5 ? 'approved' : app.status;
      
      if (isSupabaseConfigured()) {
        updateApplicationProgressInDB(id, newProgress, newStatus);
      }
      
      return {
        applications: state.applications.map(a => 
          a.id === id ? { ...a, progress: newProgress, status: newStatus } : a
        )
      };
    });
  },

  addCounselor: async (counselorData) => {
    let newId = `counselor-${Date.now()}`;
    
    if (isSupabaseConfigured()) {
      const dbUser = await createUser({
        name: counselorData.name || 'Unknown Counselor',
        email: counselorData.email || '',
        role: 'counselor',
        password: counselorData.password || ''
      });
      if (dbUser) {
        newId = dbUser.id;
      }
    }
    
    const newCounselor: Counselor = {
      id: newId,
      name: counselorData.name || 'Unknown Counselor',
      email: counselorData.email || '',
      role: 'counselor',
      password: counselorData.password || '',
      assignedStudents: [],
      specialization: [],
      realAdmissions: 0,
      fakeAdmissions: 0,
      totalAdmissions: 0,
      ...counselorData
    };
    set(state => ({ counselors: [...state.counselors, newCounselor] }));
  },

  updateCounselorFakeAdmissions: async (counselorId: string, count: number) => {
    if (isSupabaseConfigured()) {
      
      await updateCounselorFakeAdmissionsInDB(counselorId, count);
    }
    set(state => ({
      counselors: state.counselors.map(c => 
        c.id === counselorId ? { 
          ...c, 
          fakeAdmissions: count, 
          totalAdmissions: (c.realAdmissions || 0) + count 
        } : c
      )
    }));
  },

  addQuery: (queryData) => {
    const newQuery: Query = {
      id: `query-${Date.now()}`,
      studentId: queryData.studentId || `student-${Date.now()}`,
      studentName: queryData.studentName || 'Counselor Query',
      studentEmail: queryData.studentEmail || 'no-reply@example.com',
      subject: queryData.subject || 'General',
      message: queryData.message || '',
      status: 'open',
      createdDate: new Date().toISOString()
    };
    set(state => ({ queries: [newQuery, ...state.queries] }));
  },

  approveCounselorApp: async (id) => {
    if (isSupabaseConfigured()) {
      const success = await approveCounselorApplicationInDB(id);
      if (success) {
        set(state => ({
          counselorApplications: state.counselorApplications.map(app => 
            app.id === id ? { ...app, status: 'approved' } : app
          )
        }));
        return true;
      }
      return false;
    }
    return false;
  },

  addSubadmin: async (email) => {
    let newUser: User = {
      id: `subadmin-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'subadmin'
    };
    if (isSupabaseConfigured()) {
      const dbUser = await addSubadminToDB(email);
      if (dbUser) newUser = dbUser;
    }
    set(state => ({ subadmins: [...state.subadmins, newUser] }));
  },

  removeSubadmin: async (id) => {
    if (isSupabaseConfigured()) {
      await removeSubadminFromDB(id);
    }
    set(state => ({ subadmins: state.subadmins.filter(s => s.id !== id) }));
  },

  updateMarqueeOffer: async (offer: string) => {
    if (isSupabaseConfigured()) {
      
      await updatePlatformSettings('counselor_marquee_offer', offer);
    }
    set({ marqueeOffer: offer });
  }
}), {
  name: 'admin-storage',
  partialize: (state) => ({ 
    ...state, 
    isInitialized: false, // Always false on load so it refetches
    isLoading: false
  })
}));
