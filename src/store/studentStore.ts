import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Application, Query } from '../types';
import { fetchApplicationsFromDB, fetchQueriesFromDB, uploadDocumentToDB, addApplicationToDB, addQueryToDB, isSupabaseConfigured } from '../lib/supabase';
import { mockApplications, mockQueries } from '../data/mockData';

interface StudentState {
  applications: Application[];
  queries: Query[];
  isInitialized: boolean;
  isLoading: boolean;
  
  initializeData: (studentId: string) => Promise<void>;
  addApplication: (app: Omit<Application, 'id'>) => Promise<void>;
  uploadDocument: (file: File, applicationId: string) => Promise<boolean>;
  addQuery: (query: Omit<Query, 'id'>) => Promise<void>;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set, get) => ({
      applications: [],
      queries: [],
      isInitialized: false,
      isLoading: false,

      initializeData: async (studentId) => {
        if (!studentId) return;
        set({ isLoading: true });
        
        try {
          if (isSupabaseConfigured()) {
            const [apps, qs] = await Promise.all([
              fetchApplicationsFromDB(studentId),
              fetchQueriesFromDB(studentId)
            ]);
            set({ applications: apps, queries: qs, isInitialized: true, isLoading: false });
          } else {
            set({ 
              applications: mockApplications.filter(a => a.studentId === studentId), 
              queries: mockQueries.filter(q => q.studentId === studentId),
              isInitialized: true, 
              isLoading: false 
            });
          }
        } catch (error) {
          console.error("Failed to initialize student data", error);
          set({ isLoading: false });
        }
      },

      addApplication: async (appData) => {
        try {
          if (isSupabaseConfigured()) {
            const newApp = await addApplicationToDB(appData);
            if (newApp) {
              set((state) => ({ applications: [newApp, ...state.applications] }));
            }
          } else {
            const newApp: Application = { ...appData, id: `app_${Date.now()}` } as Application;
            set((state) => ({ applications: [newApp, ...state.applications] }));
          }
        } catch (error) {
          console.error("Error adding application", error);
        }
      },

      uploadDocument: async (file, applicationId) => {
        const app = get().applications.find(a => a.id === applicationId);
        if (!app) return false;

        if (isSupabaseConfigured()) {
          const updatedDocs = await uploadDocumentToDB(file, applicationId, app.documents || []);
          if (updatedDocs) {
            set(state => ({
              applications: state.applications.map(a => 
                a.id === applicationId ? { ...a, documents: updatedDocs } : a
              )
            }));
            return true;
          }
        }
        
        // Fallback for local testing
        const newDoc = {
          id: `doc-${Date.now()}`,
          name: file.name,
          type: file.name.endsWith('.pdf') ? 'pdf' : 'image',
          url: '#',
          uploadedAt: new Date().toISOString()
        };
        set(state => ({
          applications: state.applications.map(a => 
            a.id === applicationId ? { ...a, documents: [...(a.documents || []), newDoc] } : a
          )
        }));
        return true;
      },

      addQuery: async (queryData) => {
        try {
          if (isSupabaseConfigured()) {
            const newQuery = await addQueryToDB(queryData);
            if (newQuery) {
              set((state) => ({ queries: [newQuery, ...state.queries] }));
            }
          } else {
            const newQuery: Query = { ...queryData, id: `q_${Date.now()}` } as Query;
            set((state) => ({ queries: [newQuery, ...state.queries] }));
          }
        } catch (error) {
          console.error("Error adding query", error);
        }
      },
    }),
    {
      name: 'student-storage',
    }
  )
);
