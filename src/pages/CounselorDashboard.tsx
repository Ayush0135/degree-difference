import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, CheckCircle, TrendingUp, X, Award, MessageSquare, Upload, Plus, Clock, Camera, Save, ArrowRight, Home, DollarSign, BarChart2, UserCircle, UserPlus, QrCode, ChevronRight, Sparkles } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { useCollegeStore } from '../store/collegeStore';
import { useAuthStore } from '../store/authStore';
import { uploadAvatar, updateUserProfile, fetchCounselorTasks, addCounselorTask, updateCounselorTask, deleteCounselorTask, uploadDocumentToDB } from '../lib/supabase';
import ApplicationChat from '../components/ApplicationChat';

function Badge({ status }: { status: string }) {
  const m: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    under_review: 'bg-amber-100 text-amber-700',
    counseling: 'bg-cyan-100 text-cyan-700',
    pending: 'bg-slate-100 text-slate-600'
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 uppercase ${m[status] || 'bg-slate-100 text-slate-600'}`}>{status.replace('_', ' ')}</span>;
}

export default function CounselorDashboard() {
  const [sel, setSel] = useState<string | null>(null);
  const [scholarshipForm, setScholarshipForm] = useState<{amount: string, details: string} | null>(null);
  const [showRegForm, setShowRegForm] = useState(false);
  const [showMsgForm, setShowMsgForm] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [view, setView] = useState<'dashboard' | 'students' | 'earnings' | 'profile'>('dashboard');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, updateUser } = useAuthStore();
  const counselorName = user?.name || 'Counselor';

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [chatAppId, setChatAppId] = useState<{id: string, name: string} | null>(null);
  const [badges, setBadges] = useState<any[]>([]);

  const registrationUrl = `${window.location.origin}/#/register/${user?.id || 'demo'}?cName=${encodeURIComponent(counselorName)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registrationUrl)}`;

  useEffect(() => {
    if (user?.id) {
      import('../lib/supabase').then(s => {
        s.fetchCounselorTasks(user.id).then(setTasks);
        s.fetchCounselorBadges(user.id).then(setBadges);
      });
    }
  }, [user?.id]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !user?.id) return;
    const task = await addCounselorTask(user.id, newTaskText);
    if (task) setTasks([task, ...tasks]);
    setNewTaskText('');
  };

  const handleToggleTask = async (id: string, currentStatus: boolean) => {
    await updateCounselorTask(id, !currentStatus);
    setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
  };

  const handleDeleteTask = async (id: string) => {
    await deleteCounselorTask(id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setProfileForm(prev => ({ ...prev, avatar: dataUrl }));
      try {
        const publicUrl = await uploadAvatar(user.id, file);
        if (publicUrl) {
          setProfileForm(prev => ({ ...prev, avatar: publicUrl }));
          await updateUserProfile(user.id, { avatar: publicUrl });
          updateUser({ avatar: publicUrl });
        } else {
          setProfileForm(prev => ({ ...prev, avatar: user.avatar || '' }));
        }
      } catch (err) {
        setProfileForm(prev => ({ ...prev, avatar: user.avatar || '' }));
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsUploading(true);
    const success = await updateUserProfile(user.id, { name: profileForm.name, phone: profileForm.phone });
    setIsUploading(false);
    if (success) {
      updateUser({ name: profileForm.name, phone: profileForm.phone });
      alert('Profile updated!');
    }
  };

  const counselorId = user?.id || 'counselor1';
  const { applications, updateScholarship, advanceApplicationStep, initializeData, setupRealtime, manuallyRegisterStudent, addQuery, counselors, marqueeOffer } = useAdminStore();
  const { colleges } = useCollegeStore();

  useEffect(() => {
    initializeData().then(() => setupRealtime());
  }, [initializeData, setupRealtime]);

  const apps = applications.filter(a => a.counselorId === counselorId);
  const totalApps = apps.length;
  const pendingApps = apps.filter(a => a.status === 'under_review' || a.status === 'pending').length;
  const approvedApps = apps.filter(a => a.status === 'approved').length;
  const counselingApps = apps.filter(a => a.status === 'counseling').length;

  const applicationsWithIncentives = apps.filter(a => a.incentiveAmount && a.incentiveAmount > 0);
  const totalEarnings = applicationsWithIncentives.reduce((sum, a) => sum + (a.incentiveAmount || 0), 0);

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    manuallyRegisterStudent({
      studentName: formData.get('name') as string,
      studentEmail: formData.get('email') as string,
      studentPhone: formData.get('phone') as string,
      studentDob: formData.get('dob') as string,
      studentGender: formData.get('gender') as string,
      studentCity: formData.get('city') as string,
      highSchoolMarks: formData.get('marks') as string,
      course: formData.get('course') as string,
      collegeId: formData.get('college') as string,
      counselorId,
      assignedCounselorName: counselorName,
    });
    setShowRegForm(false);
  };

  const handleSendMsg = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addQuery({
      studentName: `Counselor: ${counselorName}`,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    });
    setShowMsgForm(false);
    alert('Message sent!');
  };

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'students', icon: Users, label: 'Students' },
    { id: 'earnings', icon: DollarSign, label: 'Earnings' },
    { id: 'profile', icon: UserCircle, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50" style={{ paddingBottom: '80px' }}>

      {/* Marquee */}
      {marqueeOffer && (
        <div className="bg-gradient-to-r from-teal-900 to-emerald-900 text-teal-50 overflow-hidden py-2">
          <div className="max-w-[100vw] overflow-hidden flex whitespace-nowrap">
            <div className="animate-marquee flex items-center shrink-0">
              {[0, 1, 2].map(i => (
                <span key={i} className="mx-8 font-bold text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  {marqueeOffer}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center cursor-pointer"
              onClick={() => setView('profile')}
            >
              {profileForm.avatar
                ? <img src={profileForm.avatar} alt="" className="w-full h-full object-cover" />
                : <span className="text-white font-bold text-sm">{counselorName.charAt(0).toUpperCase()}</span>
              }
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Welcome back 👋</p>
              <h1 className="text-sm font-extrabold text-slate-900 leading-none">{counselorName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badges.map(b => (
              <span key={b.id} title={b.badge_name} className="text-base">
                {b.icon_url === 'star' ? '⭐' : b.icon_url === 'crown' ? '👑' : '🏅'}
              </span>
            ))}
            <button
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-1.5 bg-teal-600 text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform"
            >
              <QrCode className="h-3.5 w-3.5" />
              QR
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 max-w-2xl mx-auto">

        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { icon: Users, label: 'Total', val: totalApps, color: 'from-cyan-500 to-blue-600' },
                { icon: Clock, label: 'Pending', val: pendingApps, color: 'from-amber-400 to-orange-500' },
                { icon: CheckCircle, label: 'Approved', val: approvedApps, color: 'from-emerald-500 to-teal-600' },
                { icon: TrendingUp, label: 'Counseling', val: counselingApps, color: 'from-violet-500 to-purple-600' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white shadow-sm`}
                >
                  <s.icon className="h-5 w-5 opacity-80 mb-2" />
                  <p className="text-2xl font-black">{s.val}</p>
                  <p className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setShowRegForm(true)}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm active:scale-95 transition-transform text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <UserPlus className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Register</p>
                  <p className="text-[10px] text-slate-400">Add student</p>
                </div>
              </button>
              <button
                onClick={() => setShowMsgForm(true)}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm active:scale-95 transition-transform text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Message</p>
                  <p className="text-[10px] text-slate-400">Contact admin</p>
                </div>
              </button>
              <button
                onClick={() => setShowDocsModal(true)}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm active:scale-95 transition-transform text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Documents</p>
                  <p className="text-[10px] text-slate-400">Review files</p>
                </div>
              </button>
              <button
                onClick={() => setView('earnings')}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm active:scale-95 transition-transform text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">₹{totalEarnings.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">My earnings</p>
                </div>
              </button>
            </div>

            {/* Tasks */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-600" /> Tasks & Follow-ups
              </h2>
              <div className="flex flex-col gap-2 mb-3 max-h-44 overflow-y-auto">
                {tasks.length === 0
                  ? <p className="text-xs text-slate-400 text-center py-4">No tasks. All caught up! 🎉</p>
                  : tasks.map(t => (
                    <div key={t.id} className="flex items-center gap-3 py-1.5 group">
                      <button
                        onClick={() => handleToggleTask(t.id, t.is_completed)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${t.is_completed ? 'bg-teal-500 border-teal-500' : 'border-slate-300'}`}
                      >
                        {t.is_completed && <CheckCircle className="h-3 w-3 text-white" />}
                      </button>
                      <span className={`text-xs flex-1 ${t.is_completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{t.task_text}</span>
                      <button onClick={() => handleDeleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-red-400 transition-opacity p-1">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                }
              </div>
              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  placeholder="Add a task..."
                  className="flex-1 text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  disabled={!newTaskText.trim()}
                  className="bg-teal-600 disabled:bg-slate-200 text-white rounded-xl px-3 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Leaderboard preview */}
            <div className="bg-gradient-to-br from-slate-900 to-teal-950 rounded-2xl p-4 mb-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold flex items-center gap-2"><Award className="h-4 w-4 text-amber-400" /> Top Counselors</h2>
                <span className="text-[10px] text-slate-400">This Month</span>
              </div>
              <div className="flex flex-col gap-2">
                {[...counselors]
                  .sort((a, b) => (b.totalAdmissions || 0) - (a.totalAdmissions || 0))
                  .slice(0, 3)
                  .map((c, idx) => (
                    <div key={c.id} className={`flex items-center justify-between py-2 px-3 rounded-xl ${c.id === counselorId ? 'bg-teal-700/60' : 'bg-white/5'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-sm">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                        <span className="text-xs font-semibold">{c.name} {c.id === counselorId && <span className="text-teal-300 text-[10px]">(you)</span>}</span>
                      </div>
                      <span className="text-xs font-black text-teal-300">{c.totalAdmissions || 0}</span>
                    </div>
                  ))}
                {counselors.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No data yet</p>}
              </div>
            </div>

          </motion.div>
        )}

        {/* STUDENTS VIEW */}
        {view === 'students' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-base font-bold text-slate-900 mb-4">Assigned Students ({apps.length})</h2>
            {apps.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No students assigned yet.</p>
                <button
                  onClick={() => setShowRegForm(true)}
                  className="mt-4 bg-teal-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
                >
                  Register First Student
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {apps.map((a) => (
                  <motion.div
                    key={a.id}
                    layout
                    onClick={() => setSel(sel === a.id ? null : a.id)}
                    className={`bg-white rounded-2xl border-2 shadow-sm cursor-pointer transition-all ${sel === a.id ? 'border-teal-500' : 'border-slate-100'}`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm truncate">{a.studentName}</h3>
                          <p className="text-xs text-slate-400 truncate">{a.collegeName} • {a.course}</p>
                        </div>
                        <Badge status={a.status} />
                      </div>

                      {/* Progress bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>{a.progress?.currentStage || 'Received'}</span>
                          <span>{a.progress?.step || 1}/{a.progress?.totalSteps || 5}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${((a.progress?.step || 1) / (a.progress?.totalSteps || 5)) * 100}%`,
                              background: ((a.progress?.step || 1) / (a.progress?.totalSteps || 5)) < 0.5
                                ? 'linear-gradient(to right, #f59e0b, #f97316)'
                                : 'linear-gradient(to right, #10b981, #0891b2)'
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>{a.studentPhone}</span>
                        {a.scholarshipAmount && (
                          <span className="text-emerald-600 font-semibold">🎓 ₹{a.scholarshipAmount}</span>
                        )}
                      </div>
                    </div>

                    {/* Expanded Actions */}
                    <AnimatePresence>
                      {sel === a.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-slate-100"
                        >
                          <div className="p-4">
                            {scholarshipForm ? (
                              <form
                                onClick={e => e.stopPropagation()}
                                onSubmit={e => {
                                  e.preventDefault();
                                  updateScholarship(a.id, parseInt(scholarshipForm.amount), scholarshipForm.details);
                                  setScholarshipForm(null);
                                }}
                                className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 mb-3"
                              >
                                <h4 className="text-xs font-bold text-emerald-800 mb-2">Add Scholarship</h4>
                                <input
                                  type="number" required placeholder="Amount (₹)"
                                  value={scholarshipForm.amount}
                                  onChange={e => setScholarshipForm({ ...scholarshipForm, amount: e.target.value })}
                                  className="w-full text-xs px-3 py-2.5 border border-emerald-200 bg-white rounded-xl mb-2 outline-none"
                                />
                                <input
                                  type="text" required placeholder="Reason (e.g. Merit >90%)"
                                  value={scholarshipForm.details}
                                  onChange={e => setScholarshipForm({ ...scholarshipForm, details: e.target.value })}
                                  className="w-full text-xs px-3 py-2.5 border border-emerald-200 bg-white rounded-xl mb-3 outline-none"
                                />
                                <div className="flex gap-2">
                                  <button type="submit" className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl active:scale-95">Save</button>
                                  <button type="button" onClick={() => setScholarshipForm(null)} className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-2.5 rounded-xl active:scale-95">Cancel</button>
                                </div>
                              </form>
                            ) : (
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <button
                                  onClick={e => { e.stopPropagation(); setScholarshipForm({ amount: '', details: '' }); }}
                                  className="flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 py-3 rounded-xl text-xs font-semibold active:scale-95 transition-transform"
                                >
                                  <Award className="h-3.5 w-3.5" /> Scholarship
                                </button>
                                <button
                                  onClick={e => { e.stopPropagation(); setChatAppId({ id: a.id, name: a.studentName }); }}
                                  className="flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 py-3 rounded-xl text-xs font-semibold active:scale-95 transition-transform"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" /> Notes
                                </button>
                              </div>
                            )}
                            <label className="flex items-center justify-center gap-2 bg-slate-50 text-slate-600 border border-slate-200 py-3 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-transform w-full">
                              <Upload className="h-3.5 w-3.5" /> Upload Document
                              <input
                                type="file" className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const docs = await uploadDocumentToDB(file, a.id, a.documents || []);
                                  if (docs) alert('Document uploaded!');
                                  else alert('Upload failed.');
                                }}
                              />
                            </label>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* EARNINGS VIEW */}
        {view === 'earnings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-base font-bold text-slate-900 mb-4">My Earnings</h2>

            <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl p-6 text-white shadow-lg mb-4">
              <p className="text-teal-100 text-sm font-semibold mb-1">Total Earnings</p>
              <p className="text-4xl font-black">₹{totalEarnings.toLocaleString()}</p>
              <div className="flex gap-4 mt-4">
                <div className="bg-white/10 rounded-xl p-3 flex-1 text-center">
                  <p className="text-2xl font-black">{applicationsWithIncentives.length}</p>
                  <p className="text-[10px] text-teal-100 font-semibold uppercase tracking-wider">Conversions</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 flex-1 text-center">
                  <p className="text-2xl font-black">{apps.filter(a => a.status !== 'approved' && a.status !== 'rejected').length}</p>
                  <p className="text-[10px] text-teal-100 font-semibold uppercase tracking-wider">In Progress</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Earning History</h3>
              </div>
              {applicationsWithIncentives.length === 0 ? (
                <div className="p-8 text-center">
                  <Sparkles className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No earnings yet. Keep going!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {applicationsWithIncentives.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-4">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{a.studentName}</h4>
                        <p className="text-xs text-slate-400 truncate">{a.collegeName}</p>
                      </div>
                      <span className="shrink-0 ml-3 bg-emerald-100 text-emerald-800 font-black text-sm px-3 py-1.5 rounded-xl">
                        +₹{a.incentiveAmount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PROFILE VIEW */}
        {view === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-base font-bold text-slate-900 mb-4">My Profile</h2>

            {/* Avatar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4 flex flex-col items-center">
              <div
                className="relative group cursor-pointer mb-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-cyan-500 border-4 border-white shadow-lg relative">
                  {profileForm.avatar
                    ? <img src={profileForm.avatar} alt="Profile" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white">
                        {counselorName.charAt(0).toUpperCase()}
                      </div>
                  }
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
              <p className="font-bold text-slate-900 text-lg">{counselorName}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>

            {/* Edit Form */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Edit Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-colors"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-colors"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    disabled
                    className="w-full text-sm px-4 py-3 bg-slate-100 border border-slate-100 rounded-xl text-slate-400 cursor-not-allowed"
                    value={user?.email || ''}
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={isUploading}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform"
              >
                <Save className="h-4 w-4" /> {isUploading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* QR Code */}
            <button
              onClick={() => setShowQRModal(true)}
              className="w-full flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-sm p-4 active:scale-95 transition-transform mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-teal-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">My QR Code</p>
                  <p className="text-xs text-slate-400">Share for student self-registration</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          </motion.div>
        )}

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex max-w-md mx-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${view === item.id ? 'text-teal-600' : 'text-slate-400'}`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-bold">{item.label}</span>
              {view === item.id && (
                <motion.div layoutId="nav-dot" className="w-1 h-1 rounded-full bg-teal-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showRegForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full sm:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl sm:max-w-lg"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Register Walk-in Student</h3>
                <button onClick={() => setShowRegForm(false)} className="p-2 text-slate-400 rounded-xl hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[80vh]">
                <form onSubmit={handleRegister} className="p-4 grid grid-cols-1 gap-3">
                  {[
                    { label: 'Student Name', name: 'name', type: 'text', required: true },
                    { label: 'Email', name: 'email', type: 'email', required: false },
                    { label: 'Phone Number', name: 'phone', type: 'tel', required: true },
                    { label: 'Date of Birth', name: 'dob', type: 'date', required: true },
                    { label: 'City', name: 'city', type: 'text', required: true },
                    { label: 'High School Marks (%)', name: 'marks', type: 'number', required: true },
                    { label: 'Course', name: 'course', type: 'text', required: true },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="block text-xs font-bold text-slate-600 mb-1">{f.label}</label>
                      <input
                        type={f.type}
                        name={f.name}
                        required={f.required}
                        className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Gender</label>
                    <select name="gender" required className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500">
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Target College</label>
                    <select name="college" required className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500">
                      <option value="">Select College</option>
                      {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3.5 rounded-xl text-sm font-bold active:scale-95 transition-transform"
                  >
                    Submit Registration
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {showMsgForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full sm:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl sm:max-w-md"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Message Administration</h3>
                <button onClick={() => setShowMsgForm(false)} className="p-2 text-slate-400 rounded-xl hover:bg-slate-100"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleSendMsg} className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Subject</label>
                  <input required name="subject" className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Message</label>
                  <textarea required name="message" rows={4} className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 resize-none" />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3.5 rounded-xl text-sm font-bold active:scale-95 transition-transform">
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showDocsModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full sm:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl sm:max-w-lg"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Review Documents</h3>
                <button onClick={() => setShowDocsModal(false)} className="p-2 text-slate-400 rounded-xl hover:bg-slate-100"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                {applications.filter((a: any) => a.documents && a.documents.length > 0).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">No documents to review.</div>
                ) : (
                  applications.filter((a: any) => a.documents && a.documents.length > 0).map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{a.studentName}</h4>
                        <p className="text-xs text-slate-400">{a.documents.length} files</p>
                      </div>
                      <div className="flex gap-2">
                        {a.documents.map((doc: any, i: number) => (
                          <button key={i} onClick={() => window.open(doc.url, '_blank')} className="text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded-lg">
                            View
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {showQRModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl sm:max-w-sm"
            >
              <div className="p-5 text-center border-b border-slate-100">
                <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 p-2 text-slate-400"><X className="h-5 w-5" /></button>
                <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <QrCode className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">Your Personal QR Code</h3>
                <p className="text-xs text-slate-400">Students scan this to self-register under you</p>
              </div>
              <div className="p-6 flex flex-col items-center bg-slate-50">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-5">
                  <img src={qrCodeUrl} alt="QR Code" className="w-52 h-52 object-contain" />
                </div>
                <div className="w-full">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">Or Share Link</p>
                  <div className="flex items-center gap-2">
                    <input readOnly value={registrationUrl} className="flex-1 text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 outline-none" />
                    <button
                      onClick={() => { navigator.clipboard.writeText(registrationUrl); alert('Copied!'); }}
                      className="bg-teal-600 text-white p-2.5 rounded-xl active:scale-95 transition-transform"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatAppId && (
          <ApplicationChat
            appId={chatAppId.id}
            studentName={chatAppId.name}
            currentUserId={user?.id || ''}
            currentUserRole="counselor"
            onClose={() => setChatAppId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
