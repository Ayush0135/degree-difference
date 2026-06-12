import React, { useState } from 'react';
import { submitCounselorApplication } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Landmark, IndianRupee, ShieldCheck, ArrowRight, ChevronRight, Upload,
  Briefcase, CheckCircle2, PieChart, TrendingUp, DollarSign, BookOpen, Star,
  HelpCircle, UserCircle, Phone, MapPin, Building, FileText, CreditCard,
  Network, Monitor, Award, Headphones
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const stats = [
  { icon: Users, value: '5000+', label: 'Students Admitted' },
  { icon: Landmark, value: '100+', label: 'University Partners' },
  { icon: Briefcase, value: '200+', label: 'Active Counselors' },
  { icon: IndianRupee, value: '₹50 Cr+', label: 'Scholarships Processed' },
];

const features = [
  { icon: BookOpen, title: 'Student Admissions Support', desc: 'End-to-end assistance from application to enrollment.' },
  { icon: IndianRupee, title: 'Scholarship Guidance', desc: 'Help students secure maximum financial aid.' },
  { icon: TrendingUp, title: 'Career Counseling', desc: 'Provide data-driven career path recommendations.' },
  { icon: Network, title: 'University Partnerships', desc: 'Direct access to top global and domestic institutions.' },
  { icon: Monitor, title: 'Marketing Assistance', desc: 'Co-branded materials and lead generation support.' },
  { icon: Headphones, title: 'Dedicated Support Team', desc: '24/7 priority support for you and your students.' },
  { icon: PieChart, title: 'Real-Time Tracking', desc: 'Advanced CRM to track applications and status.' },
  { icon: DollarSign, title: 'Attractive Incentives', desc: 'Industry-leading commission structure and bonuses.' },
];

const timelineSteps = [
  { title: 'Counselor Registration', desc: 'Submit your basic details and professional background.' },
  { title: 'Admin Review', desc: 'Our team manually reviews your application.' },
  { title: 'Document Verification', desc: 'KYC and certification documents are verified.' },
  { title: 'Approval Process', desc: 'Final green light from our partnership directors.' },
  { title: 'Login Credentials', desc: 'Secure credentials sent via email & SMS.' },
  { title: 'Dashboard Activation', desc: 'Start managing leads and tracking applications!' },
];

const adminWorkflow = [
  'Counselor Registers', 'Pending Review', 'Admin Verification', 'Approve / Reject', 'Generate ID', 'Create Credentials', 'Send Email & SMS', 'Activate Dashboard'
];

