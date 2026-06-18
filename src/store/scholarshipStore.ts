import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Scholarship } from '../types';
import { fetchScholarshipsFromDB, addScholarshipToDB, isSupabaseConfigured } from '../lib/supabase';
import { mockScholarships } from '../data/mockData';

interface ScholarshipState {
  scholarships: Scholarship[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  setScholarships: (scholarships: Scholarship[]) => void;
  initializeScholarships: () => Promise<void>;
  addScholarship: (scholarship: Omit<Scholarship, 'id'>) => Promise<void>;
}

export const useScholarshipStore = create<ScholarshipState>()(
  persist(
    (set, get) => ({
      scholarships: [],
      isLoading: false,
      isInitialized: false,
      error: null,

      setScholarships: (scholarships) => set({ scholarships }),

      initializeScholarships: async () => {
        set({ isLoading: true, error: null });
        
        try {
          if (isSupabaseConfigured()) {
            const dbScholarships = await fetchScholarshipsFromDB();
            
            if (dbScholarships.length > 0) {
              set({ scholarships: dbScholarships, isLoading: false, isInitialized: true });
            } else {
              // DB is empty, sync local mock data to DB
              console.log('No scholarships in database, syncing mock data to Supabase...');
              for (const s of mockScholarships) {
                await addScholarshipToDB(s);
              }
              const freshScholarships = await fetchScholarshipsFromDB();
              set({ scholarships: freshScholarships.length > 0 ? freshScholarships : mockScholarships, isLoading: false, isInitialized: true });
            }
          } else {
            set({ scholarships: mockScholarships, isLoading: false, isInitialized: true });
          }
        } catch (error) {
          console.error('Error initializing scholarships:', error);
          // Fallback to mock data on error
          set({ scholarships: mockScholarships, isLoading: false, isInitialized: true, error: 'Failed to load scholarships' });
        }
      },

      addScholarship: async (scholarship) => {
        set({ isLoading: true, error: null });
        try {
          if (isSupabaseConfigured()) {
            const newScholarship = await addScholarshipToDB(scholarship);
            if (newScholarship) {
              set((state) => ({
                scholarships: [newScholarship, ...state.scholarships],
                isLoading: false,
              }));
            }
          } else {
            // Local fallback
            const newScholarship = { ...scholarship, id: `schol-${Date.now()}` } as Scholarship;
            set((state) => ({
              scholarships: [newScholarship, ...state.scholarships],
              isLoading: false,
            }));
          }
        } catch (error) {
          console.error('Error adding scholarship:', error);
          set({ isLoading: false, error: 'Failed to add scholarship' });
          throw error;
        }
      }
    }),
    {
      name: 'scholarship-storage',
      partialize: (state) => ({ scholarships: state.scholarships }), // only persist scholarships
    }
  )
);
