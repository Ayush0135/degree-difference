import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, School, Users, FileText, MessageSquare, Edit, Trash2, X, Check,
  Database, UserPlus, BookOpen, Book, ArrowRight, Lock, RefreshCw, Megaphone,
  Save, Home, Award, Menu, ChevronRight, ClipboardList, ShieldCheck,
  GraduationCap, TrendingUp, Zap, Bell
} from 'lucide-react';
import { useCollegeStore } from '../store/collegeStore';
import { useAdminStore } from '../store/adminStore';
import { useAuthStore } from '../store/authStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import ApplicationChat from '../components/ApplicationChat';

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
    rejected: 'bg-red-50 text-red-500 ring-1 ring-red-200',
    under_review: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
    counseling: 'bg-sky-50 text-sky-600 ring-1 ring-sky-200',
    resolved: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
    in_progress: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200',
    open: 'bg-slate-100 text-slate-500',
    pending: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase shrink-0 ${styles[status] || 'bg-slate-100 text-slate-500'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

type TabId = 'overview' | 'colleges' | 'applications' | 'queries' | 'manual_reg' | 'rule_book' | 'manage_counselors' | 'counselor_applications' | 'leaderboard' | 'subadmins' | 'registered_students';

const NAV_SECTIONS = [
  {
    label: 'Platform',
    items: [
      { id: 'overview' as TabId, icon: Home, label: 'Overview' },
      { id: 'colleges' as TabId, icon: School, label: 'Colleges' },
      { id: 'applications' as TabId, icon: FileText, label: 'Applications' },
      { id: 'registered_students' as TabId, icon: Users, label: 'Students' },
      { id: 'queries' as TabId, icon: MessageSquare, label: 'Queries' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { id: 'manual_reg' as TabId, icon: UserPlus, label: 'Walk-in Reg' },
      { id: 'leaderboard' as TabId, icon: Award, label: 'Leaderboard' },
      { id: 'rule_book' as TabId, icon: BookOpen, label: 'Rule Book' },
    ],
  },
];

const ADMIN_SECTION = {
  label: 'Admin Only',
  items: [
    { id: 'manage_counselors' as TabId, icon: ShieldCheck, label: 'Counselors' },
    { id: 'counselor_applications' as TabId, icon: ClipboardList, label: 'Reg. Requests' },
    { id: 'subadmins' as TabId, icon: Lock, label: 'Subadmins' },
  ],
};

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const {
    applications, queries, initializeData, updateApplicationStatus, advanceApplicationStep,
    assignCounselor, manuallyRegisterStudent, addCounselor, assignIncentive, counselors,
    counselorApplications, approveCounselorApp, updateCounselorFakeAdmissions,
    subadmins, addSubadmin, removeSubadmin, marqueeOffer: storeMarquee, updateMarqueeOffer,
    setupRealtime, students, respondToQuery,
  } = useAdminStore();
  const { colleges, initializeColleges, deleteCollege } = useCollegeStore();
  const dbConnected = isSupabaseConfigured();

  const [incentiveForm, setIncentiveForm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState<TabId>('overview');
  const [chatAppId, setChatAppId] = useState<{ id: string; name: string } | null>(null);
  const [marqueeOffer, setMarqueeOffer] = useState(storeMarquee);
  const [isSavingMarquee, setIsSavingMarquee] = useState(false);
  const [respondingQueryId, setRespondingQueryId] = useState<string | null>(null);
  const [queryResponseText, setQueryResponseText] = useState('');

  useEffect(() => { setMarqueeOffer(storeMarquee); }, [storeMarquee]);

  useEffect(() => {
    initializeColleges();
    initializeData().then(() => setupRealtime());
  }, []);

  const handleSaveMarquee = async () => {
    setIsSavingMarquee(true);
    await updateMarqueeOffer(marqueeOffer);
    setIsSavingMarquee(false);
  };

  const handleManualReg = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await manuallyRegisterStudent({
      studentName: fd.get('name') as string,
      studentEmail: fd.get('email') as string,
      studentPhone: fd.get('phone') as string,
      course: fd.get('course') as string,
    });
    setTab('applications');
    (e.target as HTMLFormElement).reset();
  };

  const handleRespondToQuery = async (queryId: string) => {
    if (!queryResponseText.trim()) return;
    await respondToQuery(queryId, queryResponseText);
    setRespondingQueryId(null);
    setQueryResponseText('');
  };

  const handleAddCounselor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await addCounselor({
      name: fd.get('name') as string,
      email: (fd.get('email') as string).trim().toLowerCase(),
      password: fd.get('password') as string,
    });
    (e.target as HTMLFormElement).reset();
  };

  const handleApproveCounselor = async (app: any) => {
    const ok = await approveCounselorApp(app.id);
    if (!ok) return alert('Failed to approve.');
    const password = Math.random().toString(36).slice(-8);
    addCounselor({ name: app.fullName, email: app.email, password, specialization: [app.specialization] });
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(13, 148, 136);
    doc.text('Degree Difference', 20, 20);
    doc.setFontSize(14); doc.setTextColor(0, 0, 0);
    doc.text('Authorized Counselor Credentials', 20, 35);
    doc.setFontSize(12);
    doc.text(`Name: ${app.fullName}`, 20, 55);
    doc.text(`Email: ${app.email}`, 20, 63);
    doc.text(`Password: ${password}`, 20, 71);
    const pdfBase64 = btoa(doc.output());
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.functions.invoke('send-counselor-email', { body: { email: app.email, name: app.fullName, pdfBase64 } });
        alert(`Credentials emailed to ${app.email}`);
      } catch {
        doc.save(`Credentials_${app.fullName.replace(/\s+/g, '_')}.pdf`);
      }
    } else {
      doc.save(`Credentials_${app.fullName.replace(/\s+/g, '_')}.pdf`);
    }
  };

  const go = (id: TabId) => { setTab(id); setDrawerOpen(false); };

  const pendingCounselorApps = counselorApplications.filter(a => a.status === 'pending').length;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Degree Difference" className="h-6 w-auto object-contain brightness-0 invert opacity-90" />
          <div>
            <span className="block text-[10px] text-teal-200 font-medium uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded">Admin</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {[...NAV_SECTIONS, ...(user?.role === 'admin' ? [ADMIN_SECTION] : [])].map(section => (
          <div key={section.label}>
            <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest px-3 mb-1.5">{section.label}</p>
            {section.items.map(item => {
              if (item.href) {
                return (
                  <Link key={item.id} to={item.href}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 group relative text-teal-100 hover:text-white hover:bg-white/10">
                    <item.icon className="h-4 w-4 shrink-0 transition-colors text-teal-50 group-hover:text-white" />
                    {item.label}
                  </Link>
                );
              }
              const active = tab === item.id;
              return (
                <button key={item.id} onClick={() => go(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 group relative
                    ${active ? 'bg-white/20 text-white shadow-sm' : 'text-teal-100 hover:text-white hover:bg-white/10'}`}>
                  {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white rounded-r-full" />}
                  <item.icon className={`h-4 w-4 shrink-0 transition-colors ${active ? 'text-white' : 'text-teal-50 group-hover:text-white'}`} />
                  {item.label}
                  {item.id === 'counselor_applications' && pendingCounselorApps > 0 && (
                    <span className="ml-auto text-[10px] font-black bg-amber-500 text-white w-4 h-4 rounded-full flex items-center justify-center shrink-0">{pendingCounselorApps}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-teal-700 flex items-center justify-center text-teal-200 text-xs font-black shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-teal-200 capitalize">{user?.role}</p>
          </div>
          <div className={`ml-auto w-1.5 h-1.5 rounded-full shrink-0 ${dbConnected ? 'bg-teal-400' : 'bg-amber-400'}`} title={dbConnected ? 'Supabase connected' : 'Local mode'} />
        </div>
      </div>
    </div>
  );

  /* ─── Bottom tabs (mobile) ─── */
  const BOTTOM_TABS: TabId[] = ['overview', 'applications', 'colleges', 'registered_students', 'queries'];
  const BOTTOM_ICONS: Record<TabId, any> = { overview: Home, applications: FileText, colleges: School, registered_students: Users, queries: MessageSquare, manual_reg: UserPlus, rule_book: BookOpen, manage_counselors: ShieldCheck, counselor_applications: ClipboardList, leaderboard: Award, subadmins: Lock };

  return (
    <div className="min-h-screen bg-[#f7f7f8] flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-56 flex-col fixed inset-y-0 left-0 z-40" style={{ background: 'linear-gradient(180deg, #0d9488, #0891b2)' }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setDrawerOpen(false)} />
            <motion.aside key="drawer" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed inset-y-0 left-0 w-60 z-50 flex flex-col lg:hidden shadow-2xl" style={{ background: 'linear-gradient(180deg, #0d9488, #0891b2)' }}>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen pb-16 lg:pb-0">

        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 lg:px-6 bg-white border-b border-slate-200/70">
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawerOpen(true)} className="lg:hidden -ml-1 p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Menu className="h-4 w-4 text-slate-600" />
            </button>
            <span className="text-sm font-semibold text-slate-900 capitalize">
              {tab === 'overview' ? 'Overview' : tab.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${dbConnected ? 'text-teal-700 bg-teal-50 ring-1 ring-teal-200' : 'text-amber-700 bg-amber-50 ring-1 ring-amber-200'}`}>
              <Database className="h-3 w-3" />
              {dbConnected ? 'Live' : 'Local'}
            </div>
            <button onClick={() => initializeData()} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-4 lg:p-8">

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {/* Greeting */}
              <div className="mb-7">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}.</h1>
                <p className="text-sm text-slate-400 mt-0.5">Here's what's happening on your platform today.</p>
              </div>

              {/* Stat row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Colleges', val: colleges.length, icon: School, delta: '+2 this month', color: 'text-teal-600', bg: 'bg-teal-50' },
                  { label: 'Applications', val: applications.length, icon: FileText, delta: `${applications.filter(a => a.status === 'pending').length} pending`, color: 'text-violet-600', bg: 'bg-violet-50' },
                  { label: 'Queries', val: queries.length, icon: MessageSquare, delta: `${queries.filter(q => q.status === 'open').length} open`, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Students', val: students.length, icon: Users, delta: 'Registered total', color: 'text-sky-600', bg: 'bg-sky-50' },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white border border-slate-200/70 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xs font-medium text-slate-400">{s.label}</p>
                      <div className={`w-7 h-7 ${s.bg} rounded-lg flex items-center justify-center`}>
                        <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                      </div>
                    </div>
                    <p className="text-3xl font-black text-slate-900 leading-none mb-1">{s.val}</p>
                    <p className="text-[11px] text-slate-400">{s.delta}</p>
                  </motion.div>
                ))}
              </div>

              {/* Pending counselor alert */}
              {pendingCounselorApps > 0 && (
                <button onClick={() => go('counselor_applications')}
                  className="w-full flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5 hover:bg-amber-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Bell className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="text-sm font-semibold text-amber-900">
                      {pendingCounselorApps} counselor application{pendingCounselorApps > 1 ? 's' : ''} awaiting review
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              <div className="grid lg:grid-cols-3 gap-5">
                {/* Recent Applications */}
                <div className="lg:col-span-2 bg-white border border-slate-200/70 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-900">Recent Applications</span>
                    <button onClick={() => go('applications')} className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                      All <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {applications.slice(0, 6).map(a => (
                      <div key={a.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-500 shrink-0">
                            {a.studentName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{a.studentName}</p>
                            <p className="text-[11px] text-slate-400 truncate">{a.collegeName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <StatusPill status={a.status} />
                          <button onClick={() => setChatAppId({ id: a.id, name: a.studentName })}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 transition-all">
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {applications.length === 0 && <p className="text-center text-slate-400 text-sm py-10">No applications yet.</p>}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Quick Actions</p>
                  {[
                    { label: 'Add New College', icon: Plus, sub: 'Upload listing', action: null, href: '/admin/add-college', color: 'bg-teal-500' },
                    { label: 'Register Student', icon: UserPlus, sub: 'Walk-in entry', action: () => go('manual_reg'), color: 'bg-violet-500' },
                    { label: 'Add Counselor', icon: ShieldCheck, sub: 'Create account', action: () => go('manage_counselors'), color: 'bg-sky-500' },
                    { label: 'Leaderboard', icon: Award, sub: 'Manage rankings', action: () => go('leaderboard'), color: 'bg-amber-500' },
                  ].map(a => (
                    a.href
                      ? <Link to={a.href} key={a.label}
                          className="flex items-center gap-3 bg-white border border-slate-200/70 rounded-xl px-4 py-3 hover:shadow-sm active:scale-[0.98] transition-all">
                          <div className={`w-8 h-8 ${a.color} rounded-lg flex items-center justify-center shrink-0`}>
                            <a.icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{a.label}</p>
                            <p className="text-[11px] text-slate-400">{a.sub}</p>
                          </div>
                        </Link>
                      : <button key={a.label} onClick={a.action!}
                          className="w-full flex items-center gap-3 bg-white border border-slate-200/70 rounded-xl px-4 py-3 hover:shadow-sm active:scale-[0.98] transition-all text-left">
                          <div className={`w-8 h-8 ${a.color} rounded-lg flex items-center justify-center shrink-0`}>
                            <a.icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{a.label}</p>
                            <p className="text-[11px] text-slate-400">{a.sub}</p>
                          </div>
                        </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── COLLEGES ── */}
          {tab === 'colleges' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Colleges</h2>
                  <p className="text-xs text-slate-400">{colleges.length} listed</p>
                </div>
                <Link to="/admin/add-college">
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl active:scale-95 transition-all">
                    <Plus className="h-4 w-4" /> Add College
                  </button>
                </Link>
              </div>
              <div className="space-y-2">
                {colleges.map((c, i) => (
                  <div key={c.id}
                    className="bg-white border border-slate-200/70 rounded-xl p-3.5 flex items-center gap-4 hover:shadow-sm transition-shadow group">
                    <img src={c.image} alt={c.name} className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{c.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{c.city}, {c.state}</p>
                      <div className="flex gap-1.5 mt-1">
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{c.type}</span>
                        <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">★ {c.rating}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/admin/edit-college/${c.id}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Edit className="h-3.5 w-3.5" /></Link>
                      <button onClick={() => { if (confirm('Delete?')) deleteCollege(c.id); }} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
                {colleges.length === 0 && (
                  <div className="text-center py-16">
                    <School className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No colleges yet. Add your first one.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── APPLICATIONS ── */}
          {tab === 'applications' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-5">
                <h2 className="text-lg font-black text-slate-900">Applications</h2>
                <p className="text-xs text-slate-400">{applications.length} total · {applications.filter(a => a.status === 'pending').length} pending</p>
              </div>
              <div className="space-y-3">
                {applications.map(a => (
                  <div key={a.id} className="bg-white border border-slate-200/70 rounded-xl overflow-hidden">
                    <div className="px-4 py-3.5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900">{a.studentName}</p>
                          <p className="text-[11px] text-slate-400 truncate">{a.collegeName} · {a.course}</p>
                          <p className="text-[10px] text-slate-300 mt-0.5">{a.studentPhone} · {a.studentEmail}</p>
                        </div>
                        <StatusPill status={a.status} />
                      </div>

                      {a.scholarshipAmount ? (
                        <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
                          🎓 Scholarship: <strong>₹{a.scholarshipAmount}</strong> — {a.scholarshipDetails}
                        </div>
                      ) : null}

                      {a.documentLink ? (
                        <div className="mt-2 text-[11px] text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Secure Documents Submitted</span>
                          <a href={a.documentLink} target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-blue-900 px-2 py-0.5 bg-blue-100 rounded-md">View Drive Link</a>
                        </div>
                      ) : null}

                      {a.counselorId ? (
                        <div className="mt-2 space-y-2">
                          <div className="text-[11px] text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg inline-block">
                            Counselor: <strong>{a.assignedCounselorName}</strong>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                            <span>{a.progress?.currentStage}</span>
                            <span>Step {a.progress?.step}/{a.progress?.totalSteps}</span>
                          </div>
                          {a.status === 'approved' && !a.incentiveAmount && (
                            <form onSubmit={e => { e.preventDefault(); assignIncentive(a.id, parseInt(incentiveForm)); setIncentiveForm(''); }} className="flex gap-2">
                              <input type="number" required placeholder="Incentive ₹" value={incentiveForm} onChange={e => setIncentiveForm(e.target.value)} className="flex-1 text-xs px-3 py-2 border border-amber-200 rounded-lg outline-none bg-amber-50" />
                              <button type="submit" className="bg-amber-500 text-white text-xs px-3 py-2 rounded-lg font-semibold">Assign</button>
                            </form>
                          )}
                          {a.incentiveAmount ? <p className="text-xs font-bold text-amber-600">₹{a.incentiveAmount} incentive granted ✓</p> : null}
                        </div>
                      ) : (
                        <div className="mt-2">
                          <select className="text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-teal-500 bg-slate-50 w-full sm:w-auto"
                            onChange={e => { const c = counselors.find(c => c.id === e.target.value); if (c) assignCounselor(a.id, c.id, c.name); }}>
                            <option value="">Assign counselor…</option>
                            {counselors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2">
                      {a.status === 'pending' && (
                        <button onClick={() => { updateApplicationStatus(a.id, 'under_review'); advanceApplicationStep(a.id); }}
                          className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg active:scale-95 transition-all">Verify & Review</button>
                      )}
                      {(a.status === 'pending' || a.status === 'under_review') && (
                        <>
                          <button onClick={() => { updateApplicationStatus(a.id, 'approved'); advanceApplicationStep(a.id); advanceApplicationStep(a.id); advanceApplicationStep(a.id); }}
                            className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg active:scale-95 transition-all">Approve</button>
                          <button onClick={() => updateApplicationStatus(a.id, 'rejected')}
                            className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg active:scale-95 transition-all">Reject</button>
                        </>
                      )}
                      <button onClick={() => setChatAppId({ id: a.id, name: a.studentName })}
                        className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-lg ml-auto active:scale-95 transition-all">
                        Secure Terminal
                      </button>
                    </div>
                  </div>
                ))}
                {applications.length === 0 && <div className="text-center py-16 text-slate-400 text-sm">No applications.</div>}
              </div>
            </motion.div>
          )}

          {/* ── STUDENTS ── */}
          {tab === 'registered_students' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-5">
                <h2 className="text-lg font-black text-slate-900">Students</h2>
                <p className="text-xs text-slate-400">{students.length} registered</p>
              </div>
              <div className="bg-white border border-slate-200/70 rounded-2xl overflow-hidden">
                <div className="divide-y divide-slate-50 lg:hidden">
                  {students.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-black shrink-0">
                        {s.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{s.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{s.email}</p>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">{new Date(s.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {students.length === 0 && <p className="text-center text-slate-400 text-sm py-10">No students yet.</p>}
                </div>
                <table className="hidden lg:table min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Name', 'Email', 'Joined'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {students.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">{s.name?.charAt(0)}</div>
                            <span className="text-sm font-semibold text-slate-900">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[12px] text-slate-500">{s.email}</td>
                        <td className="px-5 py-3 text-[12px] text-slate-400">{new Date(s.created_at || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {students.length === 0 && <tr><td colSpan={3} className="px-5 py-10 text-center text-slate-400 text-sm">No students.</td></tr>}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ── QUERIES ── */}
          {tab === 'queries' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-5">
                <h2 className="text-lg font-black text-slate-900">Queries</h2>
                <p className="text-xs text-slate-400">{queries.length} total · {queries.filter(q => q.status === 'open').length} open</p>
              </div>
              <div className="space-y-3">
                {queries.map(q => (
                  <div key={q.id} className="bg-white border border-slate-200/70 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{q.subject}</p>
                        <p className="text-[11px] text-slate-400">{q.studentName}</p>
                      </div>
                      <StatusPill status={q.status} />
                    </div>
                    <p className="text-[12px] text-slate-600 bg-slate-50 rounded-lg px-3 py-2 mb-3">{q.message}</p>
                    {q.response
                      ? <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3"><p className="text-xs text-emerald-800"><strong>Response: </strong>{q.response}</p></div>
                      : respondingQueryId === q.id ? (
                          <div className="flex flex-col gap-2 mt-2">
                            <textarea
                              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500 resize-none bg-slate-50"
                              rows={3}
                              placeholder="Type your response here..."
                              value={queryResponseText}
                              onChange={(e) => setQueryResponseText(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setRespondingQueryId(null)} className="text-xs font-semibold text-slate-500 px-3 py-1.5 hover:bg-slate-100 rounded-lg">Cancel</button>
                              <button onClick={() => handleRespondToQuery(q.id)} disabled={!queryResponseText.trim()} className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-all">Submit Response</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setRespondingQueryId(q.id)} className="text-xs font-semibold text-white px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all">Respond</button>
                        )
                    }
                  </div>
                ))}
                {queries.length === 0 && <div className="text-center py-16 text-slate-400 text-sm">No queries.</div>}
              </div>
            </motion.div>
          )}

          {/* ── MANUAL REG ── */}
          {tab === 'manual_reg' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
              <div className="mb-5">
                <h2 className="text-lg font-black text-slate-900">Walk-in Registration</h2>
                <p className="text-xs text-slate-400">Register a student directly without the public portal.</p>
              </div>
              <form onSubmit={handleManualReg} className="bg-white border border-slate-200/70 rounded-2xl p-5 space-y-4">
                {[
                  { label: 'Student Name', name: 'name', type: 'text' },
                  { label: 'Phone Number', name: 'phone', type: 'tel' },
                  { label: 'Course Interested', name: 'course', type: 'text', placeholder: 'e.g. B.Tech CS' },
                  { label: 'Email (optional)', name: 'email', type: 'email', required: false },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
                    <input type={f.type} name={f.name} placeholder={f.placeholder} required={f.required !== false}
                      className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-colors" />
                  </div>
                ))}
                <button type="submit" className="w-full text-sm font-bold text-white py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all mt-2">
                  Register Student
                </button>
              </form>
            </motion.div>
          )}

          {/* ── RULE BOOK ── */}
          {tab === 'rule_book' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-5">
                <h2 className="text-lg font-black text-slate-900">Rule Book & Incentives</h2>
                <p className="text-xs text-slate-400">Scholarship norms and counselor incentive structure.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'Scholarship Norms', icon: Book, bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-900', sub: 'text-indigo-700', dot: 'bg-indigo-400',
                    rules: ['90%+ in 12th: ₹50,000 merit waiver', 'National Sports Quota: 30% fee reduction', 'Before May 1st: ₹10,000 early bird discount'] },
                  { title: 'Counselor Incentives', icon: TrendingUp, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-900', sub: 'text-emerald-700', dot: 'bg-emerald-400',
                    rules: ['₹5,000 per successful admission', 'Top 50 NIRF college: +₹2,000 bonus', '10+ admissions/month: 20% multiplier'] },
                ].map(card => (
                  <div key={card.title} className={`${card.bg} border ${card.border} rounded-2xl p-5`}>
                    <div className="flex items-center gap-2 mb-4">
                      <card.icon className={`h-4 w-4 ${card.text}`} />
                      <h3 className={`text-sm font-bold ${card.text}`}>{card.title}</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {card.rules.map(r => (
                        <li key={r} className="flex items-start gap-2.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${card.dot} mt-1.5 shrink-0`} />
                          <span className={`text-sm ${card.sub}`}>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── MANAGE COUNSELORS ── */}
          {tab === 'manage_counselors' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-5">
                <h2 className="text-lg font-black text-slate-900">Counselors</h2>
                <p className="text-xs text-slate-400">{counselors.length} active accounts</p>
              </div>
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-white border border-slate-200/70 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Create Account</h3>
                  <p className="text-[11px] text-slate-400 mb-4">Counselors will use these credentials to log in.</p>
                  <form onSubmit={handleAddCounselor} className="space-y-3">
                    {[
                      { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Dr. Jane Smith' },
                      { label: 'Email', name: 'email', type: 'email', placeholder: 'jane@example.com' },
                      { label: 'Password', name: 'password', type: 'text', placeholder: 'Secure password' },
                    ].map(f => (
                      <div key={f.name}>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">{f.label}</label>
                        <input required type={f.type} name={f.name} placeholder={f.placeholder}
                          className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:bg-white transition-colors" />
                      </div>
                    ))}
                    <button type="submit" className="w-full text-sm font-bold text-white py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all mt-2">
                      Create Counselor Account
                    </button>
                  </form>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Active Counselors</h3>
                  <div className="space-y-2">
                    {counselors.map(c => (
                      <div key={c.id} className="bg-white border border-slate-200/70 rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-black text-xs shrink-0">{c.name.charAt(0)}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{c.email}</p>
                        </div>
                        <StatusPill status="approved" />
                      </div>
                    ))}
                    {counselors.length === 0 && <div className="text-center p-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">No counselors yet.</div>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── COUNSELOR APPLICATIONS ── */}
          {tab === 'counselor_applications' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-5">
                <h2 className="text-lg font-black text-slate-900">Counselor Requests</h2>
                <p className="text-xs text-slate-400">{pendingCounselorApps} pending review</p>
              </div>
              <div className="space-y-4">
                {counselorApplications.map(app => (
                  <div key={app.id} className="bg-white border border-slate-200/70 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-slate-900">{app.fullName}</p>
                          <p className="text-sm text-slate-400">{app.designation}{app.orgName ? ` @ ${app.orgName}` : ''}</p>
                        </div>
                        <StatusPill status={app.status} />
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                          { label: 'Contact', val: `${app.email} · ${app.mobile}` },
                          { label: 'Location', val: `${app.city}, ${app.state}` },
                          { label: 'Experience', val: `${app.experience} yrs · ${app.specialization}` },
                          { label: 'Bank', val: `${app.bankName} · ${app.accNumber}` },
                        ].map(d => (
                          <div key={d.label} className="bg-slate-50 rounded-lg p-2.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{d.label}</p>
                            <p className="text-xs text-slate-700 leading-relaxed">{d.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {app.status === 'pending' && (
                      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                        <button onClick={() => handleApproveCounselor(app)} className="flex items-center gap-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl active:scale-95 transition-all">
                          <Check className="h-3.5 w-3.5" /> Approve & Send Credentials
                        </button>
                        <button className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl active:scale-95 transition-all">
                          <X className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {counselorApplications.length === 0 && <div className="text-center py-16 text-slate-400 text-sm">No applications.</div>}
              </div>
            </motion.div>
          )}

          {/* ── LEADERBOARD ── */}
          {tab === 'leaderboard' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-5">
                <h2 className="text-lg font-black text-slate-900">Leaderboard</h2>
                <p className="text-xs text-slate-400">Manage rankings and counselor marquee banner.</p>
              </div>

              <div className="bg-white border border-slate-200/70 rounded-2xl p-5 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Megaphone className="h-4 w-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900">Marquee Banner</h3>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">Scrolling incentive text on the Counselor Dashboard.</p>
                <div className="flex gap-2">
                  <input type="text" className="flex-1 text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-colors"
                    value={marqueeOffer} onChange={e => setMarqueeOffer(e.target.value)} placeholder="🎉 e.g. Complete 5 admissions to get ₹10,000!" />
                  <button onClick={handleSaveMarquee} disabled={isSavingMarquee}
                    className="flex items-center gap-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2.5 rounded-xl disabled:opacity-50 active:scale-95 transition-all">
                    <Save className="h-3.5 w-3.5" /> {isSavingMarquee ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200/70 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Counselor Rankings</h3>
                  <p className="text-[11px] text-slate-400">Blur fake admissions to trigger competitive drive.</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {counselors.map((c: any, idx) => (
                    <div key={c.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                      <span className="text-base w-6 text-center shrink-0">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : <span className="text-xs font-bold text-slate-400">#{idx+1}</span>}</span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-black shrink-0">{c.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                        <p className="text-[11px] text-slate-400">Real: {c.realAdmissions || 0}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-[10px] text-slate-400 mb-0.5 text-center">Fake</p>
                          <input type="number" defaultValue={c.fakeAdmissions || 0}
                            onBlur={e => updateCounselorFakeAdmissions(c.id, parseInt(e.target.value) || 0)}
                            className="w-16 text-center text-xs px-2 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-teal-500 bg-slate-50" />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 mb-0.5">Total</p>
                          <p className="text-base font-black text-teal-600">{(c.realAdmissions || 0) + (c.fakeAdmissions || 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {counselors.length === 0 && <p className="text-center text-slate-400 text-sm py-10">No counselors yet.</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SUBADMINS ── */}
          {user?.role === 'admin' && tab === 'subadmins' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-5">
                <h2 className="text-lg font-black text-slate-900">Subadmins</h2>
                <p className="text-xs text-slate-400">Grant limited admin access to team members.</p>
              </div>
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-white border border-slate-200/70 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Grant Access</h3>
                  <p className="text-[11px] text-slate-400 mb-4">The user must already have an account on the platform.</p>
                  <form onSubmit={async e => { e.preventDefault(); const fd = new FormData(e.currentTarget); await addSubadmin(fd.get('email') as string); (e.target as HTMLFormElement).reset(); }} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email Address</label>
                      <input required type="email" name="email" placeholder="subadmin@example.com" className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-500 transition-colors" />
                    </div>
                    <button type="submit" className="w-full text-sm font-bold text-white py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all">Grant Access</button>
                  </form>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Authorized ({subadmins.length})</h3>
                  <div className="space-y-2">
                    {subadmins.map(s => (
                      <div key={s.id} className="bg-white border border-slate-200/70 rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-black shrink-0">{s.name?.charAt(0)}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">{s.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{s.email}</p>
                        </div>
                        <button onClick={() => removeSubadmin(s.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {subadmins.length === 0 && <div className="text-center p-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">No subadmins yet.</div>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200/80">
        <div className="flex">
          {BOTTOM_TABS.map(id => {
            const Icon = BOTTOM_ICONS[id];
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${active ? 'text-teal-600' : 'text-slate-400'}`}>
                <Icon className={`h-5 w-5 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                <span className="text-[9px] font-bold capitalize">{id.replace('registered_students', 'students').replace('_', ' ')}</span>
                {active && <motion.div layoutId="tab-dot" className="w-1 h-1 rounded-full bg-teal-500" />}
              </button>
            );
          })}
          <button onClick={() => setDrawerOpen(true)} className="flex-1 flex flex-col items-center py-2.5 gap-0.5 text-slate-400">
            <Menu className="h-5 w-5" />
            <span className="text-[9px] font-bold">More</span>
          </button>
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
