import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, User, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import { useClerk } from '@clerk/clerk-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { signOut } = useClerk();

  const handleLogout = async () => { 
    try {
      await signOut();
    } catch(e) {}
    logout(); 
    navigate('/'); 
    setOpen(false); 
  };
  const isActive = (p: string) => location.pathname === p;

  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'counselor') return '/counselor';
    return '/dashboard';
  };

  const links = [
    { path: '/', label: 'Home', show: !isAuthenticated },
    { path: '/colleges', label: 'Colleges', show: !isAuthenticated },
    { path: '/scholarships', label: 'Scholarships', show: true },
    { path: '/ai-matchmaker', label: 'AI Matchmaker', show: true },
    { path: '/dashboard', label: 'Dashboard', show: isAuthenticated && user?.role === 'student' },
    { path: '/admin', label: 'Admin Dashboard', show: isAuthenticated && user?.role === 'admin' },
    { path: '/counselor', label: 'Counselor Dashboard', show: isAuthenticated && user?.role === 'counselor' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto pl-4 pr-6 sm:pl-4 sm:pr-10 lg:pl-6 lg:pr-16">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group relative">
            <img src="/logo.png" alt="Degree Difference" className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105" />
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((l) =>
              l.show && (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(l.path) ? 'text-teal-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {l.label}
                  {isActive(l.path) && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-teal-50 -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              )
            )}

            <div className="w-px h-6 bg-slate-200 mx-2" />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden lg:block">{user.name}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </motion.button>
              </div>
            ) : (
              <motion.div className="shrink-0" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}
                >
                  <User className="h-4 w-4 shrink-0" /> Login
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-slate-700 rounded-lg hover:bg-slate-100 shrink-0">
            {open ? <X className="h-5 w-5 shrink-0" /> : <Menu className="h-5 w-5 shrink-0" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden border-t border-slate-200 bg-white"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {links.map((l) =>
                l.show && (
                  <Link
                    key={l.path}
                    to={l.path}
                    onClick={() => setOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive(l.path) ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {l.label}
                  </Link>
                )
              )}

              {isAuthenticated && user ? (
                <div className="border-t border-slate-100 pt-2 mt-1">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium">
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block mt-1 px-3 py-2.5 text-white rounded-lg text-center text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