export default function CounselorRegistration() {
  const navigate = useNavigate();
  const [formStep, setFormStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', gender: '', dob: '', aadhaar: '', pan: '',
    mobile: '', altMobile: '', email: '', whatsapp: '',
    country: 'India', state: '', city: '', address: '', pincode: '',
    orgName: '', designation: '', experience: '', studentsCounseled: '', specialization: '',
    accHolder: '', bankName: '', accNumber: '', ifsc: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep < 5) {
      setFormStep(formStep + 1);
      window.scrollTo({ top: document.getElementById('registration-form')?.offsetTop! - 100, behavior: 'smooth' });
    } else {
      setIsSubmitting(true);
      const res = await fetch('/api/register-counselor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData })
      });
      const success = await res.json();
      setIsSubmitting(false);
      
      if (success) {
        setIsSubmitted(true);
        window.scrollTo({ top: document.getElementById('registration-form')?.offsetTop! - 100, behavior: 'smooth' });
      } else {
        alert("There was an error submitting your application. Please try again.");
      }
    }
  };

  const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 z-0">
          <img src="/counselor-hero.png" alt="Indian Education Counselors" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-slate-50/80 to-slate-50" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-100 rounded-full blur-[120px] opacity-50 translate-x-1/3 -translate-y-1/4 mix-blend-multiply" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold mb-6 shadow-sm">
              <ShieldCheck className="w-4 h-4" /> Authorized Partnership Program
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
              Become an Authorized <br className="hidden md:block"/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">Education Counselor</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-slate-600 mb-10 leading-relaxed">
              Join our premium counselor network. Help students achieve their academic goals while exponentially growing your own counseling business with our enterprise tools.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                Register Now
              </button>
              <Link to="/login?role=counselor" className="w-full sm:w-auto px-8 py-4 rounded-xl text-teal-700 bg-white border border-teal-100 font-bold text-lg shadow-sm hover:bg-teal-50 transition-all flex items-center justify-center gap-2">
                Counselor Login <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 p-6 rounded-2xl shadow-xl shadow-slate-200/40 text-center">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-teal-600">
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-1">{s.value}</h3>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Become & Benefits */}
      <section className="py-24 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Why Partner With Us?</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Access enterprise-grade tools and elite university networks designed to elevate your counseling practice.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:shadow-teal-500/10 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Timeline */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-500">A streamlined verification process to ensure quality and trust.</p>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 to-cyan-500 opacity-20" />
            <div className="space-y-12">
              {timelineSteps.map((step, i) => (
                <div key={i} className="relative flex items-start gap-8">
                  <div className="absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-teal-500" />
                  <div className="ml-16 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 w-full hover:shadow-md transition-shadow">
                    <span className="text-sm font-bold text-teal-600 mb-1 block">STEP {i + 1}</span>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Step Registration Form */}
      <section id="registration-form" className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-teal-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Counselor Registration</h2>
            <p className="text-slate-400">Join our network of elite education counselors.</p>
          </div>

          {!isSubmitted ? (
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl">
              {/* Progress Bar */}
              <div className="flex justify-between items-center mb-12 relative">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-white/10 -z-10 rounded-full" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-teal-500 -z-10 rounded-full transition-all duration-500" style={{ width: `${((formStep - 1) / 4) * 100}%` }} />
                
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${formStep >= step ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                    {formStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
                  </div>
                ))}
              </div>

              <form onSubmit={handleNext}>
                <AnimatePresence mode="wait">
                  {/* Step 1: Personal Info */}
                  {formStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><UserCircle className="text-teal-400"/> Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                          <input required type="text" name="fullName" value={formData.fullName} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Gender *</label>
                          <select required name="gender" value={formData.gender} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none">
                            <option value="">Select Gender</option><option>Male</option><option>Female</option><option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth *</label>
                          <input required type="date" name="dob" value={formData.dob} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Aadhaar Number *</label>
                          <input required type="text" maxLength={12} name="aadhaar" value={formData.aadhaar} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">PAN Number *</label>
                          <input required type="text" maxLength={10} name="pan" value={formData.pan} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Contact Info */}
                  {formStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><Phone className="text-teal-400"/> Contact Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Mobile Number *</label>
                          <input required type="tel" name="mobile" value={formData.mobile} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">WhatsApp Number *</label>
                          <input required type="tel" name="whatsapp" value={formData.whatsapp} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
                          <input required type="email" name="email" value={formData.email} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Address Info */}
                  {formStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><MapPin className="text-teal-400"/> Location</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-300 mb-2">Full Office/Home Address *</label>
                          <textarea required rows={3} name="address" value={formData.address} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">State *</label>
                          <input required type="text" name="state" value={formData.state} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">City & Pincode *</label>
                          <div className="flex gap-4">
                            <input required type="text" placeholder="City" name="city" value={formData.city} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                            <input required type="text" placeholder="Pin" name="pincode" value={formData.pincode} onChange={updateForm} className="w-1/2 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Professional Info */}
                  {formStep === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><Building className="text-teal-400"/> Professional Background</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Organization Name (if any)</label>
                          <input type="text" name="orgName" value={formData.orgName} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Designation *</label>
                          <input required type="text" name="designation" value={formData.designation} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Years of Experience *</label>
                          <input required type="number" min="0" name="experience" value={formData.experience} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Specialization *</label>
                          <select required name="specialization" value={formData.specialization} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none">
                            <option value="">Select Domain</option>
                            <option>Study Abroad</option>
                            <option>Domestic Admissions</option>
                            <option>Scholarship Guidance</option>
                            <option>Career Counseling</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Docs & Bank */}
                  {formStep === 5 && (
                    <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><FileText className="text-teal-400"/> Documents Upload</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {['Aadhaar Card', 'PAN Card', 'Profile Photo', 'Experience Certificate'].map((doc) => (
                            <div key={doc} className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:bg-slate-800/50 hover:border-teal-400 transition-colors cursor-pointer group">
                              <Upload className="w-8 h-8 text-slate-400 group-hover:text-teal-400 mx-auto mb-3 transition-colors" />
                              <span className="text-sm font-medium text-slate-300">{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <hr className="border-slate-700" />

                      <div>
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><CreditCard className="text-teal-400"/> Bank Details (For Commissions)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Account Holder Name *</label>
                            <input required type="text" name="accHolder" value={formData.accHolder} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Account Number *</label>
                            <input required type="text" name="accNumber" value={formData.accNumber} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">IFSC Code *</label>
                            <input required type="text" name="ifsc" value={formData.ifsc} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Bank Name *</label>
                            <input required type="text" name="bankName" value={formData.bankName} onChange={updateForm} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/10">
                  {formStep > 1 ? (
                    <button type="button" onClick={() => setFormStep(formStep - 1)} className="px-6 py-3 text-slate-300 hover:text-white font-medium transition-colors">
                      Back
                    </button>
                  ) : <div></div>}
                  
                  <button disabled={isSubmitting} type="submit" className={`px-8 py-3 rounded-xl text-white font-bold text-lg shadow-lg transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}`} style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                    {isSubmitting ? 'Submitting...' : formStep === 5 ? 'Submit Application' : 'Next Step'} <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-3xl shadow-2xl text-center">
              <div className="w-24 h-24 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-teal-500/30">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Application Submitted!</h3>
              <p className="text-slate-300 text-lg mb-8 max-w-lg mx-auto">
                Thank you for applying to join our counselor network. Our administrative team will manually review your documents and profile.
              </p>
              
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-left max-w-lg mx-auto mb-8">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2"><ShieldCheck className="text-teal-400" /> Verification Process</h4>
                <ul className="space-y-3 text-slate-300 text-sm">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" /> Documents will be verified within 24-72 hours.</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" /> We may contact you for additional information.</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" /> Upon approval, secure login credentials will be emailed.</li>
                </ul>
              </div>

              <button onClick={() => navigate('/')} className="px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                Return to Home
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Admin Verification Workflow */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Seamless Onboarding Workflow</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Our highly secure and streamlined platform architecture.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            {adminWorkflow.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="bg-slate-50 border border-slate-200 px-6 py-4 rounded-xl shadow-sm text-sm font-bold text-slate-700 flex items-center justify-center text-center">
                  {step}
                </div>
                {idx < adminWorkflow.length - 1 && (
                  <div className="hidden md:flex items-center text-teal-500">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img src="/counselor-cta.png" alt="Counseling success" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500 rounded-full blur-[150px] opacity-30 mix-blend-overlay" />
        </div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Ready to Transform Student Lives?</h2>
          <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto font-medium">Register today and unlock enterprise-level resources, exclusive university partnerships, and an elite network.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 rounded-xl bg-white text-slate-900 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              Start Application
            </button>
            <a href="mailto:support@degreedifference.com" className="px-8 py-4 rounded-xl border border-white/30 text-white font-bold text-lg hover:bg-white/10 transition-all">
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
