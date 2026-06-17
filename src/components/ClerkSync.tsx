import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useAuthStore } from '../store/authStore';
import { getUserByEmail, createUser } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function ClerkSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function syncUser() {
      if (!isLoaded || !isSignedIn || !user) return;
      if (isAuthenticated) return; // Already logged into local store

      try {
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) return;

        const fullName = user.fullName || email.split('@')[0];

        // Sync with Supabase
        let dbUser = await getUserByEmail(email);
        
        if (!dbUser) {
          // New user from Google Login - default to student
          dbUser = await createUser({
            name: fullName,
            email: email,
            role: 'student'
          });
        }

        if (dbUser && isMounted) {
          login({
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role as any,
            phone: dbUser.phone,
            avatar: dbUser.avatar
          });

          // Restore User State from DB
          const { fetchUserStateFromDB } = await import('../lib/supabase');
          const { useCollegeStore } = await import('../store/collegeStore');
          const stateData = await fetchUserStateFromDB(dbUser.id);
          if (stateData && stateData.favorites) {
            useCollegeStore.getState().setFavorites(stateData.favorites);
          }

          // Redirect to respective dashboard
          if (dbUser.role === 'admin') navigate('/admin');
          else if (dbUser.role === 'counselor') navigate('/counselor');
          else navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error syncing Clerk user to Supabase:", error);
      }
    }

    syncUser();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, user, isAuthenticated, login, navigate]);

  // This is a headless component, it renders nothing
  return null;
}
