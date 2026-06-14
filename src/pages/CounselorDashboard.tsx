import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, CheckCircle, AlertCircle, Calendar, GraduationCap, Building2, TrendingUp, DollarSign, LogOut, Search, UserCircle, BookOpen, Award, Filter, MapPin, X, Check, Eye, UserPlus, FileUp, MessageSquare, Briefcase, RefreshCw, Upload, Phone, Mail, FileBadge, CheckSquare, ListTodo, MoreVertical, Send, Loader2, Plus, Clock, Camera, Save, ArrowRight } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { useCollegeStore } from '../store/collegeStore';
import { useAuthStore } from '../store/authStore';
import { uploadAvatar, updateUserProfile, fetchPlatformSettings, fetchCounselorTasks, addCounselorTask, updateCounselorTask, deleteCounselorTask, uploadDocumentToDB } from '../lib/supabase';
import ApplicationChat from '../components/ApplicationChat';

const statCfg = [
  { icon: Users, label: 'Assigned', color: '#0891b2', bg: '#ecfeff' },
  { icon: Clock, label: 'Pending', color: '#d97706', bg: '#fffbeb' },
  { icon: CheckCircle, label: 'Approved', color: '#059669', bg: '#ecfdf5' },
  { icon: TrendingUp, label: 'Counseling', color: '#7c3aed', bg: '#f5f3ff' },
];

