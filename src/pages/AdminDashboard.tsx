import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, School, Users, FileText, MessageSquare, Edit, Trash2, X, Check,
  Database, UserPlus, BookOpen, Book, ArrowRight, Lock, RefreshCw, Megaphone,
  Save, Home, BarChart2, Award, ChevronRight, Sparkles, Menu, Bell, LogOut,
  TrendingUp, GraduationCap, Settings, ClipboardList, ShieldCheck
} from 'lucide-react';
import { useCollegeStore } from '../store/collegeStore';
import { useAdminStore } from '../store/adminStore';
import { useAuthStore } from '../store/authStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import ApplicationChat from '../components/ApplicationChat';

function Badge({ status }: { status: string }) {
  const m: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    under_review: 'bg-amber-100 text-amber-700',
    counseling: 'bg-cyan-100 text-cyan-700',
    resolved: 'bg-emerald-100 text-emerald-700',
    in_progress: 'bg-amber-100 text-amber-700',
    open: 'bg-slate-100 text-slate-600',
    pending: 'bg-slate-100 text-slate-600'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${m[status] || 'bg-slate-100 text-slate-600'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

type TabId = 'overview' | 'colleges' | 'applications' | 'queries' | 'manual_reg' | 'rule_book' | 'manage_counselors' | 'counselor_applications' | 'leaderboard' | 'subadmins' | 'registered_students';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const {
    applications, queries, initializeData, updateApplicationStatus, advanceApplicationStep,
    assignCounselor, manuallyRegisterStudent, addCounselor, assignIncentive, counselors,
    counselorApplications, approveCounselorApp, updateCounselorFakeAdmissions,
    subadmins, addSubadmin, removeSubadmin, marqueeOffer: storeMarquee, updateMarqueeOffer,
    setupRealtime, students
  } = useAdminStore();
  const { colleges, initializeColleges, addCollege, deleteCollege } = useCollegeStore();
  const dbConnected = isSupabaseConfigured();
  const [incentiveForm, setIncentiveForm] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initializeColleges();
    initializeData().then(() => setupRealtime());
  }, [initializeColleges, initializeData, setupRealtime]);

  const [tab, setTab] = useState<TabId>('overview');
  const [chatAppId, setChatAppId] = useState<{id: string, name: string} | null>(null);
  const [marqueeOffer, setMarqueeOffer] = useState(storeMarquee);
  const [isSavingMarquee, setIsSavingMarquee] = useState(false);

  useEffect(() => { setMarqueeOffer(storeMarquee); }, [storeMarquee]);

  const handleSaveMarquee = async () => {
    setIsSavingMarquee(true);
    await updateMarqueeOffer(marqueeOffer);
    setIsSavingMarquee(false);
    alert('Marquee updated!');
  };

  const vals = [colleges.length, applications.length, queries.length, students.length];

  const handleManualReg = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    await manuallyRegisterStudent({
      studentName: fd.get('name') as string,
      studentEmail: fd.get('email') as string,
      studentPhone: fd.get('phone') as string,
      course: fd.get('course') as string,
    });
    setTab('applications');
    form.reset();
  };

  const handleAddCounselor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    await addCounselor({
      name: fd.get('name') as string,
      email: (fd.get('email') as string).trim().toLowerCase(),
      password: fd.get('password') as string,
    });
    form.reset();
  };

  const handleApproveCounselor = async (app: any) => {
    const success = await approveCounselorApp(app.id);
    if (!success) return alert('Failed to approve.');
    const password = Math.random().toString(36).slice(-8);
    addCounselor({ name: app.fullName, email: app.email, password, specialization: [app.specialization] });
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(13, 148, 136);
    doc.text('Degree Difference', 20, 20);
    doc.setFontSize(16); doc.setTextColor(0, 0, 0);
    doc.text('Authorized Counselor Credential & Rulebook', 20, 35);
    doc.setFontSize(12);
    doc.text(`Welcome, ${app.fullName}!`, 20, 50);
    doc.text('Your counselor account has been approved.', 20, 60);
    doc.setFontSize(14); doc.setTextColor(220, 38, 38);
    doc.text('Login Credentials (CONFIDENTIAL)', 20, 80);
    doc.setTextColor(0, 0, 0); doc.setFontSize(12);
    doc.text(`Email: ${app.email}`, 20, 90);
    doc.text(`Password: ${password}`, 20, 98);
    const pdfBase64 = btoa(doc.output());
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.functions.invoke('send-counselor-email', { body: { email: app.email, name: app.fullName, pdfBase64 } });
        alert(`Email sent to ${app.email}!`);
      } catch {
        doc.save(`Counselor_Credentials_${app.fullName.replace(/\s+/g, '_')}.pdf`);
      }
    } else {
      doc.save(`Counselor_Credentials_${app.fullName.replace(/\s+/g, '_')}.pdf`);
    }
  };

  const navItems: { id: TabId; icon: any; label: string; adminOnly?: boolean }[] = [
    { id: 'overview', icon: Home, label: 'Overview' },
    { id: 'colleges', icon: School, label: 'Colleges' },
    { id: 'applications', icon: FileText, label: 'Applications' },
    { id: 'registered_students', icon: Users, label: 'Students' },
    { id: 'queries', icon: MessageSquare, label: 'Queries' },
    { id: 'manual_reg', icon: UserPlus, label: 'Register' },
    { id: 'leaderboard', icon: Award, label: 'Leaderboard' },
    { id: 'rule_book', icon: BookOpen, label: 'Rule Book' },
    ...(user?.role === 'admin' ? [
      { id: 'manage_counselors' as TabId, icon: ShieldCheck, label: 'Counselors' },
      { id: 'counselor_applications' as TabId, icon: ClipboardList, label: 'Applications' },
      { id: 'subadmins' as TabId, icon: Lock, label: 'Subadmins' },
    ] : []),
  ];

  const bottomNavItems = [
    { id: 'overview', icon: Home, label: 'Home' },
    { id: 'applications', icon: FileText, label: 'Apps' },
    { id: 'colleges', icon: School, label: 'Colleges' },
    { id: 'registered_students', icon: Users, label: 'Students' },
    { id: 'leaderboard', icon: Award, label: 'Board' },
  ];

  const navClick = (id: TabId) => {
    setTab(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" style={{ paddingBottom: '70px' }}>

      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white fixed top-0 left-0 h-full z-40 shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-base leading-none">Degree</h1>
              <p className="text-teal-400 text-xs font-bold">Difference Admin</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Main</p>
          {navItems.slice(0, 5).map(item => (
            <button
              key={item.id}
              onClick={() => navClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-semibold transition-all ${
                tab === item.id
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          ))}

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 mt-5">Management</p>
          {navItems.slice(5).map(item => (
            <button
              key={item.id}
              onClick={() => navClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-semibold transition-all ${
                tab === item.id
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-sm font-black">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-2 ${dbConnected ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400'}`}>
            <Database className="h-3 w-3" />
            {dbConnected ? 'Supabase Live' : 'Local Mode'}
          </div>
          <button onClick={() => initializeData()} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
          </button>
        </div>
      </aside>

      {/* ─── Mobile Sidebar Overlay ─── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-black text-base leading-none">Degree Difference</h1>
                    <p className="text-teal-400 text-xs font-bold">Admin Panel</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-white/10">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-3">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => navClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-semibold transition-all ${
                      tab === item.id ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Content ─── */}
      <div className="flex-1 lg:ml-64">

        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 lg:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <Menu className="h-5 w-5 text-slate-600" />
              </button>
              <div>
                <h2 className="font-black text-base text-slate-900 capitalize leading-none">
                  {tab === 'overview' ? 'Dashboard' : tab.replace('_', ' ')}
                </h2>
                <p className="text-[11px] text-slate-400 hidden sm:block">Manage your platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${dbConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                <Database className="h-3 w-3" />
                {dbConnected ? 'Live' : 'Local'}
              </div>
              <button onClick={() => initializeData()} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 max-w-7xl mx-auto">

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5 mb-6">
                {[
                  { icon: School, label: 'Colleges', val: vals[0], color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-200' },
                  { icon: FileText, label: 'Applications', val: vals[1], color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-200' },
                  { icon: MessageSquare, label: 'Queries', val: vals[2], color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200' },
                  { icon: Users, label: 'Students', val: vals[3], color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200' },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ y: -3 }}
                    className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg ${s.shadow} cursor-pointer`}
                  >
                    <s.icon className="h-6 w-6 opacity-80 mb-3" />
                    <p className="text-3xl font-black">{s.val}</p>
                    <p className="text-xs font-bold opacity-70 uppercase tracking-wider mt-1">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Add College', icon: Plus, color: 'text-teal-600 bg-teal-50', action: () => {}, isLink: true, href: '/admin/add-college' },
                  { label: 'Register Student', icon: UserPlus, color: 'text-indigo-600 bg-indigo-50', action: () => setTab('manual_reg') },
                  { label: 'Add Counselor', icon: ShieldCheck, color: 'text-violet-600 bg-violet-50', action: () => setTab('manage_counselors') },
                  { label: 'Leaderboard', icon: Award, color: 'text-amber-600 bg-amber-50', action: () => setTab('leaderboard') },
                ].map(a => (
                  a.isLink
                    ? <Link to={a.href!} key={a.label}
                        className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md active:scale-95 transition-all"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.color}`}>
                          <a.icon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">{a.label}</p>
                      </Link>
                    : <button key={a.label} onClick={a.action}
                        className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md active:scale-95 transition-all text-left"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.color}`}>
                          <a.icon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">{a.label}</p>
                      </button>
                ))}
              </div>

              {/* Recent Applications */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">Recent Applications</h3>
                  <button onClick={() => setTab('applications')} className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                    View all <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {applications.slice(0, 5).map(a => (
                    <div key={a.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{a.studentName}</p>
                        <p className="text-xs text-slate-400 truncate">{a.collegeName} • {a.course}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <Badge status={a.status} />
                        <button onClick={() => setChatAppId({id: a.id, name: a.studentName})} className="text-indigo-500 hover:text-indigo-700 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {applications.length === 0 && (
                    <div className="p-10 text-center text-slate-400 text-sm">No applications yet.</div>
                  )}
                </div>
              </div>

              {/* Counselor Applications alert */}
              {counselorApplications.filter(a => a.status === 'pending').length > 0 && (
                <button
                  onClick={() => setTab('counselor_applications')}
                  className="w-full flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-4 hover:bg-amber-100 active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <ClipboardList className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-amber-900">
                        {counselorApplications.filter(a => a.status === 'pending').length} Pending Counselor Applications
                      </p>
                      <p className="text-xs text-amber-600">Tap to review and approve</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-amber-500" />
                </button>
              )}
            </motion.div>
          )}

          {/* ── COLLEGES ── */}
          {tab === 'colleges' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900">Colleges ({colleges.length})</h2>
                <Link to="/admin/add-college">
                  <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                    <Plus className="h-4 w-4" /> Add College
                  </motion.button>
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                {colleges.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                    <div className="flex gap-4 min-w-0 items-center">
                      <img src={c.image} alt={c.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{c.name}</h3>
                        <p className="text-xs text-slate-400 truncate">{c.location}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">{c.type}</span>
                          <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-semibold">⭐ {c.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Link to={`/admin/edit-college/${c.id}`} className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"><Edit className="h-4 w-4" /></Link>
                      <button onClick={() => { if (confirm('Delete this college?')) deleteCollege(c.id); }} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </motion.div>
                ))}
                {colleges.length === 0 && (
                  <div className="text-center py-16 text-slate-400"><School className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No colleges yet.</p></div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── APPLICATIONS ── */}
          {tab === 'applications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-slate-900 mb-5">All Applications ({applications.length})</h2>
              <div className="flex flex-col gap-3">
                {applications.map(a => (
                  <div key={a.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm">{a.studentName}</h3>
                        <p className="text-xs text-slate-400 truncate">{a.collegeName} — {a.course}</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">{a.studentEmail} • {a.studentPhone}</p>
                      </div>
                      <Badge status={a.status} />
                    </div>

                    {a.scholarshipAmount ? (
                      <div className="mb-3 bg-emerald-50 text-emerald-800 text-xs px-3 py-2 rounded-xl border border-emerald-100">
                        🎓 Scholarship: ₹{a.scholarshipAmount} — {a.scholarshipDetails}
                      </div>
                    ) : null}

                    {a.counselorId ? (
                      <div className="mb-3 space-y-2">
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl inline-block">
                          Counselor: <strong>{a.assignedCounselorName}</strong>
                        </span>
                        <div className="text-[11px] text-slate-500 flex justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                          <span>{a.progress?.currentStage}</span>
                          <span>Step {a.progress?.step}/{a.progress?.totalSteps}</span>
                        </div>
                        {a.status === 'approved' && (
                          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                            <p className="text-xs font-bold text-amber-900 mb-2">Counselor Incentive</p>
                            {a.incentiveAmount ? (
                              <p className="text-sm font-black text-amber-700">₹{a.incentiveAmount} Granted ✓</p>
                            ) : (
                              <form onSubmit={e => { e.preventDefault(); assignIncentive(a.id, parseInt(incentiveForm)); setIncentiveForm(''); }} className="flex gap-2">
                                <input type="number" required placeholder="Amount (₹)" value={incentiveForm} onChange={e => setIncentiveForm(e.target.value)} className="flex-1 text-xs px-3 py-2 border border-amber-200 rounded-lg outline-none" />
                                <button type="submit" className="bg-amber-500 text-white text-xs px-3 py-2 rounded-lg font-bold">Assign</button>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-3">
                        <select
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 bg-slate-50"
                          onChange={e => {
                            if (!e.target.value) return;
                            const c = counselors.find(c => c.id === e.target.value);
                            if (c) assignCounselor(a.id, c.id, c.name);
                          }}
                        >
                          <option value="">Assign a Counselor...</option>
                          {counselors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-50">
                      {(a.status === 'pending') && (
                        <button onClick={() => { updateApplicationStatus(a.id, 'under_review'); advanceApplicationStep(a.id); }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform">
                          <Check className="h-3.5 w-3.5" /> Verify
                        </button>
                      )}
                      {(a.status === 'pending' || a.status === 'under_review') && (
                        <>
                          <button onClick={() => { updateApplicationStatus(a.id, 'approved'); advanceApplicationStep(a.id); advanceApplicationStep(a.id); advanceApplicationStep(a.id); }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform">
                            <Check className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button onClick={() => updateApplicationStatus(a.id, 'rejected')}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform">
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => setChatAppId({id: a.id, name: a.studentName})}
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl text-xs font-bold ml-auto active:scale-95 transition-transform">
                        <MessageSquare className="h-3.5 w-3.5" /> Discuss
                      </button>
                    </div>
                  </div>
                ))}
                {applications.length === 0 && (
                  <div className="text-center py-16 text-slate-400"><FileText className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No applications yet.</p></div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STUDENTS ── */}
          {tab === 'registered_students' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-slate-900 mb-5">Registered Students ({students.length})</h2>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Mobile cards */}
                <div className="lg:hidden divide-y divide-slate-50">
                  {students.map(s => (
                    <div key={s.id} className="flex items-center gap-4 p-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                        {s.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{s.name}</p>
                        <p className="text-xs text-slate-400 truncate">{s.email}</p>
                        <p className="text-[10px] text-slate-300">{new Date(s.created_at || Date.now()).toLocaleDateString()}</p>
                      </div>
                      <span className="shrink-0 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full ml-auto">Student</span>
                    </div>
                  ))}
                  {students.length === 0 && <div className="p-10 text-center text-slate-400 text-sm">No students yet.</div>}
                </div>
                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>
                        {['Name', 'Email', 'Joined', 'Role'].map(h => (
                          <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {students.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">{s.name?.charAt(0)}</div>
                              <span className="font-semibold text-slate-900 text-sm">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{s.email}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{new Date(s.created_at || Date.now()).toLocaleDateString()}</td>
                          <td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full capitalize">{s.role}</span></td>
                        </tr>
                      ))}
                      {students.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">No students.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── QUERIES ── */}
          {tab === 'queries' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-slate-900 mb-5">Queries ({queries.length})</h2>
              <div className="flex flex-col gap-3">
                {queries.map(q => (
                  <div key={q.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{q.subject}</h3>
                        <p className="text-xs text-slate-400">{q.studentName}</p>
                      </div>
                      <Badge status={q.status} />
                    </div>
                    <p className="text-xs text-slate-600 mb-3 bg-slate-50 rounded-xl px-3 py-2">{q.message}</p>
                    {q.response
                      ? <div className="bg-emerald-50 rounded-xl p-3"><p className="text-xs text-emerald-800"><strong>Response:</strong> {q.response}</p></div>
                      : <button className="text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>Respond</button>
                    }
                  </div>
                ))}
                {queries.length === 0 && <div className="text-center py-16 text-slate-400"><MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No queries.</p></div>}
              </div>
            </motion.div>
          )}

          {/* ── MANUAL REG ── */}
          {tab === 'manual_reg' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl">
              <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-teal-600" /> Direct Walk-in Registration
              </h2>
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-slate-500 mb-5">Register a student directly without the public portal.</p>
                <form onSubmit={handleManualReg} className="space-y-4">
                  {[
                    { label: 'Student Name', name: 'name', type: 'text' },
                    { label: 'Phone Number', name: 'phone', type: 'tel' },
                    { label: 'Course', name: 'course', type: 'text', placeholder: 'e.g. B.Tech CS' },
                    { label: 'Email (optional)', name: 'email', type: 'email', required: false },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="block text-xs font-bold text-slate-600 mb-1">{f.label}</label>
                      <input
                        type={f.type}
                        name={f.name}
                        required={f.required !== false}
                        placeholder={f.placeholder}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-sm transition-colors"
                      />
                    </div>
                  ))}
                  <button type="submit" className="w-full text-white py-3.5 rounded-xl font-bold text-sm mt-2 active:scale-95 transition-transform" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                    Register Student
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── RULE BOOK ── */}
          {tab === 'rule_book' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" /> Rule Book & Incentives
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                  <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2"><Book className="h-4 w-4" /> Scholarship Norms</h3>
                  <ul className="space-y-3 text-sm text-indigo-800">
                    <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" /><span><strong>Merit Based:</strong> 90%+ in 12th gets flat ₹50,000 waiver.</span></li>
                    <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" /><span><strong>Sports Quota:</strong> National level players get 30% fee reduction.</span></li>
                    <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" /><span><strong>Early Bird:</strong> Applications before May 1st get ₹10,000 concession.</span></li>
                  </ul>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                  <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2"><Check className="h-4 w-4" /> Counselor Incentives</h3>
                  <ul className="space-y-3 text-sm text-emerald-800">
                    <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" /><span><strong>Base Conversion:</strong> ₹5,000 per successful admission.</span></li>
                    <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" /><span><strong>Tier-1 College Bonus:</strong> Additional ₹2,000 for top 50 NIRF.</span></li>
                    <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" /><span><strong>Monthly Target:</strong> 10+ admissions unlocks 20% multiplier.</span></li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── MANAGE COUNSELORS ── */}
          {tab === 'manage_counselors' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" /> Manage Counselors
              </h2>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-1">Create Counselor Account</h3>
                  <p className="text-xs text-slate-400 mb-4">These credentials will be used by the counselor to log in.</p>
                  <form onSubmit={handleAddCounselor} className="space-y-4">
                    {[
                      { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Dr. Jane Smith' },
                      { label: 'Official Email', name: 'email', type: 'email', placeholder: 'jane@university.edu' },
                      { label: 'Password', name: 'password', type: 'text', placeholder: 'Secure password' },
                    ].map(f => (
                      <div key={f.name}>
                        <label className="block text-xs font-bold text-slate-600 mb-1">{f.label}</label>
                        <input required type={f.type} name={f.name} placeholder={f.placeholder} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-sm" />
                      </div>
                    ))}
                    <button type="submit" className="w-full text-white py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-transform" style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)' }}>
                      Create Account
                    </button>
                  </form>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-4">Authorized Counselors ({counselors.length})</h3>
                  <div className="flex flex-col gap-3">
                    {counselors.map(c => (
                      <div key={c.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                            <p className="text-xs text-slate-400">{c.email}</p>
                          </div>
                        </div>
                        <Badge status="approved" />
                      </div>
                    ))}
                    {counselors.length === 0 && <div className="text-center p-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl">No counselors yet.</div>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── COUNSELOR APPLICATIONS ── */}
          {tab === 'counselor_applications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-teal-600" /> Counselor Applications
              </h2>
              <div className="flex flex-col gap-4">
                {counselorApplications.length === 0
                  ? <div className="text-center py-16 text-slate-400"><ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No applications.</p></div>
                  : counselorApplications.map(app => (
                    <div key={app.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{app.fullName}</h3>
                          <p className="text-sm text-slate-500">{app.designation}{app.orgName ? ` @ ${app.orgName}` : ''}</p>
                        </div>
                        <Badge status={app.status} />
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        {[
                          { label: 'Contact', val: `${app.email}\n${app.mobile}` },
                          { label: 'Location', val: `${app.city}, ${app.state}` },
                          { label: 'Experience', val: `${app.experience} yrs • ${app.specialization}` },
                          { label: 'Bank', val: `${app.bankName}\n${app.accNumber}` },
                        ].map(d => (
                          <div key={d.label} className="bg-slate-50 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{d.label}</p>
                            <p className="text-xs text-slate-700 whitespace-pre-line">{d.val}</p>
                          </div>
                        ))}
                      </div>
                      {app.status === 'pending' && (
                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                          <button onClick={() => handleApproveCounselor(app)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm active:scale-95 transition-transform">
                            <Check className="h-4 w-4" /> Approve & Send Credentials
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 font-bold rounded-xl text-sm active:scale-95 transition-transform">
                            <X className="h-4 w-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                }
              </div>
            </motion.div>
          )}

          {/* ── LEADERBOARD ── */}
          {tab === 'leaderboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" /> Leaderboard Manager
              </h2>

              {/* Marquee editor */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <Megaphone className="h-4 w-4 text-teal-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Counselor Marquee Banner</h3>
                </div>
                <p className="text-xs text-slate-400 mb-3">Scrolling text shown at the top of the Counselor Dashboard.</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="flex-1 text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                    value={marqueeOffer}
                    onChange={e => setMarqueeOffer(e.target.value)}
                    placeholder="e.g. 🎉 Complete 5 admissions..."
                  />
                  <button onClick={handleSaveMarquee} disabled={isSavingMarquee}
                    className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 active:scale-95 transition-transform">
                    <Save className="h-4 w-4" /> {isSavingMarquee ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Counselor table */}
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">Counselor Rankings</h3>
                  <p className="text-xs text-slate-400">Inject fake data to stimulate competition.</p>
                </div>
                {/* Mobile cards */}
                <div className="lg:hidden divide-y divide-slate-50">
                  {counselors.map((c: any, idx) => (
                    <div key={c.id} className="flex items-center gap-4 p-4">
                      <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                        <p className="text-xs text-slate-400">Real: {c.realAdmissions || 0}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="w-16 text-center text-xs px-2 py-2 border border-slate-200 rounded-xl"
                          defaultValue={c.fakeAdmissions || 0}
                          onBlur={e => updateCounselorFakeAdmissions(c.id, parseInt(e.target.value) || 0)}
                        />
                        <span className="text-teal-600 font-black text-sm">{(c.realAdmissions || 0) + (c.fakeAdmissions || 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        {['Rank', 'Counselor', 'Real', 'Fake (Inject)', 'Total'].map(h => (
                          <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {counselors.map((c: any, idx) => (
                        <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx+1}`}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs">{c.name.charAt(0)}</div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                                <p className="text-xs text-slate-400">{c.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-semibold">{c.realAdmissions || 0}</td>
                          <td className="px-6 py-4">
                            <input type="number" className="w-24 px-3 py-2 border border-slate-200 rounded-xl text-sm text-center outline-none focus:border-teal-500"
                              defaultValue={c.fakeAdmissions || 0}
                              onBlur={e => updateCounselorFakeAdmissions(c.id, parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-6 py-4 text-lg font-black text-teal-600">{(c.realAdmissions || 0) + (c.fakeAdmissions || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SUBADMINS ── */}
          {user?.role === 'admin' && tab === 'subadmins' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-600" /> Manage Subadmins
              </h2>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-1">Grant Subadmin Access</h3>
                  <p className="text-xs text-slate-400 mb-4">Add an email to grant subadmin privileges.</p>
                  <form onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); await addSubadmin(fd.get('email') as string); (e.target as HTMLFormElement).reset(); }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Subadmin Email</label>
                      <input required type="email" name="email" placeholder="subadmin@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 text-sm" />
                    </div>
                    <button type="submit" className="w-full text-white py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-transform" style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)' }}>
                      Grant Access
                    </button>
                  </form>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-4">Authorized Subadmins</h3>
                  <div className="flex flex-col gap-3">
                    {subadmins.map(s => (
                      <div key={s.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold text-sm">{s.name?.charAt(0)}</div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                            <p className="text-xs text-slate-400">{s.email}</p>
                          </div>
                        </div>
                        <button onClick={() => removeSubadmin(s.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                    {subadmins.length === 0 && <div className="text-center p-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl">No subadmins.</div>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </main>
      </div>

      {/* ─── Mobile Bottom Nav ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="flex max-w-md mx-auto">
          {bottomNavItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id as TabId)}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${tab === item.id ? 'text-teal-600' : 'text-slate-400'}`}>
              <item.icon className="h-5 w-5" />
              <span className="text-[9px] font-bold">{item.label}</span>
              {tab === item.id && <motion.div layoutId="admin-nav-dot" className="w-1 h-1 rounded-full bg-teal-600" />}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {chatAppId && (
          <ApplicationChat appId={chatAppId.id} studentName={chatAppId.name} currentUserId="admin" currentUserRole="admin" onClose={() => setChatAppId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
