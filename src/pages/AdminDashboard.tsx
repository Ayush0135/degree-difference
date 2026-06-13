import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, School, Users, FileText, MessageSquare, Edit, Trash2, X, Check, Database, UserPlus, BookOpen, Book, ArrowRight, Lock, RefreshCw, Megaphone, Save } from 'lucide-react';
import { useCollegeStore } from '../store/collegeStore';
import { useAdminStore } from '../store/adminStore';
import { supabase, isSupabaseConfigured, fetchPlatformSettings, updatePlatformSettings } from '../lib/supabase';
import ApplicationChat from '../components/ApplicationChat';

const statCfg = [
  { icon: School, label: 'Colleges', color: '#0891b2', bg: '#ecfeff' },
  { icon: FileText, label: 'Applications', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: MessageSquare, label: 'Queries', color: '#d97706', bg: '#fffbeb' },
  { icon: Users, label: 'Students', color: '#059669', bg: '#ecfdf5' },
];

function Badge({ status }: { status: string }) {
  const m: Record<string, string> = { approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700', under_review: 'bg-amber-100 text-amber-700', counseling: 'bg-cyan-100 text-cyan-700', resolved: 'bg-emerald-100 text-emerald-700', in_progress: 'bg-amber-100 text-amber-700', open: 'bg-slate-100 text-slate-600', pending: 'bg-slate-100 text-slate-600' };
  return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${m[status] || 'bg-slate-100 text-slate-600'}`}>{status.replace('_', ' ').toUpperCase()}</span>;
}

export default function AdminDashboard() {
  const { colleges, addCollege, deleteCollege } = useCollegeStore();
  const { applications, queries, initializeData, updateApplicationStatus, assignCounselor, manuallyRegisterStudent, addCounselor, assignIncentive, counselors, counselorApplications, approveCounselorApp, updateCounselorFakeAdmissions, isInitialized } = useAdminStore();
  const dbConnected = isSupabaseConfigured();
  const [incentiveForm, setIncentiveForm] = useState<string>('');
  
  useEffect(() => {
    if (!isInitialized) {
      initializeData();
    }
  }, [isInitialized, initializeData]);

  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState<'colleges' | 'applications' | 'queries' | 'manual_reg' | 'rule_book' | 'manage_counselors' | 'counselor_applications' | 'leaderboard'>('colleges');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCounselorModal, setShowCounselorModal] = useState(false);
  const [chatAppId, setChatAppId] = useState<{id: string, name: string} | null>(null);

  const [marqueeOffer, setMarqueeOffer] = useState('🎉 Special Bonus: Complete 5 admissions this month and get a ₹10,000 bonus!');
  const [isSavingMarquee, setIsSavingMarquee] = useState(false);

  useEffect(() => {
    fetchPlatformSettings('counselor_marquee_offer').then(val => {
      if (val) setMarqueeOffer(val);
    });
  }, []);

  const handleSaveMarquee = async () => {
    setIsSavingMarquee(true);
    await updatePlatformSettings('counselor_marquee_offer', marqueeOffer);
    setIsSavingMarquee(false);
    alert('Marquee offer updated successfully!');
  };

  const vals = [colleges.length, applications.length, queries.length, '500+'];

  const handleManualReg = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    manuallyRegisterStudent({
      studentName: formData.get('name') as string,
      studentEmail: formData.get('email') as string,
      studentPhone: formData.get('phone') as string,
      course: formData.get('course') as string,
    });
    setTab('applications');
    e.currentTarget.reset();
  };

  const handleAddCounselor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addCounselor({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
    e.currentTarget.reset();
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    // Legacy modal logic removed.
  };

  const handleApproveCounselor = async (app: any) => {
    const success = await approveCounselorApp(app.id);
    if (!success) return alert('Failed to approve application.');
    
    // Generate credentials
    const password = Math.random().toString(36).slice(-8);
    
    // Create counselor in DB
    addCounselor({
      name: app.fullName,
      email: app.email,
      password: password,
      specialization: [app.specialization],
    });

    // Generate PDF
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(13, 148, 136); // Teal
    doc.text('Degree Difference', 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Authorized Counselor Credential & Rulebook', 20, 35);
    
    doc.setFontSize(12);
    doc.text(`Welcome, ${app.fullName}!`, 20, 50);
    doc.text('Your counselor account has been approved. Please use the', 20, 60);
    doc.text('credentials below to log in to your dashboard.', 20, 65);
    
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38); // Red
    doc.text('Login Credentials (CONFIDENTIAL)', 20, 80);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Email/UserID: ${app.email}`, 20, 90);
    doc.text(`Password: ${password}`, 20, 98);
    
    doc.setFontSize(14);
    doc.setTextColor(13, 148, 136);
    doc.text('Rules & Regulations', 20, 120);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const rules = [
      '1. Maintain the highest ethical standards during student counseling.',
      '2. Do not guarantee admissions or scholarships unethically.',
      '3. Payouts are processed on the 5th of every month.',
      '4. Unauthorized sharing of student data is strictly prohibited.',
      '5. You must process at least 1 application every 90 days to stay active.'
    ];
    let y = 130;
    rules.forEach(r => {
      doc.text(r, 20, y);
      y += 8;
    });

    // Convert PDF to base64
    const pdfBase64 = btoa(doc.output());

    // Send email via Supabase Edge Function
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('send-counselor-email', {
          body: {
            email: app.email,
            name: app.fullName,
            pdfBase64: pdfBase64
          }
        });

        if (error) throw error;
        alert(`Email successfully sent to ${app.email} via Resend!`);
      } catch (err: any) {
        console.error("Error sending email:", err);
        alert("Failed to send email via Resend. The PDF will be downloaded locally instead.");
        doc.save(`Counselor_Credentials_${app.fullName.replace(/\s+/g, '_')}.pdf`);
      }
    } else {
      // Fallback for local testing without Supabase
      doc.save(`Counselor_Credentials_${app.fullName.replace(/\s+/g, '_')}.pdf`);
      alert(`Simulated: Email successfully sent to ${app.email} with PDF attached!`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm">Manage colleges, applications, and queries</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => initializeData()} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${dbConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                <Database className="h-3.5 w-3.5" />
                {dbConnected ? 'Supabase Connected' : 'Using Local Data'}
              </div>
            </div>
          </div>
        </motion.div>

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

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-100 overflow-x-auto">
            <div className="flex px-4 sm:px-6 min-w-max">
              {(['colleges', 'applications', 'queries', 'manual_reg', 'rule_book', 'manage_counselors', 'counselor_applications'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`relative py-3.5 px-5 text-sm font-semibold capitalize whitespace-nowrap ${tab === t ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'}`}>
                  {t.replace('_', ' ')}
                  {tab === t && <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {tab === 'colleges' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Manage Colleges</h2>
                  <Link to="/admin/add-college">
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="flex items-center justify-center gap-2 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shrink-0" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                      <Plus className="h-4 w-4" /> Add College
                    </motion.button>
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  {colleges.map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow flex items-start justify-between gap-4">
                      <div className="flex gap-3 min-w-0">
                        <img src={c.image} alt={c.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0" />
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 text-sm truncate">{c.name}</h3>
                          <p className="text-xs text-slate-500 truncate mb-1">{c.location}</p>
                          <div className="flex flex-wrap gap-2 text-[11px] text-slate-400"><span>{c.type}</span><span>•</span><span>⭐ {c.rating}</span><span>•</span><span>{c.totalSeats} seats</span></div>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Link to={`/admin/edit-college/${c.id}`} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"><Edit className="h-4 w-4" /></Link>
                        <button onClick={async () => { if (confirm('Delete this college?')) await deleteCollege(c.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'applications' && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-6">Student Applications</h2>
                <div className="flex flex-col gap-4">{applications.map((a) => (
                  <div key={a.id} className="border border-slate-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2 gap-2"><div className="min-w-0"><h3 className="font-semibold text-slate-900 text-sm">{a.studentName}</h3><p className="text-xs text-slate-500">{a.collegeName} — {a.course}</p></div><Badge status={a.status} /></div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-3"><span>{a.studentEmail}</span><span>•</span><span>{a.studentPhone}</span></div>
                    
                    {/* Scholarship / Counselor assignment info */}
                    {a.scholarshipAmount ? (
                      <div className="mb-3 bg-emerald-50 text-emerald-800 text-xs px-3 py-2 rounded-lg">
                        <strong>Scholarship:</strong> ₹{a.scholarshipAmount} - {a.scholarshipDetails}
                      </div>
                    ) : null}

                    {a.counselorId ? (
                      <div className="flex flex-col gap-2 mb-3">
                        <div className="text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md inline-block self-start">
                          Counselor: <strong>{a.assignedCounselorName}</strong>
                        </div>
                        <div className="text-[11px] text-slate-500 flex justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                          <span><strong>Stage:</strong> {a.progress.currentStage}</span>
                          <span>Step {a.progress.step}/{a.progress.totalSteps}</span>
                        </div>
                        
                        {a.status === 'approved' && (
                          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 mt-1">
                            <h4 className="text-xs font-bold text-amber-900 mb-2">Counselor Incentive</h4>
                            {a.incentiveAmount ? (
                              <p className="text-sm font-bold text-amber-700">₹{a.incentiveAmount} Granted</p>
                            ) : (
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  assignIncentive(a.id, parseInt(incentiveForm));
                                  setIncentiveForm('');
                                }}
                                className="flex gap-2"
                              >
                                <input 
                                  type="number" required placeholder="Amount (e.g. 5000)" 
                                  value={incentiveForm} onChange={e => setIncentiveForm(e.target.value)}
                                  className="w-full text-xs px-3 py-1.5 border border-amber-200 rounded-md outline-none focus:border-amber-500"
                                />
                                <button type="submit" className="bg-amber-500 text-white text-[11px] px-3 py-1.5 rounded-md font-bold hover:bg-amber-600">Assign</button>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-3 flex items-center gap-2">
                        <select 
                          className="text-xs border border-slate-200 rounded-md px-2 py-1 outline-none focus:border-teal-500"
                          onChange={(e) => {
                            if (!e.target.value) return;
                            const counselor = counselors.find(c => c.id === e.target.value);
                            if (counselor) assignCounselor(a.id, counselor.id, counselor.name);
                          }}
                        >
                          <option value="">Assign Counselor...</option>
                          {counselors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    )}

                    {a.status === 'pending' || a.status === 'under_review' ? (
                      <div className="flex gap-2 border-t border-slate-100 pt-3">
                        <button onClick={() => updateApplicationStatus(a.id, 'approved')} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700"><Check className="h-3 w-3" /> Process Admission</button>
                        <button onClick={() => updateApplicationStatus(a.id, 'rejected')} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600"><X className="h-3 w-3" /> Reject</button>
                        <button onClick={() => setChatAppId({id: a.id, name: a.studentName})} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium hover:bg-indigo-100 ml-auto"><MessageSquare className="h-3 w-3" /> Discuss</button>
                      </div>
                    ) : (
                      <div className="flex gap-2 border-t border-slate-100 pt-3">
                        <button onClick={() => setChatAppId({id: a.id, name: a.studentName})} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium hover:bg-indigo-100"><MessageSquare className="h-3 w-3" /> Discuss</button>
                      </div>
                    )}
                  </div>
                ))}</div>
              </div>
            )}

            {tab === 'queries' && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-6">Student Queries</h2>
                <div className="flex flex-col gap-4">{queries.map((q) => (
                  <div key={q.id} className="border border-slate-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2 gap-2"><div><h3 className="font-semibold text-slate-900 text-sm">{q.subject}</h3><p className="text-xs text-slate-500">{q.studentName}</p></div><Badge status={q.status} /></div>
                    <p className="text-xs text-slate-600 mb-3">{q.message}</p>
                    {!q.response && <button className="px-3 py-1.5 text-white rounded-lg text-xs font-medium" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>Respond</button>}
                    {q.response && <div className="bg-emerald-50 rounded-lg p-2.5"><p className="text-[11px] text-emerald-800"><strong>Response:</strong> {q.response}</p></div>}
                  </div>
                ))}</div>
              </div>
            )}
            {tab === 'manual_reg' && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><UserPlus className="h-5 w-5 text-teal-600"/> Direct Walk-in Registration</h2>
                <form onSubmit={handleManualReg} className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <p className="text-sm text-slate-500 mb-6">Register a student directly without requiring them to use the public portal. This will instantly create an application record.</p>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Student Name</label>
                      <input required name="name" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Course Interested In</label>
                      <input required name="course" placeholder="e.g. B.Tech CS" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input required type="tel" name="phone" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email (Optional)</label>
                      <input type="email" name="email" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50" />
                    </div>
                  </div>
                  <button type="submit" className="text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                    Register Student
                  </button>
                </form>
              </div>
            )}

            {tab === 'rule_book' && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><BookOpen className="h-5 w-5 text-indigo-600"/> Rule Book & Incentives</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6">
                    <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2"><Book className="h-4 w-4"/> University Norms for Scholarships</h3>
                    <ul className="space-y-3 text-sm text-indigo-800">
                      <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400"/> <strong>Merit Based:</strong> 90%+ in 12th gets flat ₹50,000 waiver.</li>
                      <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400"/> <strong>Sports Quota:</strong> National level players get 30% fee reduction.</li>
                      <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400"/> <strong>Early Bird:</strong> Applications before May 1st get ₹10,000 concession.</li>
                    </ul>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6">
                    <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2"><Check className="h-4 w-4"/> Counselor Incentives</h3>
                    <ul className="space-y-3 text-sm text-emerald-800">
                      <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400"/> <strong>Base Conversion:</strong> ₹5,000 per successful admission.</li>
                      <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400"/> <strong>Tier-1 College Bonus:</strong> Additional ₹2,000 for top 50 NIRF.</li>
                      <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400"/> <strong>Monthly Target:</strong> 10+ admissions unlocks a 20% multiplier.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {tab === 'manage_counselors' && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><UserPlus className="h-5 w-5 text-indigo-600"/> Manage Counselors</h2>
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Create Counselor Form */}
                  <form onSubmit={handleAddCounselor} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">Create New Counselor</h3>
                    <p className="text-sm text-slate-500 mb-4">Only administrators can create authorized counselor accounts. Counselors must use these exact credentials to log in.</p>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                        <input required name="name" placeholder="e.g. Dr. Jane Smith" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                        <input required type="email" name="email" placeholder="jane.smith@university.edu" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input required type="text" name="password" placeholder="Secure password" className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50" />
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md" style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)' }}>
                      Create Account
                    </button>
                  </form>

                  {/* List of existing counselors */}
                  <div>
                    <h3 className="font-bold text-slate-900 mb-4">Authorized Counselors</h3>
                    <div className="flex flex-col gap-3">
                      {counselors.map(c => (
                        <div key={c.id} className="border border-slate-100 bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900 text-sm">{c.name}</h4>
                            <p className="text-xs text-slate-500">{c.email}</p>
                          </div>
                          <Badge status="approved" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'counselor_applications' && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><FileText className="h-5 w-5 text-teal-600"/> Pending Counselor Registrations</h2>
                <div className="flex flex-col gap-4">
                  {counselorApplications.length === 0 ? (
                    <p className="text-slate-500 text-sm">No applications found.</p>
                  ) : (
                    counselorApplications.map(app => (
                      <div key={app.id} className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{app.fullName}</h3>
                            <p className="text-sm text-slate-500">{app.designation} {app.orgName ? `at ${app.orgName}` : ''}</p>
                          </div>
                          <Badge status={app.status} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div><strong className="block text-slate-700 text-xs uppercase mb-1">Contact</strong><span className="text-slate-600">{app.email}<br/>{app.mobile}</span></div>
                          <div><strong className="block text-slate-700 text-xs uppercase mb-1">Location</strong><span className="text-slate-600">{app.city}, {app.state}</span></div>
                          <div><strong className="block text-slate-700 text-xs uppercase mb-1">Experience</strong><span className="text-slate-600">{app.experience} Years<br/>{app.specialization}</span></div>
                          <div><strong className="block text-slate-700 text-xs uppercase mb-1">Bank</strong><span className="text-slate-600">{app.bankName}<br/>{app.accNumber}</span></div>
                        </div>
                        {app.status === 'pending' && (
                          <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <button onClick={() => handleApproveCounselor(app)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 transition-colors">
                              <Check className="w-4 h-4" /> Approve & Generate Credentials
                            </button>
                            <button className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg text-sm flex items-center gap-2 transition-colors">
                              <X className="w-4 h-4" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === 'leaderboard' && (
              <div>
                <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Megaphone className="h-5 w-5 text-teal-600" />
                    <h3 className="font-bold text-slate-800">Counselor Marquee Offer</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">Update the scrolling banner shown at the top of the Counselor Dashboard.</p>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-teal-500 outline-none text-sm"
                      value={marqueeOffer}
                      onChange={e => setMarqueeOffer(e.target.value)}
                      placeholder="e.g., 🎉 Complete 5 admissions to get a ₹10,000 bonus!"
                    />
                    <button 
                      onClick={handleSaveMarquee}
                      disabled={isSavingMarquee}
                      className="flex items-center gap-2 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {isSavingMarquee ? 'Saving...' : 'Save Offer'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Leaderboard Manager</h2>
                  <p className="text-sm text-slate-500">Inject fake data to stimulate competition.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-3 text-sm font-semibold text-slate-500">Counselor Name</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500">Real Admissions</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500">Fake Admissions</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500">Total Admissions</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {counselors.map((c: any) => (
                        <tr key={c.id}>
                          <td className="py-4 text-sm font-medium text-slate-800">{c.name}</td>
                          <td className="py-4 text-sm text-slate-500">{c.realAdmissions || 0}</td>
                          <td className="py-4 text-sm text-slate-500">
                            <input 
                              type="number" 
                              className="w-20 px-3 py-1 border border-slate-200 rounded-lg text-sm"
                              defaultValue={c.fakeAdmissions || 0}
                              onBlur={(e) => updateCounselorFakeAdmissions(c.id, parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="py-4 text-sm font-bold text-teal-600">{(c.realAdmissions || 0) + (c.fakeAdmissions || 0)}</td>
                          <td className="py-4 text-sm text-right">
                            <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">Auto-saves on blur</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legacy Modal removed */}
      <AnimatePresence>
        {chatAppId && (
          <ApplicationChat
            appId={chatAppId.id}
            studentName={chatAppId.name}
            currentUserId="admin"
            currentUserRole="admin"
            onClose={() => setChatAppId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
