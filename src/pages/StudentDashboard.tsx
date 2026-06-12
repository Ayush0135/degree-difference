import { motion } from 'framer-motion';
import { BookOpen, Heart, FileText, MessageSquare, TrendingUp, Clock, CheckCircle, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCollegeStore } from '../store/collegeStore';
import { useStudentStore } from '../store/studentStore';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';

const statCfg = [
  { icon: FileText, label: 'Applications', color: '#0891b2', bg: '#ecfeff' },
  { icon: Heart, label: 'Saved', color: '#e11d48', bg: '#fff1f2' },
  { icon: MessageSquare, label: 'Queries', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: CheckCircle, label: 'Approved', color: '#059669', bg: '#ecfdf5' },
];

function Badge({ status }: { status: string }) {
  const m: Record<string, string> = { approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700', under_review: 'bg-amber-100 text-amber-700', counseling: 'bg-cyan-100 text-cyan-700', resolved: 'bg-emerald-100 text-emerald-700', in_progress: 'bg-amber-100 text-amber-700', open: 'bg-slate-100 text-slate-600', pending: 'bg-slate-100 text-slate-600' };
  return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${m[status] || 'bg-slate-100 text-slate-600'}`}>{status.replace('_', ' ').toUpperCase()}</span>;
}

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { colleges, favorites } = useCollegeStore();
  const { applications, queries, initializeData, uploadDocument, isLoading } = useStudentStore();
  
  const [uploadingAppId, setUploadingAppId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) {
      initializeData(user.id);
    }
  }, [user?.id, initializeData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, appId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingAppId(appId);
    await uploadDocument(file, appId);
    setUploadingAppId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const favColleges = colleges.filter((c) => favorites.includes(c.id));
  const myApps = applications.filter(a => a.studentId === user?.id);
  const myQueries = queries.filter(q => q.studentId === user?.id);
  
  const vals = [myApps.length, favColleges.length, myQueries.length, myApps.filter((a) => a.status === 'approved').length];
  
  const hasActivity = myApps.length > 0 || myQueries.length > 0 || favColleges.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">Welcome back, {user?.name} 👋</h1>
          <p className="text-slate-500 text-sm">Track your applications and explore new colleges</p>
        </motion.div>

        {!hasActivity ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center max-w-3xl mx-auto mt-12"
          >
            <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-12 w-12 text-teal-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Your journey starts here</h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto leading-relaxed">
              You haven't saved any colleges or started any applications yet. Explore our curated list of top colleges and take the first step towards your dream career!
            </p>
            <Link 
              to="/colleges" 
              className="inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}
            >
              Explore Colleges <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Stats */}
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
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Applications */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold text-slate-900">My Applications</h2><Link to="/colleges" className="text-teal-600 text-sm font-semibold">Apply More →</Link></div>
                  <div className="flex flex-col gap-4">
                    {myApps.length === 0 ? (
                       <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                         <p className="text-slate-500 text-sm">No applications yet.</p>
                       </div>
                    ) : myApps.map((a) => (
                      <motion.div key={a.id} whileHover={{ x: 3 }} className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="min-w-0"><h3 className="font-semibold text-slate-900 text-sm truncate">{a.collegeName}</h3><p className="text-xs text-slate-500">{a.course}</p></div>
                          <Badge status={a.status} />
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-[11px] text-slate-500 mb-1"><span>{a.progress?.currentStage || 'Application Received'}</span><span>{a.progress?.step || 1}/{a.progress?.totalSteps || 5}</span></div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${((a.progress?.step || 1) / (a.progress?.totalSteps || 5)) * 100}%`, background: 'linear-gradient(to right, #0d9488, #0891b2)' }} /></div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Applied {new Date(a.appliedDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{a.documents?.length || 0} docs</span>
                        </div>
                        
                        {a.counselorNotes && <div className="mt-2 bg-teal-50 rounded-lg p-2.5"><p className="text-[11px] text-teal-800"><strong>Counselor:</strong> {a.counselorNotes}</p></div>}
                        
                        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                          <p className="text-[10px] text-slate-400">Note: Uploaded documents are automatically deleted after 24 hours to protect your privacy and save space.</p>
                          <label className={`cursor-pointer flex items-center justify-center gap-1 text-xs font-bold py-1.5 rounded-lg border border-dashed border-teal-300 text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors ${uploadingAppId === a.id ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Upload className="h-3.5 w-3.5" />
                            {uploadingAppId === a.id ? 'Uploading...' : 'Upload Document'}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept=".pdf,.png,.jpg,.jpeg" 
                              onChange={(e) => handleFileUpload(e, a.id)}
                            />
                          </label>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Queries */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold text-slate-900">My Queries</h2></div>
                  <div className="flex flex-col gap-4">
                    {myQueries.length === 0 ? (
                       <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                         <p className="text-slate-500 text-sm">No active queries.</p>
                       </div>
                    ) : myQueries.map((q) => (
                      <div key={q.id} className="border border-slate-100 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2 gap-2"><h3 className="font-semibold text-slate-900 text-sm">{q.subject}</h3><Badge status={q.status} /></div>
                        <p className="text-xs text-slate-500 mb-2">{q.message}</p>
                        {q.response && <div className="bg-emerald-50 rounded-lg p-2.5"><p className="text-[11px] text-emerald-800"><strong>Response:</strong> {q.response}</p></div>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="flex flex-col gap-6">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h2 className="text-base font-bold text-slate-900 mb-4">Saved Colleges</h2>
                  {favColleges.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {favColleges.slice(0, 3).map((c) => (
                        <Link key={c.id} to={`/college/${c.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50">
                          <img src={c.image} alt={c.name} className="w-11 h-11 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0"><p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p><p className="text-[11px] text-slate-500">{c.city}</p></div>
                        </Link>
                      ))}
                    </div>
                  ) : <div className="text-center py-6"><Heart className="h-8 w-8 text-slate-300 mx-auto mb-2" /><p className="text-sm text-slate-400">No saved colleges yet</p></div>}
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="rounded-2xl shadow-md p-6 text-white" style={{ background: 'linear-gradient(135deg, #0f172a, #134e4a)' }}>
                  <h2 className="text-base font-bold mb-4">Quick Actions</h2>
                  <div className="flex flex-col gap-2.5">
                    {[{ icon: BookOpen, label: 'Browse Colleges', to: '/colleges' }, { icon: MessageSquare, label: 'Ask a Question' }, { icon: TrendingUp, label: 'View Progress' }].map((item) =>
                      item.to ? (
                        <Link key={item.label} to={item.to} className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.1)' }}><item.icon className="h-4 w-4" />{item.label}</Link>
                      ) : (
                        <button key={item.label} className="flex items-center gap-2 rounded-xl p-3 text-sm font-semibold text-left w-full" style={{ background: 'rgba(255,255,255,0.1)' }}><item.icon className="h-4 w-4" />{item.label}</button>
                      )
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
