import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Colleges from './pages/Colleges';
import CollegeDetail from './pages/CollegeDetail';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AddCollege from './pages/AddCollege';
import CounselorDashboard from './pages/CounselorDashboard';
import CounselorRegistration from './pages/CounselorRegistration';
import StudentSelfRegister from './pages/StudentSelfRegister';
import AIMatchmaker from './pages/AIMatchmaker';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Scholarships from './pages/Scholarships';
import ClerkSync from './components/ClerkSync';
import { useAuthStore } from './store/authStore';
import { useCollegeStore } from './store/collegeStore';

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Home />} />
      <Route path="/colleges" element={<Colleges />} />
      <Route path="/college/:id" element={<CollegeDetail />} />
      <Route path="/ai-matchmaker" element={<AIMatchmaker />} />
      <Route path="/login" element={<Login />} />
      <Route path="/counselor-registration" element={<CounselorRegistration />} />
      <Route path="/register/:counselorId" element={<StudentSelfRegister />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />

      <Route path="/scholarships" element={<Scholarships />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'subadmin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-college"
        element={
          <ProtectedRoute allowedRoles={['admin', 'subadmin']}>
            <AddCollege />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/edit-college/:id"
        element={
          <ProtectedRoute allowedRoles={['admin', 'subadmin']}>
            <AddCollege />
          </ProtectedRoute>
        }
      />
      <Route
        path="/counselor"
        element={
          <ProtectedRoute allowedRoles={['counselor']}>
            <CounselorDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function MainApp() {
  const { initializeColleges } = useCollegeStore();
  const { scrollYProgress } = useScroll();
  const location = useLocation();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Initialize colleges from Supabase or fallback to mock data
    initializeColleges();
  }, [initializeColleges]);

  const isDashboard = ['/admin', '/counselor', '/dashboard'].some(path => location.pathname.startsWith(path));

  if (isDashboard) {
    return (
      <>
        <ScrollToTop />
        <AnimatedRoutes />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ScrollToTop />
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 origin-left z-[100]"
        style={{ scaleX, background: 'linear-gradient(90deg, #2dd4bf, #0891b2, #2563eb)' }}
      />
      <Navbar />
      <main className="flex-1">
        <AnimatedRoutes />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <ClerkSync />
      <MainApp />
    </HashRouter>
  );
}

export default App;
