import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, FileText, CheckCircle, TrendingUp, X, Award, MessageSquare,
  Upload, Plus, Clock, Camera, Save, Home, DollarSign, UserCircle,
  UserPlus, QrCode, ChevronRight, Menu, GraduationCap, Copy, Check,
  AlertCircle, ArrowUpRight, Circle, Star, FolderHeart
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { useCollegeStore } from '../store/collegeStore';
import { useAuthStore } from '../store/authStore';
import {
  uploadAvatar, updateUserProfile, fetchCounselorTasks,
  addCounselorTask, updateCounselorTask, deleteCounselorTask, uploadDocumentToDB,
  fetchCounselorBadges
} from '../lib/supabase';
import ApplicationChat from '../components/ApplicationChat';

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: 'text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200',
    rejected: 'text-red-500 bg-red-50 ring-1 ring-red-200',
    under_review: 'text-amber-600 bg-amber-50 ring-1 ring-amber-200',
    counseling: 'text-sky-600 bg-sky-50 ring-1 ring-sky-200',
    pending: 'text-slate-500 bg-slate-100',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase shrink-0 ${styles[status] || 'text-slate-500 bg-slate-100'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

type View = 'home' | 'students' | 'earnings' | 'profile' | 'resources';

export default function CounselorDashboard() {
  const [view, setView] = useState<View>('home');
  const [sel, setSelId] = useState<string | null>(null);
  const [scholarshipForm, setScholarshipForm] = useState<{ amount: string; details: string; documentLink?: string } | null>(null);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, updateUser } = useAuthStore();
  const counselorName = user?.name || 'Counselor';
  const counselorId = user?.id || 'counselor1';

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [chatAppId, setChatAppId] = useState<{ id: string; name: string } | null>(null);
  const [badges, setBadges] = useState<any[]>([]);

  const registrationUrl = `${window.location.origin}/#/register/${user?.id || 'demo'}?cName=${encodeURIComponent(counselorName)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(registrationUrl)}`;

  const {
    applications, initializeData, setupRealtime, queries,
    manuallyRegisterStudent, addQuery, counselors, marqueeOffer,
    updateScholarship, advanceApplicationStep, toggleHotLead, submitDocumentLink
  } = useAdminStore();
  const { colleges } = useCollegeStore();

  useEffect(() => {
    initializeData().then(() => setupRealtime());
  }, []);

  useEffect(() => {
    const ld = async () => {
      if (user?.id) {
        fetchCounselorTasks(user.id).then(setTasks);
        const bdg = await fetchCounselorBadges(user.id);
        setBadges(bdg || []);
      }
    };
    ld();
  }, [user?.id]);

  const myApps = applications.filter(a => a.counselorId === counselorId);
  // Sort: Hot leads first, then by date descending
  myApps.sort((a, b) => {
    if (a.isHotLead && !b.isHotLead) return -1;
    if (!a.isHotLead && b.isHotLead) return 1;
    return new Date(b.appliedDate || 0).getTime() - new Date(a.appliedDate || 0).getTime();
  });

  const stats = {
    total: myApps.length,
    pending: myApps.filter(a => a.status === 'pending' || a.status === 'under_review').length,
    approved: myApps.filter(a => a.status === 'approved').length,
    counseling: myApps.filter(a => a.status === 'counseling').length,
  };
  const earned = myApps.reduce((s, a) => s + (a.incentiveAmount || 0), 0);
  const conversions = myApps.filter(a => a.incentiveAmount && a.incentiveAmount > 0).length;

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user?.id) return;
    const t = await addCounselorTask(user.id, newTask.trim());
    if (t) setTasks(p => [t, ...p]);
    setNewTask('');
  };

  const handleToggleTask = async (id: string, done: boolean) => {
    await updateCounselorTask(id, !done);
    setTasks(p => p.map(t => t.id === id ? { ...t, is_completed: !done } : t));
  };

  const handleDeleteTask = async (id: string) => {
    await deleteCounselorTask(id);
    setTasks(p => p.filter(t => t.id !== id));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const preview = ev.target?.result as string;
      setProfileForm(p => ({ ...p, avatar: preview }));
      try {
        const url = await uploadAvatar(user.id, file);
        if (url) {
          setProfileForm(p => ({ ...p, avatar: url }));
          await updateUserProfile(user.id, { avatar: url });
          updateUser({ avatar: url });
        }
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsUploading(true);
    const ok = await updateUserProfile(user.id, { name: profileForm.name, phone: profileForm.phone });
    setIsUploading(false);
    if (ok) updateUser({ name: profileForm.name, phone: profileForm.phone });
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    manuallyRegisterStudent({
      studentName: fd.get('name') as string,
      studentEmail: fd.get('email') as string,
      studentPhone: fd.get('phone') as string,
      studentDob: fd.get('dob') as string,
      studentGender: fd.get('gender') as string,
      studentCity: fd.get('city') as string,
      highSchoolMarks: fd.get('marks') as string,
      course: fd.get('course') as string,
      collegeId: fd.get('college') as string,
      documentLink: fd.get('documentLink') as string,
      counselorId,
      assignedCounselorName: counselorName,
    });
    setShowRegModal(false);
  };

  const handleSendMsg = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addQuery({
      studentId: user?.id,
      studentName: `Counselor: ${counselorName}`,
      studentEmail: user?.email || 'counselor@example.com',
      subject: fd.get('subject') as string,
      message: fd.get('message') as string,
    });
    setShowMsgModal(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const NAV = [
    { id: 'home' as View, icon: Home, label: 'Home' },
    { id: 'students' as View, icon: Users, label: 'Students' },
    { id: 'earnings' as View, icon: DollarSign, label: 'Earnings' },
    { id: 'resources' as View, icon: FolderHeart, label: 'Resources' },
    { id: 'profile' as View, icon: UserCircle, label: 'Profile' },
  ];

  /* ─── Sheet modal wrapper ─── */
  const Sheet = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <div className="overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-[#f7f7f8]" style={{ fontFamily: "'Inter', sans-serif", paddingBottom: '64px' }}>

      {/* Marquee */}
      {marqueeOffer && (
        <div className="bg-[#0e0e10] text-slate-400 text-[11px] py-1.5 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex shrink-0">
            {[0, 1, 2].map(i => (
              <span key={i} className="mx-10 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-teal-500 inline-block" />
                {marqueeOffer}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/70 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div
            onClick={() => setView('profile')}
            className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black cursor-pointer overflow-hidden shrink-0"
          >
            {profileForm.avatar
              ? <img src={profileForm.avatar} alt="" className="w-full h-full object-cover" />
              : counselorName.charAt(0).toUpperCase()
            }
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium leading-none mb-0.5">Welcome back</p>
            <p className="text-sm font-bold text-slate-900 leading-none">{counselorName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {badges.map(b => (
            <span key={b.id} className="text-sm">{b.icon_url === 'star' ? '⭐' : b.icon_url === 'crown' ? '👑' : '🏅'}</span>
          ))}
          <button onClick={() => setShowQR(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-100 active:scale-95 transition-all">
            <QrCode className="h-3.5 w-3.5" /> QR
          </button>
        </div>
      </header>

      {/* ── HOME ── */}
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 max-w-lg mx-auto space-y-4">

            {/* Stat row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Total', val: stats.total, color: 'text-slate-900' },
                { label: 'Pending', val: stats.pending, color: 'text-amber-600' },
                { label: 'Approved', val: stats.approved, color: 'text-emerald-600' },
                { label: 'Counseling', val: stats.counseling, color: 'text-sky-600' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white border border-slate-200/70 rounded-xl p-3 text-center">
                  <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Earnings strip */}
            <button onClick={() => setView('earnings')}
              className="w-full bg-[#0e0e10] rounded-xl px-4 py-3.5 flex items-center justify-between group active:scale-[0.99] transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-900 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-teal-400" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Earned</p>
                  <p className="text-lg font-black text-white">₹{earned.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">{conversions} conversions</span>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Register Student', sub: 'Walk-in entry', icon: UserPlus, action: () => setShowRegModal(true), color: 'bg-teal-500' },
                { label: 'Message Admin', sub: 'Send a query', icon: MessageSquare, action: () => setShowMsgModal(true), color: 'bg-violet-500' },
              ].map(a => (
                <button key={a.label} onClick={a.action}
                  className="bg-white border border-slate-200/70 rounded-xl px-4 py-3.5 text-left hover:shadow-sm active:scale-[0.98] transition-all">
                  <div className={`w-7 h-7 ${a.color} rounded-lg flex items-center justify-center mb-2.5`}>
                    <a.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">{a.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{a.sub}</p>
                </button>
              ))}
            </div>

            {/* Task list */}
            <div className="bg-white border border-slate-200/70 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Follow-ups</p>
                <span className="text-[10px] text-slate-400 font-semibold">{tasks.filter(t => !t.is_completed).length} active</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-44 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No tasks. You're all clear!</p>
                ) : tasks.map(t => (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 group hover:bg-slate-50 transition-colors">
                    <button onClick={() => handleToggleTask(t.id, t.is_completed)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                        ${t.is_completed ? 'bg-teal-500 border-teal-500' : 'border-slate-300 hover:border-teal-400'}`}>
                      {t.is_completed && <Check className="h-2.5 w-2.5 text-white" />}
                    </button>
                    <span className={`text-xs flex-1 ${t.is_completed ? 'line-through text-slate-300' : 'text-slate-700'}`}>{t.task_text}</span>
                    <button onClick={() => handleDeleteTask(t.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-400 transition-all">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddTask} className="flex items-center gap-2 px-3 py-2.5 border-t border-slate-100">
                <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add a follow-up task…"
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-500 transition-colors" />
                <button type="submit" disabled={!newTask.trim()} className="p-2 bg-teal-600 disabled:bg-slate-200 text-white rounded-lg active:scale-95 transition-all">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            {/* Leaderboard preview */}
            <div className="bg-white border border-slate-200/70 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">This Month's Leaders</p>
              </div>
              <div className="divide-y divide-slate-50">
                {[...counselors]
                  .sort((a, b) => (b.totalAdmissions || 0) - (a.totalAdmissions || 0))
                  .slice(0, 3)
                  .map((c, idx) => (
                    <div key={c.id} className={`flex items-center gap-3 px-4 py-3 ${c.id === counselorId ? 'bg-teal-50' : ''}`}>
                      <span className="text-base w-5 shrink-0">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                      <p className="text-sm font-semibold text-slate-800 flex-1 truncate">
                        {c.name} {c.id === counselorId && <span className="text-[10px] text-teal-600 font-bold">(you)</span>}
                      </p>
                      <p className="text-sm font-black text-teal-600">{c.totalAdmissions || 0}</p>
                    </div>
                  ))}
                {counselors.length === 0 && <p className="text-xs text-slate-400 text-center py-5">No data yet.</p>}
              </div>
            </div>

          </motion.div>
        )}

        {/* ── STUDENTS ── */}
        {view === 'students' && (
          <motion.div key="students" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-slate-900">My Students</h2>
                <p className="text-[11px] text-slate-400">{myApps.length} assigned</p>
              </div>
              <button onClick={() => setShowRegModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 px-3 py-2 rounded-xl active:scale-95 transition-all">
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>

            {myApps.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
                <Users className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No students yet.</p>
                <button onClick={() => setShowRegModal(true)} className="mt-3 text-xs font-semibold text-teal-600 hover:text-teal-700">Register one →</button>
              </div>
            ) : (
              <div className="space-y-2">
                {myApps.map(a => (
                  <div key={a.id} className="bg-white border border-slate-200/70 rounded-xl overflow-hidden">
                    <button className="w-full text-left px-4 py-3.5" onClick={() => setSelId(sel === a.id ? null : a.id)}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex items-center gap-1.5 flex-1">
                          <button onClick={(e) => { e.stopPropagation(); toggleHotLead(a.id); }} className="active:scale-90 transition-all shrink-0">
                            <Star className={`h-4 w-4 ${a.isHotLead ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                          </button>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{a.studentName}</p>
                            <p className="text-[11px] text-slate-400 truncate">{a.collegeName} · {a.course}</p>
                          </div>
                        </div>
                        <StatusPill status={a.status} />
                      </div>
                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                          <span>{a.progress?.currentStage || 'Received'}</span>
                          <span>{a.progress?.step || 1}/{a.progress?.totalSteps || 5}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full transition-all"
                            style={{ width: `${((a.progress?.step || 1) / (a.progress?.totalSteps || 5)) * 100}%` }} />
                        </div>
                      </div>
                    </button>

                    {/* Expanded */}
                    <AnimatePresence>
                      {sel === a.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-slate-100">
                          <div className="px-4 py-3 space-y-2">
                            <p className="text-[11px] text-slate-400">{a.studentPhone}</p>
                            {a.scholarshipAmount && (
                              <p className="text-[11px] text-emerald-600 font-semibold">🎓 Scholarship: ₹{a.scholarshipAmount} — {a.scholarshipDetails}</p>
                            )}

                            {scholarshipForm ? (
                              <form onClick={e => e.stopPropagation()}
                                onSubmit={e => { 
                                  e.preventDefault(); 
                                  updateScholarship(a.id, parseInt(scholarshipForm.amount), scholarshipForm.details); 
                                  if (scholarshipForm.documentLink) {
                                    useAdminStore.getState().submitDocumentLink(a.id, scholarshipForm.documentLink);
                                  }
                                  setScholarshipForm(null); 
                                }}
                                className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 space-y-2">
                                <p className="text-[11px] font-bold text-emerald-800">Add Scholarship</p>
                                <input type="number" required placeholder="Amount ₹" value={scholarshipForm.amount} onChange={e => setScholarshipForm({ ...scholarshipForm, amount: e.target.value })}
                                  className="w-full text-xs px-3 py-2 bg-white border border-emerald-200 rounded-lg outline-none" />
                                <input type="text" required placeholder="Reason" value={scholarshipForm.details} onChange={e => setScholarshipForm({ ...scholarshipForm, details: e.target.value })}
                                  className="w-full text-xs px-3 py-2 bg-white border border-emerald-200 rounded-lg outline-none" />
                                <input type="url" placeholder="Google Drive Link (Optional)" value={scholarshipForm.documentLink || ''} onChange={e => setScholarshipForm({ ...scholarshipForm, documentLink: e.target.value })}
                                  className="w-full text-xs px-3 py-2 bg-white border border-emerald-200 rounded-lg outline-none focus:border-teal-500" />
                                <div className="flex gap-2">
                                  <button type="submit" className="flex-1 text-xs font-bold text-white bg-emerald-600 py-2 rounded-lg">Save</button>
                                  <button type="button" onClick={() => setScholarshipForm(null)} className="flex-1 text-xs font-bold text-slate-600 bg-slate-100 py-2 rounded-lg">Cancel</button>
                                </div>
                              </form>
                            ) : (
                              <div className="flex gap-2">
                                <button onClick={() => setScholarshipForm({ amount: '', details: '' })}
                                  className="flex-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 py-2 rounded-xl active:scale-95 transition-all">
                                  + Scholarship
                                </button>
                                <button onClick={() => setChatAppId({ id: a.id, name: a.studentName })}
                                  className="flex-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 py-2 rounded-xl active:scale-95 transition-all">
                                  Secure Terminal
                                </button>
                              </div>
                            )}

                            <label className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all">
                              <Upload className="h-3.5 w-3.5" /> Upload Document
                              <input type="file" className="hidden" onChange={async e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const docs = await uploadDocumentToDB(file, a.id, a.documents || []);
                                if (docs) alert('Uploaded!');
                              }} />
                            </label>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── EARNINGS ── */}
        {view === 'earnings' && (
          <motion.div key="earnings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 max-w-lg mx-auto">
            <div className="mb-4">
              <h2 className="text-base font-black text-slate-900">Earnings</h2>
              <p className="text-[11px] text-slate-400">Your incentive breakdown</p>
            </div>

            <div className="bg-[#0e0e10] rounded-2xl p-5 mb-4">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Earned</p>
              <p className="text-4xl font-black text-white mb-4">₹{earned.toLocaleString()}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Conversions', val: conversions },
                  { label: 'In Progress', val: myApps.filter(a => a.status !== 'approved' && a.status !== 'rejected').length },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-3">
                    <p className="text-2xl font-black text-white">{s.val}</p>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-xs font-bold text-white">Bonus Target (10 Admissions)</p>
                  <p className="text-xs text-amber-400 font-bold">{conversions}/10</p>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (conversions / 10) * 100)}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Only {Math.max(0, 10 - conversions)} more admissions to unlock a ₹10,000 bonus!</p>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white border border-slate-200/70 rounded-xl overflow-hidden mb-4 shadow-sm">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Award className="h-4 w-4 text-amber-500" /> Top Counselors</p>
              </div>
              <div className="divide-y divide-slate-50">
                {counselors.sort((a, b) => (b.totalAdmissions || 0) - (a.totalAdmissions || 0)).slice(0, 3).map((c, idx) => (
                  <div key={c.id} className="flex items-center px-4 py-3 gap-3">
                    <span className="text-base w-5 shrink-0 text-center">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                    <p className="text-sm font-semibold text-slate-800 flex-1 truncate">
                      {c.name} {c.id === user?.id && <span className="text-[10px] text-teal-600 font-bold ml-1">(You)</span>}
                    </p>
                    <p className="text-sm font-black text-teal-600">{c.totalAdmissions || 0} <span className="text-[10px] font-semibold text-slate-400">adm</span></p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200/70 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">History</p>
              </div>
              <div className="divide-y divide-slate-50">
                {myApps.filter(a => a.incentiveAmount && a.incentiveAmount > 0).map(a => (
                  <div key={a.id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{a.studentName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{a.collegeName}</p>
                    </div>
                    <span className="text-sm font-black text-emerald-600 shrink-0 ml-3">+₹{a.incentiveAmount?.toLocaleString()}</span>
                  </div>
                ))}
                {conversions === 0 && <p className="text-xs text-slate-400 text-center py-8">No earnings yet. Keep going!</p>}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PROFILE ── */}
        {view === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 max-w-lg mx-auto space-y-4">
            <div className="mb-2">
              <h2 className="text-base font-black text-slate-900">Profile</h2>
            </div>

            {/* Avatar card */}
            <div className="bg-white border border-slate-200/70 rounded-xl p-5 flex flex-col items-center">
              <div className="relative mb-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 rounded-full bg-slate-900 overflow-hidden flex items-center justify-center text-white text-2xl font-black border-2 border-slate-100 relative">
                  {profileForm.avatar
                    ? <img src={profileForm.avatar} alt="" className="w-full h-full object-cover" />
                    : counselorName.charAt(0).toUpperCase()
                  }
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Camera className="h-3 w-3 text-white" />
                </div>
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
              <p className="font-bold text-slate-900">{counselorName}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>

            {/* Badges card */}
            <div className="bg-white border border-slate-200/70 rounded-xl p-5 mb-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Award className="h-4 w-4 text-emerald-500"/> My Badges</h3>
              {badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {badges.map(b => (
                    <div key={b.id} className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
                      <span className="text-base">{b.icon_url === 'star' ? '⭐' : b.icon_url === 'medal' ? '🏅' : '👑'}</span>
                      <span className="text-[11px] font-bold text-amber-800">{b.badge_name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Complete your first admission to earn a badge!</p>
              )}
            </div>

            {/* Edit form */}
            <div className="bg-white border border-slate-200/70 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Edit Information</h3>
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Phone Number', key: 'phone', type: 'tel' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <input type={f.type} value={(profileForm as any)[f.key]} onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-colors" />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Email</label>
                <input type="email" disabled value={user?.email || ''}
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 cursor-not-allowed" />
              </div>
              <button onClick={handleSaveProfile} disabled={isUploading}
                className="w-full text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 py-3 rounded-xl active:scale-95 transition-all">
                {isUploading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

            <button onClick={() => setShowQR(true)}
              className="w-full bg-white border border-slate-200/70 rounded-xl px-4 py-3.5 flex items-center justify-between hover:shadow-sm active:scale-[0.99] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-slate-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900">My QR Code</p>
                  <p className="text-[11px] text-slate-400">Share for self-registration</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </button>
          </motion.div>
        )}

        {/* ── RESOURCES ── */}
        {view === 'resources' && (
          <motion.div key="resources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 max-w-lg mx-auto pb-24">
            <div className="mb-5">
              <h2 className="text-base font-black text-slate-900">Marketing & Resources</h2>
              <p className="text-[11px] text-slate-400">Materials to help you close more admissions</p>
            </div>

            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FolderHeart className="w-24 h-24 text-teal-900" />
                </div>
                <h3 className="font-bold text-teal-900 relative z-10 mb-1">WhatsApp Templates</h3>
                <p className="text-xs text-teal-700 relative z-10 mb-4">Copy these proven messages and send them to your leads!</p>
                
                <div className="space-y-3 relative z-10">
                  {[
                    { title: 'Intro Message', text: `Hi there! 👋 I am ${counselorName}, an admission counselor. Are you looking for top colleges this year? Let me help you get a confirmed seat + scholarship! Register here: ${registrationUrl}` },
                    { title: 'Follow-up', text: `Hey! Just following up on your college admission process. We have a few seats left in top engineering colleges with amazing placement records. Call me to block yours! 🎓` }
                  ].map((tpl, i) => (
                    <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-teal-50/50">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tpl.title}</p>
                        <button onClick={() => { navigator.clipboard.writeText(tpl.text); alert('Copied!'); }} className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">Copy</button>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{tpl.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200/70 rounded-2xl p-5">
                <h3 className="font-bold text-slate-900 mb-1">College Brochures</h3>
                <p className="text-[11px] text-slate-400 mb-4">Download PDF brochures to share with parents and students.</p>
                
                <div className="space-y-2">
                  {colleges.slice(0, 3).map(c => (
                    <div key={c.id} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-rose-500 shrink-0" />
                        <p className="text-xs font-semibold text-slate-700 truncate">{c.name} 2026.pdf</p>
                      </div>
                      <button className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg active:scale-95 shrink-0" onClick={() => alert('Brochure downloading...')}>Get</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Nav ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200/70">
        <div className="flex max-w-md mx-auto">
          {NAV.map(item => {
            const active = view === item.id;
            return (
              <button key={item.id} onClick={() => setView(item.id)}
                className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${active ? 'text-teal-600' : 'text-slate-400'}`}>
                <item.icon className="h-5 w-5" />
                <span className="text-[9px] font-bold">{item.label}</span>
                {active && <motion.div layoutId="cnav-dot" className="w-1 h-1 rounded-full bg-teal-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Register Modal ── */}
      <Sheet open={showRegModal} onClose={() => setShowRegModal(false)} title="Register Walk-in Student">
        <form onSubmit={handleRegister} className="p-5 space-y-3">
          {[
            { label: 'Student Name', name: 'name', type: 'text', required: true },
            { label: 'Phone', name: 'phone', type: 'tel', required: true },
            { label: 'Email', name: 'email', type: 'email', required: false },
            { label: 'Date of Birth', name: 'dob', type: 'date', required: true },
            { label: 'City', name: 'city', type: 'text', required: true },
            { label: 'High School Marks (%)', name: 'marks', type: 'number', required: true },
            { label: 'Course Interested', name: 'course', type: 'text', required: true },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">{f.label}</label>
              <input type={f.type} name={f.name} required={f.required}
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-colors" />
            </div>
          ))}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Google Drive Link (Docs)</label>
            <input type="url" name="documentLink" placeholder="Optional"
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Gender</label>
            <select name="gender" required className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500">
              <option value="">Select…</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Target College</label>
            <select name="college" required className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500">
              <option value="">Select college…</option>
              {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 py-3 rounded-xl active:scale-95 transition-all mt-2">
            Submit Registration
          </button>
        </form>
      </Sheet>

      {/* ── Message Modal ── */}
      <Sheet open={showMsgModal} onClose={() => setShowMsgModal(false)} title="Message Administration">
        <div className="p-5 overflow-y-auto max-h-[80vh]">
          <form onSubmit={handleSendMsg} className="space-y-4 mb-6">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Subject</label>
              <input required name="subject" className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wide">Message</label>
              <textarea required name="message" rows={3} className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 resize-none transition-colors" />
            </div>
            <button type="submit" className="w-full text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 py-3 rounded-xl active:scale-95 transition-all">
              Send Message
            </button>
          </form>

          {queries.filter(q => q.studentId === user?.id).length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Past Messages</h3>
              <div className="space-y-3">
                {queries.filter(q => q.studentId === user?.id).map(q => (
                  <div key={q.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="flex justify-between mb-1">
                      <p className="text-xs font-bold text-slate-800">{q.subject}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${q.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {q.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-2">{q.message}</p>
                    {q.response && (
                      <div className="bg-white border border-emerald-100 rounded-lg p-2">
                        <p className="text-[10px] text-emerald-800"><strong>Admin Reply: </strong>{q.response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Sheet>

      {/* ── QR Modal ── */}
      <Sheet open={showQR} onClose={() => setShowQR(false)} title="My Registration QR">
        <div className="p-5 flex flex-col items-center">
          <p className="text-xs text-slate-400 text-center mb-5">Students scan this to self-register under your name.</p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5">
            <img src={qrCodeUrl} alt="QR Code" className="w-52 h-52 object-contain" />
          </div>
          <div className="w-full">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Or share the link</p>
            <div className="flex gap-2">
              <input readOnly value={registrationUrl} className="flex-1 text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 outline-none" />
              <button onClick={handleCopy}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 ${copied ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </Sheet>

      {/* ── Chat ── */}
      <AnimatePresence>
        {chatAppId && (
          <ApplicationChat appId={chatAppId.id} studentName={chatAppId.name}
            currentUserId={user?.id || ''} currentUserRole="counselor" onClose={() => setChatAppId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
