import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Calendar, Users, Award, Bookmark, CheckCircle, TrendingUp, ArrowLeft, Send, PhoneCall, Globe } from 'lucide-react';
import { useCollegeStore } from '../store/collegeStore';
import { useAuthStore } from '../store/authStore';
import { useStudentStore } from '../store/studentStore';
import { addQueryToDB } from '../lib/supabase';
import type { Application } from '../types';
import { useState } from 'react';
import CollegeChatbot from '../components/CollegeChatbot';
import SEO from '../components/SEO';

export default function CollegeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colleges, favorites, toggleFavorite } = useCollegeStore();
  const { isAuthenticated, user } = useAuthStore();
  const { addApplication } = useStudentStore();
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [showCallbackSuccess, setShowCallbackSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const college = colleges.find((c) => c.id === id);

  if (!college) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">College not found</h2>
        <button onClick={() => navigate('/colleges')} className="text-teal-600 font-medium">Back to Colleges</button>
      </div>
    </div>
  );

  const isFav = favorites.includes(college.id);
  const handleApplyClick = () => { 
    if (!isAuthenticated || !user) { 
      navigate('/login'); 
      return; 
    } 
    setShowModal(true); 
  };

  const handleApplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    const formData = new FormData(e.currentTarget);
    
    const newApp: Application = {
      id: `app_${Date.now()}`,
      studentId: user.id,
      studentName: formData.get('name') as string,
      studentEmail: user.email,
      studentPhone: formData.get('phone') as string,
      collegeId: college.id,
      collegeName: college.name,
      course: formData.get('course') as string,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
      documents: [],
      progress: {
        step: 1,
        totalSteps: 5,
        currentStage: 'Application Submitted',
      },
    };
    
    await addApplication(newApp);
    setShowModal(false);
    setShowSuccess(true); 
  };

  const handleCallbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const phone = formData.get('phone') as string;
    const time = formData.get('time') as string;
    const name = formData.get('name') as string;
    
    // Fallback info if user is not logged in
    const studentName = user?.name || name || 'Anonymous Student';
    const studentEmail = user?.email || `student_${Date.now()}@example.com`;
    const studentId = user?.id || `anon_${Date.now()}`;

    try {
      await addQueryToDB({
        studentId: studentId,
        studentName: studentName,
        studentEmail: studentEmail,
        subject: `Callback Request: ${college?.name}`,
        message: `Phone: ${phone}\nPreferred Time: ${time}\n\nI would like to request a callback regarding admission in ${college?.name}.`,
        status: 'open',
        createdDate: new Date().toISOString(),
      });
      
      setShowCallbackModal(false);
      setShowCallbackSuccess(true);
    } catch (error) {
      console.error('Failed to submit callback request:', error);
      alert('Failed to request callback. Please try again.');
    }
  };

  const fadeUp = (d = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.4 } });

  return (
    <>
    <SEO 
      title={college.name} 
      description={`View details, courses, reviews, and admission criteria for ${college.name} in ${college.location}.`}
      canonical={`/colleges/${college.id}`}
    />
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative h-72 sm:h-[26rem]" style={{ background: 'linear-gradient(135deg, #0f172a, #134e4a)' }}>
        <img 
          src={college.image} 
          alt={college.name} 
          className="w-full h-full object-cover opacity-25" 
          onError={(e) => { e.currentTarget.src = '/students_campus.png'; }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent)' }} />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 w-full">
            <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-slate-300 hover:text-white text-sm"><ArrowLeft className="h-4 w-4" /> Back</button>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <motion.h1 {...fadeUp()} className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 leading-tight">{college.name}</motion.h1>
                <div className="flex flex-wrap items-center gap-4 text-slate-300 text-sm">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{college.location}</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-current text-amber-400" />{college.rating}</span>
                  {college.website && (
                    <a href={college.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                      <Globe className="h-4 w-4" /> Visit Website
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => toggleFavorite(college.id)} className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-medium border border-white/20 backdrop-blur-sm">
                  <Bookmark className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} /> {isFav ? 'Saved' : 'Save'}
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleApplyClick} className="flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg">
                  <Send className="h-4 w-4" /> Apply Now
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-6 border-b border-slate-200 gap-6 hide-scrollbar">
          {['Overview', 'Courses', 'Campus & Facilities', 'Placements', 'Reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-2 text-sm font-bold transition-colors ${
                activeTab === tab 
                  ? 'text-teal-700 border-b-2 border-teal-600' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {activeTab === 'Overview' && (
              <>
                {/* Stats */}
                <motion.div {...fadeUp()} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: Calendar, label: 'Established', value: college.established, color: '#0891b2' },
                    { icon: Users, label: 'Total Seats', value: college.totalSeats, color: '#0d9488' },
                    ...(college.nirf_rank ? [{ icon: Award, label: 'NIRF Rank', value: `#${college.nirf_rank}`, color: '#d97706' }] : []),
                    ...(college.placements ? [{ icon: TrendingUp, label: 'Placed', value: `${college.placements.placementRate}%`, color: '#059669' }] : []),
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
                      <s.icon className="h-6 w-6 mx-auto mb-2" style={{ color: s.color }} />
                      <div className="text-xl font-extrabold text-slate-900">{s.value}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </motion.div>

                <motion.div {...fadeUp(0.1)} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-3">About</h2>
                  <p className="text-slate-600 text-sm leading-relaxed">{college.description}</p>
                </motion.div>
                
                {college.campusSize && (
                  <motion.div {...fadeUp(0.15)} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-3">Campus Snapshot</h2>
                    <p className="text-slate-600 text-sm leading-relaxed">{college.campusSize}</p>
                  </motion.div>
                )}
              </>
            )}

            {activeTab === 'Courses' && (
              <motion.div {...fadeUp(0.2)} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Courses Offered</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {college.coursesOffered.map((c) => (
                    <div key={c} className="flex items-start gap-3 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <CheckCircle className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" /> 
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1">{c}</h4>
                        <p className="text-xs text-slate-500">Full-time • Merit & Entrance based</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'Campus & Facilities' && (
              <>
                <motion.div {...fadeUp(0.3)} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Facilities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {college.facilities.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {(college.hostelDetails || college.gymFacilities || college.foodQuality) && (
                  <motion.div {...fadeUp(0.4)} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {college.hostelDetails && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-2">Hostel & Accommodation</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{college.hostelDetails}</p>
                      </div>
                    )}
                    {college.foodQuality && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-2">Cafeteria & Food</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{college.foodQuality}</p>
                      </div>
                    )}
                    {college.gymFacilities && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-2">Sports & Fitness</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{college.gymFacilities}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            )}

            {activeTab === 'Placements' && college.placements && (
              <>
                <motion.div {...fadeUp(0.4)} className="rounded-2xl shadow-sm border border-slate-100 p-6" style={{ background: 'linear-gradient(135deg, #f0fdfa, #ecfeff)' }}>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Placement Statistics (2023)</h2>
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="bg-white/60 p-4 rounded-xl border border-teal-100/50">
                      <p className="text-slate-500 text-xs mb-1 font-medium uppercase tracking-wide">Average Package</p>
                      <p className="text-3xl font-extrabold text-teal-800">₹{(college.placements.averagePackage / 100000).toFixed(1)}L</p>
                    </div>
                    <div className="bg-white/60 p-4 rounded-xl border border-teal-100/50">
                      <p className="text-slate-500 text-xs mb-1 font-medium uppercase tracking-wide">Highest Package</p>
                      <p className="text-3xl font-extrabold text-cyan-800">₹{(college.placements.highestPackage / 100000).toFixed(1)}L</p>
                    </div>
                    <div className="bg-white/60 p-4 rounded-xl border border-teal-100/50">
                      <p className="text-slate-500 text-xs mb-1 font-medium uppercase tracking-wide">Placement Rate</p>
                      <p className="text-3xl font-extrabold text-emerald-800">{college.placements.placementRate}%</p>
                    </div>
                  </div>
                </motion.div>
                {college.placementReview && (
                  <motion.div {...fadeUp(0.5)} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-3">Placement Overview</h2>
                    <p className="text-slate-600 text-sm leading-relaxed">{college.placementReview}</p>
                  </motion.div>
                )}
              </>
            )}

            {activeTab === 'Reviews' && (
              <motion.div {...fadeUp(0.4)} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Student Reviews</h2>
                  <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="font-extrabold">{college.rating}</span>
                    <span className="text-xs">/ 5.0</span>
                  </div>
                </div>

                {college.collegeLifeReview ? (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-slate-500">S</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm text-slate-900">Student feedback</h4>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Verified</span>
                      </div>
                      <p className="text-sm text-slate-600 italic leading-relaxed">"{college.collegeLifeReview}"</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-8">No reviews yet for this college.</p>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <motion.div {...fadeUp(0.1)} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Fee Structure</h3>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100"><span className="text-slate-500 text-sm">Minimum</span><span className="text-lg font-bold text-slate-900">₹{(college.fees.min / 100000).toFixed(2)}L</span></div>
              <div className="flex justify-between items-center pt-3"><span className="text-slate-500 text-sm">Maximum</span><span className="text-lg font-bold text-slate-900">₹{(college.fees.max / 100000).toFixed(2)}L</span></div>
              <p className="text-[11px] text-slate-400 mt-4">*Annual fees, may vary by course</p>
            </motion.div>

            <motion.div {...fadeUp(0.2)} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Info</h3>
              <div className="flex flex-col gap-3">
                <div><p className="text-xs text-slate-500">Type</p><p className="font-semibold text-slate-800 text-sm">{college.type}</p></div>
                <div><p className="text-xs text-slate-500">Affiliation</p><p className="font-semibold text-slate-800 text-sm">{college.affiliation}</p></div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Accreditation</p>
                  <div className="flex flex-wrap gap-1.5">{college.accreditation.map((a) => <span key={a} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">{a}</span>)}</div>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.3)} className="rounded-2xl shadow-md p-6 text-white" style={{ background: 'linear-gradient(135deg, #0f172a, #134e4a)' }}>
              <h3 className="text-lg font-bold mb-2">Need Help?</h3>
              <p className="text-slate-300 text-sm mb-4">Get expert guidance from our counselors</p>
              <button onClick={() => setShowCallbackModal(true)} className="w-full bg-white text-slate-900 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-shadow">Request Callback</button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">Application Form</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleApplySubmit} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required name="name" defaultValue={user?.name} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input required type="tel" name="phone" placeholder="e.g. +91 9876543210" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Course</label>
                <select required name="course" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-white">
                  {college.coursesOffered.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-3 mt-2 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>Submit Application</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="h-8 w-8 text-emerald-600" /></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h3>
            <p className="text-slate-500 text-sm mb-6">Your application to {college.name} has been sent successfully. We will review it shortly.</p>
            <button onClick={() => setShowSuccess(false)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold text-sm">Close</button>
          </motion.div>
        </div>
      )}

      {/* Callback Form Modal */}
      {showCallbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><PhoneCall className="w-5 h-5 text-teal-600" /> Request a Callback</h3>
              <button onClick={() => setShowCallbackModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCallbackSubmit} className="p-6 flex flex-col gap-5">
              {!user && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input required name="name" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500" placeholder="John Doe" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input required type="tel" name="phone" placeholder="e.g. +91 9876543210" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Time to Call</label>
                <select required name="time" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-white">
                  <option value="Anytime">Anytime</option>
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                </select>
              </div>
              <button type="submit" className="w-full py-3 mt-2 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>Request Callback</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Callback Success Modal */}
      {showCallbackSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="h-8 w-8 text-emerald-600" /></div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Callback Requested!</h3>
            <p className="text-slate-500 text-sm mb-6">Our experts will call you shortly regarding admission to {college.name}.</p>
            <button onClick={() => setShowCallbackSuccess(false)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold text-sm">Close</button>
          </motion.div>
        </div>
      )}

      {/* AI Chatbot */}
      <CollegeChatbot college={college} />
    </div>
    </>
  );
}
