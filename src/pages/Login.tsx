import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, User, Lock, ArrowRight, Mail, KeyRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAdminStore } from '../store/adminStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignInButton } from '@clerk/clerk-react';
import type { User as UserType } from '../types';
import { getUserByEmail, createUser, fetchUserStateFromDB } from '../lib/supabase';
import { useCollegeStore } from '../store/collegeStore';

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRole = (queryParams.get('role') as 'student' | 'admin' | 'counselor') || 'student';
  const [role, setRole] = useState<'student' | 'admin' | 'counselor'>(initialRole);

  useEffect(() => {
    const currentRole = (new URLSearchParams(location.search).get('role') as 'student' | 'admin' | 'counselor') || 'student';
    setRole(currentRole);
  }, [location.search]);

  const { login } = useAuthStore();
  const { counselors, initializeData, isInitialized, subadmins } = useAdminStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized) {
      initializeData();
    }
  }, [isInitialized, initializeData]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const cleanEmail = email.trim().toLowerCase();
    
    if (role === 'admin') {
      if (cleanEmail !== 'ayush.kashyap7155@gmail.com') {
        try {
          const dbUser = await getUserByEmail(cleanEmail);
          const isSubadminLocal = subadmins?.some(s => s.email === cleanEmail);
          
          if (!isSubadminLocal && (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'subadmin'))) {
            setError('Unauthorized: You are not an authorized admin or subadmin.');
            setIsLoading(false);
            return;
          }
          
          if (dbUser) {
            // Set name to dbUser.name if they exist
            setName(dbUser.name || email.split('@')[0]);
          } else {
            setName(email.split('@')[0]);
          }
        } catch (err) {
          setError('Database error occurred while checking authorization.');
          setIsLoading(false);
          return;
        }
      }
    }

    if (role === 'counselor') {
      // Direct email/password login for counselors. No OTP.
      let counselor = null;
      try {
        const dbUser = await getUserByEmail(cleanEmail);
        if (dbUser && dbUser.role === 'counselor' && dbUser.password === password) {
          counselor = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            phone: dbUser.phone,
            avatar: dbUser.avatar,
            assignedStudents: [],
            specialization: []
          };
        }
      } catch (err) {
        console.error("Counselor login error:", err);
      }

      if (!counselor) {
        counselor = counselors.find(c => c.email === cleanEmail && c.password === password);
      }

      if (counselor) {
        login(counselor as unknown as import('../types').User);
        navigate('/counselor');
      } else {
        setError('Invalid counselor credentials or unauthorized account.');
      }
      setIsLoading(false);
      return;
    }

    // Generate 6 digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name: name || email.split('@')[0], otp: newOtp }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send OTP');
      }

      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Is the backend server running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (otp === generatedOtp) {
      try {
        let dbUser = await getUserByEmail(cleanEmail);
        
        if (!dbUser) {
          // Auto-register student if they don't exist
          dbUser = await createUser({ name: name || cleanEmail.split('@')[0], email: cleanEmail, role: cleanEmail === 'ayush.kashyap7155@gmail.com' ? 'admin' : role });
        }
        
        let user: UserType;
        if (dbUser) {
          user = { 
            id: dbUser.id, 
            name: dbUser.name, 
            email: dbUser.email, 
            role: dbUser.role as any,
            phone: dbUser.phone,
            avatar: dbUser.avatar
          };
        } else {
          // Local fallback for offline testing
          const isSubadmin = subadmins?.some(s => s.email === email);
          user = {
            id: `local-${Date.now()}`,
            name: name || email.split('@')[0],
            email,
            role: email === 'ayush.kashyap7155@gmail.com' ? 'admin' : (isSubadmin ? 'subadmin' : role) as any
          };
        }
        
        login(user);
        
        // Restore User State from DB
        const stateData = await fetchUserStateFromDB(user.id);
        if (stateData && stateData.favorites) {
          useCollegeStore.getState().setFavorites(stateData.favorites);
        }
        navigate((user.role === 'admin' || user.role === 'subadmin') ? '/admin' : user.role === 'counselor' ? '/counselor' : '/dashboard');
      } catch (err: any) {
        setError(err.message || 'Database error occurred.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  return (
    <div 
      className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 relative" 
      style={{ 
        background: role === 'student' 
          ? `linear-gradient(rgba(15, 23, 42, 0.7), rgba(19, 78, 74, 0.85)), url('/indian_students_bg.png')` 
          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #134e4a 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2">

        {/* Left branding panel */}
        <div className="hidden md:flex flex-col justify-center p-10 lg:p-12 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a, #134e4a)' }}>
          {/* floating orb */}
          <div className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl -top-20 -left-20" style={{ background: '#0d9488' }} />
          <div className="absolute w-40 h-40 rounded-full opacity-20 blur-3xl -bottom-10 -right-10" style={{ background: '#0891b2' }} />

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="relative">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(13,148,136,0.3)' }}>
              <GraduationCap className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3">Welcome to DegreeDifference</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">Your gateway to finding the perfect college and achieving your educational dreams.</p>
          </motion.div>

          <div className="relative flex flex-col gap-4">
            {[
              { t: '500+ Colleges', d: 'Verified & up-to-date listings' },
              { t: 'Expert Counselors', d: 'Personalised guidance at every step' },
              { t: 'Live Tracking', d: 'Monitor admission progress in real-time' },
            ].map((item, i) => (
              <motion.div key={item.t} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs" style={{ background: 'rgba(13,148,136,0.4)' }}>✓</div>
                <div>
                  <h3 className="font-semibold text-sm">{item.t}</h3>
                  <p className="text-slate-400 text-xs">{item.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-8 sm:p-10 lg:p-12 relative">
          <AnimatePresence mode="wait">
            {step === 'details' ? (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                  {role === 'admin' ? 'Admin Access' : role === 'counselor' ? 'Counselor Portal' : 'Student Portal'}
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                  {role === 'admin' ? 'Enter your email to receive an admin OTP' : role === 'counselor' ? 'Sign in to manage your students' : 'Sign in or create an account'}
                </p>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">{error}</div>}

                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  {/* Name (Only for Student) */}
                  {role === 'student' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                    </div>
                  </div>

                  {/* Password (Only for Counselor) */}
                  {role === 'counselor' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                      </div>
                    </div>
                  )}

                  <motion.button disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                    {isLoading ? (role === 'student' ? 'Sending OTP...' : 'Signing in...') : (role === 'student' ? 'Continue' : 'Sign In')} <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </form>

                {role === 'student' && (
                  <div className="mt-6">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                      <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Or continue with</span></div>
                    </div>
                    
                    <SignInButton mode="modal">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 shadow-sm hover:bg-slate-50 transition-colors">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                      </motion.button>
                    </SignInButton>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full justify-center">
                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Verify your email</h2>
                <p className="text-slate-500 text-sm mb-8">We've sent a 6-digit code to <span className="font-semibold text-slate-800">{email}</span>. Please enter it below.</p>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">{error}</div>}

                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Verification Code</label>
                    <div className="relative">
                      <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required placeholder="000000" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-center tracking-[0.5em] text-lg font-bold focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                      Verify & Sign In <ArrowRight className="h-4 w-4" />
                    </motion.button>
                    <button type="button" onClick={() => setStep('details')} className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-700">
                      Back to details
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
