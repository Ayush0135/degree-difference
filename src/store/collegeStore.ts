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
        // Don't re-initialize if already done
        if (get().isInitialized && get().colleges.length > 0) return;
        
        set({ isLoading: true, error: null });
        
        try {
          if (isSupabaseConfigured()) {
            // Fetch from Supabase
            const colleges = await fetchCollegesFromDB();
            
            if (colleges.length > 0) {
              set({ colleges, isLoading: false, isInitialized: true });
            } else {
              // If no colleges in DB, seed with mock data
              console.log('No colleges in database, using mock data');
              set({ colleges: mockColleges, isLoading: false, isInitialized: true });
            }
          } else {
            // Supabase not configured, use mock data
            console.log('Supabase not configured, using mock data');
            set({ colleges: mockColleges, isLoading: false, isInitialized: true });
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
          const response = await fetch('http://localhost:3001/api/add-college', {
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

          const response = await fetch(`http://localhost:3001/api/update-college/${id}`, {
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
