import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { College } from '../types';
import { 
  fetchColleges as fetchCollegesFromDB, 
  addCollegeToDB, 
  deleteCollegeFromDB,
  isSupabaseConfigured 
} from '../lib/supabase';
import { mockColleges } from '../data/mockData';

interface CollegeState {
  colleges: College[];
  favorites: string[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  setColleges: (colleges: College[]) => void;
  initializeColleges: () => Promise<void>;
  addCollege: (college: Omit<College, 'id'>) => Promise<void>;
  updateCollege: (id: string, updates: Partial<College>) => Promise<void>;
  deleteCollege: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
}

export const useCollegeStore = create<CollegeState>()(
  persist(
    (set, get) => ({
      colleges: [],
      favorites: [],
      isLoading: false,
      isInitialized: false,
      error: null,

      setColleges: (colleges) => set({ colleges }),

      initializeColleges: async () => {
        set({ isLoading: true, error: null });
        
        try {
          if (isSupabaseConfigured()) {
            const dbColleges = await fetchCollegesFromDB();
            
            if (dbColleges.length > 0) {
              set({ colleges: dbColleges, isLoading: false, isInitialized: true });
            } else {
              // DB is empty, sync local colleges or mock data to DB
              const localColleges = get().colleges.length > 0 ? get().colleges : mockColleges;
              console.log('No colleges in database, syncing local data to Supabase...');
              for (const c of localColleges) {
                await addCollegeToDB(c);
              }
              const freshColleges = await fetchCollegesFromDB();
              set({ colleges: freshColleges.length > 0 ? freshColleges : localColleges, isLoading: false, isInitialized: true });
            }
          } else {
            const current = get().colleges;
            set({ colleges: current.length > 0 ? current : mockColleges, isLoading: false, isInitialized: true });
          }
        } catch (error) {
          console.error('Error initializing colleges:', error);
          // Fallback to mock data on error
          set({ colleges: mockColleges, isLoading: false, isInitialized: true, error: 'Failed to load colleges' });
        }
      },

      addCollege: async (collegeData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/add-college', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(collegeData)
          });

          if (!response.ok) {
            throw new Error('Failed to add college via backend API');
          }

          const { college: newCollege } = await response.json();

          if (newCollege) {
            set((state) => ({
              colleges: [newCollege, ...state.colleges],
              isLoading: false,
            }));
          } else {
            throw new Error('Failed to parse newly added college');
          }
        } catch (error) {
          console.error('Error adding college:', error);
          set({ isLoading: false, error: 'Failed to add college' });
          throw error;
        }
      },

      updateCollege: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          // If we have an id, it means we are editing an existing college.
          // Wait, 'updates' is a Partial<College> object. To update Supabase, we should send the FULL merged object so that embeddings can be regenerated.
          const currentCollege = get().colleges.find(c => c.id === id);
          if (!currentCollege) throw new Error("College not found");
          
          const fullUpdatedCollege = { ...currentCollege, ...updates };

          const response = await fetch(`/api/update-college/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fullUpdatedCollege)
          });

          if (!response.ok) {
            throw new Error('Failed to update college via backend API');
          }

          // We can optionally use the returned college data, or just assume the merge was correct.
          set((state) => ({
            colleges: state.colleges.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error('Error updating college:', error);
          set({ isLoading: false, error: 'Failed to update college' });
          throw error;
        }
      },

      deleteCollege: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          if (isSupabaseConfigured()) {
            const success = await deleteCollegeFromDB(id);
            
            if (success) {
              set((state) => ({
                colleges: state.colleges.filter((c) => c.id !== id),
                isLoading: false,
              }));
            } else {
              throw new Error('Failed to delete college from database');
            }
          } else {
            set((state) => ({
              colleges: state.colleges.filter((c) => c.id !== id),
              isLoading: false,
            }));
          }
        } catch (error) {
          console.error('Error deleting college:', error);
          set({ isLoading: false, error: 'Failed to delete college' });
        }
      },

      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((fid) => fid !== id)
            : [...state.favorites, id],
        })),
    }),
    {
      name: 'college-storage',
      partialize: (state) => ({ favorites: state.favorites }), // Only persist favorites locally
    }
  )
);