function Badge({ status }: { status: string }) {
  const m: Record<string, string> = { approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700', under_review: 'bg-amber-100 text-amber-700', counseling: 'bg-cyan-100 text-cyan-700', pending: 'bg-slate-100 text-slate-600' };
  return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${m[status] || 'bg-slate-100 text-slate-600'}`}>{status.replace('_', ' ').toUpperCase()}</span>;
}

export default function CounselorDashboard() {
  const [sel, setSel] = useState<string | null>(null);
  const [scholarshipForm, setScholarshipForm] = useState<{amount: string, details: string} | null>(null);
  const [showRegForm, setShowRegForm] = useState(false);
  const [showMsgForm, setShowMsgForm] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [view, setView] = useState<'dashboard' | 'earnings' | 'leaderboard' | 'profile'>('dashboard');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user, updateUser } = useAuthStore();
  const counselorName = user?.name || 'Dr. Anita Desai';

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

  // Generate the registration URL for this counselor
  const registrationUrl = `${window.location.origin}/#/register/${user?.id || 'demo'}?cName=${encodeURIComponent(counselorName)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(registrationUrl)}`;

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
    
    // Optimistic UI using FileReader to prevent Safari WebKitBlobResource error 4
    // Safari locks the File object if URL.createObjectURL is used on it, causing fetch() to fail.
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
          // Revert on failure
          setProfileForm(prev => ({ ...prev, avatar: user.avatar || '' }));
          alert('Failed to upload avatar. Please try again.');
        }
      } catch (err) {
        console.error(err);
        setProfileForm(prev => ({ ...prev, avatar: user.avatar || '' }));
        alert('Failed to upload avatar.');
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      setIsUploading(false);
      alert('Failed to read file for preview.');
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
      alert('Profile updated successfully!');
    } else {
      alert('Failed to update profile.');
    }
  };

  const counselorId = user?.id || 'counselor1';
  
  const { applications, updateScholarship, advanceApplicationStep, initializeData, manuallyRegisterStudent, addQuery, isInitialized, counselors, marqueeOffer } = useAdminStore();
  const { colleges } = useCollegeStore();
  
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Filter only apps assigned to this counselor
  const apps = applications.filter(a => a.counselorId === counselorId);
  const vals = [apps.length, apps.filter((a) => a.status === 'under_review').length, apps.filter((a) => a.status === 'approved').length, apps.filter((a) => a.status === 'counseling').length];

  const getStageCount = (stageName: string) => apps.filter(a => a.progress?.currentStage === stageName).length;

  const applicationsWithIncentives = apps.filter(a => a.incentiveAmount && a.incentiveAmount > 0);
  const totalEarnings = applicationsWithIncentives.reduce((sum, a) => sum + (a.incentiveAmount || 0), 0);
  const pendingAdmissionsCount = apps.filter(a => a.status !== 'approved' && a.status !== 'rejected').length;

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
      counselorId: counselorId,
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
    alert('Message sent to Administration successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AnimatePresence>
        {marqueeOffer && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-teal-50 overflow-hidden relative border-b border-teal-950/50 shadow-inner"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            <div className="max-w-[100vw] overflow-hidden flex whitespace-nowrap py-2.5 items-center relative z-10">
              <div className="animate-marquee flex items-center shrink-0">
                <span className="mx-8 font-bold tracking-wide flex items-center gap-3 text-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {marqueeOffer}
                </span>
                <span className="mx-8 font-bold tracking-wide flex items-center gap-3 text-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {marqueeOffer}
                </span>
                <span className="mx-8 font-bold tracking-wide flex items-center gap-3 text-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {marqueeOffer}
                </span>
              </div>
              <div className="animate-marquee flex items-center shrink-0" aria-hidden="true">
                <span className="mx-8 font-bold tracking-wide flex items-center gap-3 text-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {marqueeOffer}
                </span>
                <span className="mx-8 font-bold tracking-wide flex items-center gap-3 text-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {marqueeOffer}
                </span>
                <span className="mx-8 font-bold tracking-wide flex items-center gap-3 text-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {marqueeOffer}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">Counselor Portal</h1>
            <div className="flex items-center gap-3">
              <p className="text-slate-500 text-sm">Welcome back, {counselorName}</p>
              {badges.length > 0 && (
                <div className="flex items-center gap-1">
                  {badges.map(b => (
                    <div key={b.id} title={b.badge_name} className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600 shadow-sm border border-amber-200 text-xs">
                      {b.icon_url === 'star' ? '⭐' : b.icon_url === 'crown' ? '👑' : '🏅'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex bg-slate-200 p-1 rounded-xl shrink-0">
            <button onClick={() => setView('dashboard')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${view === 'dashboard' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Dashboard</button>
            <button onClick={() => setView('earnings')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${view === 'earnings' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>My Earnings</button>
            <button onClick={() => setView('leaderboard')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${view === 'leaderboard' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Award className="h-4 w-4" /> Leaderboard
            </button>
            <button onClick={() => setView('profile')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${view === 'profile' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>My Profile</button>
          </div>
        </motion.div>

        {view === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCfg.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-slate-500 text-xs mb-1">{s.label}</p><p className="text-2xl font-extrabold text-slate-900">{vals[i]}</p></div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: s.bg }}><s.icon className="h-5 w-5" style={{ color: s.color }} /></div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            
            {/* Conversion Funnel */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-teal-600" /> Your Conversion Funnel</h2>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Total Walk-ins</p>
                  <p className="text-3xl font-extrabold text-slate-900">{apps.length}</p>
                </div>
                <div className="text-slate-300 hidden md:block"><ArrowRight className="h-6 w-6" /></div>
                <div className="flex-1 w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-emerald-600 font-bold mb-1 uppercase tracking-wider">Scholarships Offered</p>
                  <p className="text-3xl font-extrabold text-emerald-900">{apps.filter(a => a.scholarshipAmount).length}</p>
                </div>
                <div className="text-slate-300 hidden md:block"><ArrowRight className="h-6 w-6" /></div>
                <div className="flex-1 w-full bg-teal-50 border border-teal-200 rounded-xl p-4 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 bg-teal-500 text-white text-[9px] font-bold rounded-bl-lg">GOAL</div>
                  <p className="text-xs text-teal-600 font-bold mb-1 uppercase tracking-wider">Approved Admissions</p>
                  <p className="text-3xl font-extrabold text-teal-900">{vals[2]}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Assigned Applications</h2>
              <div className="flex flex-col gap-4">
                {apps.map((a) => (
                  <motion.div key={a.id} whileHover={{ scale: 1.005 }} onClick={() => setSel(sel === a.id ? null : a.id)} className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${sel === a.id ? 'border-teal-500 bg-teal-50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="min-w-0"><h3 className="font-semibold text-slate-900 text-sm">{a.studentName}</h3><p className="text-xs text-slate-500">{a.collegeName}</p><p className="text-xs text-slate-500">{a.course}</p></div>
                      <Badge status={a.status} />
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 mb-2"><span>{a.studentEmail}</span><span>•</span><span>{a.studentPhone}</span></div>
                    <div className="mb-2">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1"><span>{a.progress?.currentStage || 'Application Received'}</span><span>Step {a.progress?.step || 1}/{a.progress?.totalSteps || 5}</span></div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${((a.progress?.step || 1) / (a.progress?.totalSteps || 5)) * 100}%`, background: ((a.progress?.step || 1) / (a.progress?.totalSteps || 5)) < 0.5 ? 'linear-gradient(to right, #d97706, #f59e0b)' : 'linear-gradient(to right, #059669, #0d9488)' }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2"><FileText className="h-3 w-3" />{a.documents?.length || 0} docs</div>
                    
                    {a.scholarshipAmount && (
                      <div className="bg-emerald-50 rounded-lg p-2.5 mb-2 border border-emerald-100">
                        <p className="text-xs text-emerald-800 flex items-center gap-1 font-semibold mb-1"><Award className="h-3 w-3"/> Scholarship Added</p>
                        <p className="text-[11px] text-emerald-700">₹{a.scholarshipAmount} - {a.scholarshipDetails}</p>
                      </div>
                    )}

                    {a.counselorNotes && <div className="bg-indigo-50 rounded-lg p-2.5"><p className="text-[11px] text-indigo-800"><strong>Notes:</strong> {a.counselorNotes}</p></div>}
                    
                    {sel === a.id && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 pt-4 border-t border-slate-100">
                        
                        {scholarshipForm ? (
                          <form 
                            onClick={(e) => e.stopPropagation()}
                            onSubmit={(e) => {
                              e.preventDefault();
                              updateScholarship(a.id, parseInt(scholarshipForm.amount), scholarshipForm.details);
                              setScholarshipForm(null);
                            }}
                            className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3"
                          >
                            <h4 className="text-xs font-bold text-slate-700 mb-2">Add Scholarship Details</h4>
                            <input 
                              type="number" required placeholder="Amount (e.g. 50000)" 
                              value={scholarshipForm.amount} onChange={e => setScholarshipForm({...scholarshipForm, amount: e.target.value})}
                              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg mb-2"
                            />
                            <input 
                              type="text" required placeholder="Reason (e.g. Merit-based >90%)" 
                              value={scholarshipForm.details} onChange={e => setScholarshipForm({...scholarshipForm, details: e.target.value})}
                              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg mb-2"
                            />
                            <div className="flex gap-2">
                              <button type="submit" className="bg-emerald-600 text-white text-[11px] px-3 py-1.5 rounded-lg font-bold">Save</button>
                              <button type="button" onClick={() => setScholarshipForm(null)} className="text-slate-500 text-[11px] px-3 py-1.5 hover:bg-slate-200 rounded-lg">Cancel</button>
                            </div>
                          </form>
                        ) : null}

                        <div className="flex gap-2">
                          {!scholarshipForm && (
                            <button onClick={(e) => { e.stopPropagation(); setScholarshipForm({amount: '', details: ''}); }} className="w-full flex items-center justify-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-100"><Award className="h-3.5 w-3.5" /> Scholarship</button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); setChatAppId({id: a.id, name: a.studentName}); }} className="w-full flex items-center justify-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-100"><MessageSquare className="h-3.5 w-3.5" /> Discuss</button>
                        </div>
                        <div className="mt-2">
                          <label className="w-full flex items-center justify-center gap-1 bg-slate-50 text-slate-700 border border-slate-200 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 cursor-pointer">
                            <Upload className="h-3.5 w-3.5" /> Upload Document
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const docs = await uploadDocumentToDB(file, a.id, a.documents || []);
                                if (docs) {
                                  alert('Document uploaded successfully!');
                                  // Update state locally (the store won't refresh automatically without re-fetching, but we can do a hacky refresh or just let them reload)
                                  a.documents = docs;
                                } else {
                                  alert('Failed to upload document');
                                }
                              }}
                            />
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Today's Overview</h3>
              <div className="flex flex-col gap-3">
                {[
                  { icon: AlertCircle, label: 'Pending Reviews', val: vals[1], color: '#d97706' }, 
                  { icon: CheckCircle, label: 'Approved Students', val: vals[2], color: '#059669' }, 
                  { icon: TrendingUp, label: 'In Counseling', val: vals[3], color: '#7c3aed' }
                ].map((it) => (
                  <div key={it.label} className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-slate-600"><it.icon className="h-4 w-4" style={{ color: it.color }} />{it.label}</span><span className="font-bold text-slate-900 text-sm">{it.val}</span></div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Application Stages</h3>
              <div className="flex flex-col gap-3">
                {[
                  { s: 'Application Received', c: getStageCount('Application Received') }, 
                  { s: 'Document Verification', c: getStageCount('Document Verification') }, 
                  { s: 'Eligibility Check', c: getStageCount('Eligibility Check') }, 
                  { s: 'Counseling Round', c: getStageCount('Counseling Round') }, 
                  { s: 'Final Approval', c: getStageCount('Final Approval') }
                ].map((it, i) => (
                  <div key={it.s} className="flex items-center justify-between">
                    <span className="flex items-center gap-3"><div className="w-7 h-7 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</div><span className="text-sm text-slate-600">{it.s}</span></span>
                    <span className="text-sm font-bold text-slate-900">{it.c}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><CheckCircle className="h-5 w-5 text-teal-600"/> Tasks & Follow-ups</h3>
              
              <div className="flex flex-col gap-3 mb-4 max-h-48 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No pending tasks. You're all caught up!</p>
                ) : (
                  tasks.map(t => (
                    <div key={t.id} className="flex items-start gap-3 group">
                      <input 
                        type="checkbox" 
                        checked={t.is_completed} 
                        onChange={() => handleToggleTask(t.id, t.is_completed)}
                        className="mt-1 w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                      />
                      <span className={`text-sm flex-1 ${t.is_completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{t.task_text}</span>
                      <button onClick={() => handleDeleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"><X className="h-4 w-4"/></button>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddTask} className="flex gap-2 relative">
                <input 
                  type="text" 
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="E.g. Call Rahul on Friday" 
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-500"
                />
                <button type="submit" disabled={!newTaskText.trim()} className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-lg px-3 flex items-center justify-center transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="rounded-2xl shadow-md p-6 text-white" style={{ background: 'linear-gradient(135deg, #0f172a, #134e4a)' }}>
              <h3 className="text-base font-bold mb-4">Quick Actions</h3>
              <div className="flex flex-col gap-2.5">
                <button onClick={() => setShowRegForm(true)} className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold text-left w-full" style={{ background: 'rgba(255,255,255,0.2)' }}><UserPlus className="h-4 w-4" />Register Student</button>
                <button onClick={() => setShowQRModal(true)} className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold text-left w-full" style={{ background: 'rgba(255,255,255,0.2)' }}><Camera className="h-4 w-4" />My QR Code</button>
                <button onClick={() => setShowDocsModal(true)} className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold text-left w-full" style={{ background: 'rgba(255,255,255,0.1)' }}><FileText className="h-4 w-4" />Review Documents</button>
                <button onClick={() => setShowMsgForm(true)} className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold text-left w-full" style={{ background: 'rgba(255,255,255,0.1)' }}><MessageSquare className="h-4 w-4" />Send Message</button>
                <button onClick={() => setView('earnings')} className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold text-left w-full" style={{ background: 'rgba(255,255,255,0.1)' }}><TrendingUp className="h-4 w-4" />View Analytics</button>
              </div>
            </motion.div>
          </div>
        </div>
      </>
        )}
        
        {view === 'earnings' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl p-6 text-white shadow-md">
                <h3 className="text-teal-100 font-semibold mb-2">Total Earnings</h3>
                <p className="text-4xl font-extrabold">₹{totalEarnings.toLocaleString()}</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-slate-500 font-semibold mb-2">Successful Admissions</h3>
                <p className="text-3xl font-extrabold text-slate-900">{applicationsWithIncentives.length}</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-slate-500 font-semibold mb-2">Pending Admissions</h3>
                <p className="text-3xl font-extrabold text-slate-900">{pendingAdmissionsCount}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Earning History</h2>
              </div>
              {applicationsWithIncentives.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No earnings recorded yet. Focus on getting your assigned students approved!</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {applicationsWithIncentives.map(a => (
                    <div key={a.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-900">{a.studentName}</h4>
                        <p className="text-sm text-slate-500">{a.collegeName} • {a.course}</p>
                        <p className="text-xs text-slate-400 mt-1">Processed on: {new Date(a.appliedDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-emerald-100 text-emerald-800 font-bold px-4 py-2 rounded-xl">
                          + ₹{a.incentiveAmount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === 'leaderboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-cyan-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Award className="text-teal-600"/> Top Counselors</h2>
                  <p className="text-sm text-slate-600 mt-1">Ranked by total successful admissions.</p>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[...counselors]
                    .sort((a, b) => (b.totalAdmissions || 0) - (a.totalAdmissions || 0))
                    .map((c, idx) => (
                      <div key={c.id} className={`flex items-center justify-between p-4 rounded-xl border ${c.id === counselorId ? 'border-teal-500 bg-teal-50' : 'border-slate-100 bg-white shadow-sm'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'}`}>
                            #{idx + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{c.name} {c.id === counselorId && <span className="ml-2 text-xs font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">YOU</span>}</h4>
                            <p className="text-xs text-slate-500">Expert Counselor</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-teal-600">{c.totalAdmissions || 0}</p>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Admissions</p>
                        </div>
                      </div>
                  ))}
                  {counselors.length === 0 && (
                     <div className="text-center text-slate-500 p-8">No counselors found.</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Settings</h2>
              
              <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100 relative">
                      {profileForm.avatar ? (
                        <img src={profileForm.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Users className="w-12 h-12" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white mb-1" />
                        <span className="text-white text-xs font-bold">Change</span>
                      </div>
                      
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarChange} />
                  <p className="text-xs text-slate-500 text-center">Allowed: JPG, PNG.<br/>Max size: 5MB</p>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none transition-colors"
                      value={profileForm.name}
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none transition-colors"
                      value={profileForm.phone}
                      onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      disabled
                      className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                      value={user?.email || ''}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Contact administrator to change email.</p>
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isUploading}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {isUploading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
        {showRegForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Register New Walk-in Student</h3>
                <button onClick={() => setShowRegForm(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleRegister} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student Name</label>
                    <input required name="name" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input type="email" name="email" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input required type="tel" name="phone" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input required type="date" name="dob" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select required name="gender" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500 bg-white">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City / Address</label>
                    <input required name="city" placeholder="e.g. New Delhi" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">High School Marks (%)</label>
                    <input required type="number" step="0.1" min="0" max="100" name="marks" placeholder="e.g. 85.5" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target College</label>
                    <select required name="college" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500 bg-white">
                      <option value="">Select College</option>
                      {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Interested Course</label>
                    <input required name="course" placeholder="e.g. B.Tech Computer Science" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500" />
                  </div>
                </div>
                <button type="submit" className="w-full text-white py-2.5 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                  Submit Registration
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showMsgForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-teal-600"/> Message Administration</h3>
                <button onClick={() => setShowMsgForm(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleSendMsg} className="p-6">
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                    <input required name="subject" placeholder="e.g. Missing Document for Ayush" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                    <textarea required name="message" rows={4} placeholder="Type your message to the administration..." className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500 resize-none"></textarea>
                  </div>
                </div>
                <button type="submit" className="w-full text-white py-2.5 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showDocsModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><FileText className="h-4 w-4 text-teal-600"/> Review Documents</h3>
                <button onClick={() => setShowDocsModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <p className="text-sm text-slate-500 mb-4">The following students have uploaded documents for review.</p>
                <div className="space-y-3">
                  {applications.filter((a: any) => a.documents && a.documents.length > 0).length === 0 ? (
                    <div className="text-center text-sm text-slate-400 py-6 border border-dashed border-slate-200 rounded-xl">No pending documents to review right now.</div>
                  ) : (
                    applications.filter((a: any) => a.documents && a.documents.length > 0).map((a: any) => (
                      <div key={a.id} className="border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{a.studentName}</h4>
                          <p className="text-xs text-slate-500">{a.collegeName}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">{a.documents.length} files</span>
                          <div className="flex gap-2">
                            {a.documents.map((doc: any, i: number) => (
                              <button key={doc.id || i} onClick={() => window.open(doc.url, '_blank')} className="text-[11px] font-bold text-white bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
                                View {doc.type === 'pdf' ? 'PDF' : 'Image'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>
        <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
              <div className="p-6 text-center border-b border-slate-100 relative">
                <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X className="h-5 w-5" /></button>
                <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-1">Your Personal QR Code</h3>
                <p className="text-sm text-slate-500">Students can scan this to self-register. You will automatically get credit!</p>
              </div>
              <div className="p-8 flex flex-col items-center bg-slate-50">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6">
                  <img src={qrCodeUrl} alt="Counselor QR Code" className="w-48 h-48 object-contain" />
                </div>
                <div className="w-full">
                  <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider text-center">Or Share Link</p>
                  <div className="flex items-center gap-2">
                    <input readOnly value={registrationUrl} className="flex-1 text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-slate-500" />
                    <button onClick={() => { navigator.clipboard.writeText(registrationUrl); alert('Copied!'); }} className="bg-teal-600 hover:bg-teal-700 text-white p-2.5 rounded-xl transition-colors"><Save className="h-4 w-4" /></button>
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
      </div>
    </div>
  );
}
