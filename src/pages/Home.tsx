import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, TrendingUp, Users, Award, ArrowRight, CheckCircle, Sparkles, BookOpen, Shield, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useStudentStore } from '../store/studentStore';
import { useAuthStore } from '../store/authStore';

/* ── tiny animated orb component ── */
function Orb({ size, x, y, delay, color, scrollOffset }: { size: number; x: string; y: string; delay: number; color: string; scrollOffset?: any }) {
  return (
    <motion.div className="absolute pointer-events-none" style={{ left: x, top: y, y: scrollOffset || 0 }}>
      <motion.div
        className="rounded-full opacity-30 blur-xl"
        style={{ width: size, height: size, background: color }}
        animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 8, delay, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

/* ── animated number counter ── */
function Counter({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="text-center"
    >
      <div className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-1">{value}</div>
      <div className="text-teal-200 text-xs sm:text-sm tracking-wide">{label}</div>
    </motion.div>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 250]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const y3 = useTransform(scrollY, [0, 1000], [0, 100]);

  const { addQuery } = useStudentStore();
  const { user } = useAuthStore();
  const [showCounselSuccess, setShowCounselSuccess] = useState(false);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); navigate(`/colleges?search=${searchQuery}`); };

  const handleCounsellingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    await addQuery({
      studentId: user?.id || 'guest',
      studentName: formData.get('name') as string,
      subject: 'Free Counselling Request',
      message: `Phone: ${formData.get('phone')}\nEmail: ${formData.get('email')}\nQuery: ${formData.get('query')}`,
      studentEmail: formData.get('email') as string,
      status: 'open',
      createdDate: new Date().toISOString().split('T')[0]
    });
    
    setShowCounselSuccess(true);
    form.reset();
    setTimeout(() => setShowCounselSuccess(false), 5000);
  };

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
  const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* ════════════════ HERO BANNER ════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #0d3b4f 60%, #134e4a 100%)' }}
      >
        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />

        {/* Floating orbs */}
        <Orb size={400} x="5%" y="10%" delay={0} color="#0d9488" scrollOffset={y1} />
        <Orb size={300} x="70%" y="5%" delay={1.5} color="#2563eb" scrollOffset={y2} />
        <Orb size={250} x="50%" y="60%" delay={3} color="#0891b2" scrollOffset={y3} />
        <Orb size={180} x="85%" y="70%" delay={2} color="#059669" scrollOffset={y1} />
        <Orb size={200} x="20%" y="75%" delay={4} color="#6366f1" scrollOffset={y2} />

        {/* Shimmer overlay */}
        <div className="absolute inset-0 animate-shimmer pointer-events-none" />

        <motion.div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-24 pb-24 sm:pb-40">
          <motion.div variants={container} initial="hidden" animate="show" className="text-center">
            {/* Badge */}
            <motion.div variants={item} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 text-teal-300 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm mb-6">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Trusted by 50,000+ students across India</span>
            </motion.div>

            <motion.h1 variants={item} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
              Find Your Dream
              <br />
              <span
                className="bg-clip-text text-transparent animate-gradient-x"
                style={{ backgroundImage: 'linear-gradient(90deg, #2dd4bf, #22d3ee, #60a5fa, #2dd4bf)', backgroundSize: '200% 200%' }}
              >
                College Today
              </span>
            </motion.h1>

            <motion.p variants={item} className="text-base sm:text-lg lg:text-xl text-slate-300 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Compare 500+ colleges, track applications in real-time, and get expert
              counseling — all in one powerful platform.
            </motion.p>

            {/* Search Bar */}
            <motion.form variants={item} onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative group">
                {/* glow ring */}
                <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"
                  style={{ background: 'linear-gradient(90deg, #0d9488, #0891b2, #2563eb)' }}
                />
                <div className="relative bg-white rounded-full shadow-2xl p-1.5 sm:p-2 flex items-center">
                  <Search className="h-5 w-5 text-slate-400 ml-3 sm:ml-4 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search colleges, courses, locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 outline-none text-slate-800 bg-transparent text-sm sm:text-base"
                  />
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-sm shrink-0"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}
                  >
                    Search
                  </motion.button>
                </div>
              </div>
            </motion.form>

            {/* Quick category chips */}
            <motion.div variants={item} className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {['Engineering', 'Medical', 'Business', 'Law', 'Arts', 'Science'].map((type) => (
                <motion.div key={type} whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={`/colleges?type=${type}`}
                    className="inline-block text-white/90 px-5 py-2 rounded-full text-sm font-medium border border-white/15 backdrop-blur-sm hover:bg-white/15 transition-colors"
                  >
                    {type}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" className="w-full h-12 sm:h-16">
            <path fill="#f8fafc" d="M0,64L60,58.7C120,53,240,43,360,42.7C480,43,600,53,720,58.7C840,64,960,64,1080,56C1200,48,1320,32,1380,24L1440,16L1440,80L0,80Z" />
          </svg>
        </div>
      </section>

      {/* ════════════════ STATS BAR ════════════════ */}
      <section className="relative -mt-1" style={{ background: 'linear-gradient(135deg, #134e4a, #0f766e)' }}>
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <Counter value="500+" label="Colleges" />
            <Counter value="50K+" label="Students Helped" />
            <Counter value="95%" label="Success Rate" />
            <Counter value="24/7" label="Support" />
          </div>
        </div>
      </section>

      {/* ════════════════ COUNSELLING BANNER ════════════════ */}
      <section className="relative overflow-hidden bg-slate-900 py-16 sm:py-24 mt-12">
        <div className="absolute inset-0">
          <img src="/students_campus_indian.png" alt="Students going to college" className="w-full h-full object-cover opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Confused About Your Future?</h2>
              <p className="text-lg text-slate-300 mb-8">Get free, personalized guidance from our expert admission counselors. We'll help you find the perfect college that matches your goals and budget.</p>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0"><CheckCircle className="h-5 w-5 text-teal-400" /></div>
                  <span>1-on-1 career mapping</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0"><CheckCircle className="h-5 w-5 text-teal-400" /></div>
                  <span>Profile evaluation & college shortlisting</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0"><CheckCircle className="h-5 w-5 text-teal-400" /></div>
                  <span>End-to-end admission support</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl relative">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Free Counselling</h3>
              <p className="text-sm text-slate-500 mb-6">Fill out the form below and our experts will call you shortly.</p>
              
              <form onSubmit={handleCounsellingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input required name="name" defaultValue={user?.name} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input required type="tel" name="phone" placeholder="+91 9876543210" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input required type="email" name="email" defaultValue={user?.email} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">What are you looking for?</label>
                  <textarea required name="query" rows={3} placeholder="e.g. Best engineering colleges in Pune under 5 Lakhs" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50 resize-none" />
                </div>
                
                <button type="submit" className="w-full text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                  Submit Request
                </button>
                
                {showCounselSuccess && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-600 text-sm text-center font-medium mt-2 bg-emerald-50 py-2 rounded-lg">
                    Request sent! We will contact you soon.
                  </motion.div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section className="py-16 sm:py-32 relative overflow-hidden bg-teal-50 mb-6 sm:mb-10">
        {/* Full-width Background Image */}
        <div 
          className="absolute inset-0 z-0 opacity-50 bg-cover bg-center bg-fixed transition-transform duration-[20s] ease-linear hover:scale-110"
          style={{ backgroundImage: 'url("/why-us.png")' }}
        />
        {/* Light overlay gradient (White & Green) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-white via-white/80 to-teal-100/40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-teal-100 text-teal-700 font-bold text-[10px] sm:text-xs tracking-widest uppercase mb-3 sm:mb-4 border border-teal-200 backdrop-blur-sm">Why Us</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-6 leading-tight">
              All your college prep<br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">in one place</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We know how confusing college admissions can be. That's why we built Degree Difference—to give you simple tools and real advice so you can find a college that actually fits you.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Search, title: 'Smart Search', desc: 'Find colleges by what actually matters to you—like placements, fees, and campus life.', gradient: 'linear-gradient(135deg, #2dd4bf, #06b6d4)', iconBg: 'rgba(20, 184, 166, 0.2)' },
              { icon: TrendingUp, title: 'Live Tracking', desc: 'No more guessing. See exactly where your application stands right now.', gradient: 'linear-gradient(135deg, #60a5fa, #818cf8)', iconBg: 'rgba(59, 130, 246, 0.2)' },
              { icon: Users, title: 'Real Counselors', desc: 'Talk to real people who know the system inside out and genuinely want to help.', gradient: 'linear-gradient(135deg, #34d399, #2dd4bf)', iconBg: 'rgba(16, 185, 129, 0.2)' },
              { icon: Shield, title: 'No Fake Data', desc: 'We double-check every single detail so you never have to worry about outdated info.', gradient: 'linear-gradient(135deg, #22d3ee, #0891b2)', iconBg: 'rgba(6, 182, 212, 0.2)' },
            ].map((f, i) => {
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/60 hover:border-teal-300 transition-all shadow-xl group"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3" style={{ background: f.iconBg }}>
                    <f.icon className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: f.gradient.includes('2dd4bf') ? '#0d9488' : f.gradient.includes('60a5fa') ? '#2563eb' : f.gradient.includes('34d399') ? '#059669' : '#0891b2' }} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">{f.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ IMPACT BANNER ════════════════ */}
      <section className="relative overflow-hidden bg-slate-900 py-16 sm:py-24 mt-6 sm:mt-10 mb-6 sm:mb-10">
        <div className="absolute inset-0">
          <img src="/indian_university_bg.png" alt="Indian university campus" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-950/80 via-teal-900/60 to-slate-900/80" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6 leading-tight tracking-tight drop-shadow-xl">
              Right Guidance, <span className="text-teal-300">Bright Future</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/95 font-medium mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Guiding lakhs of students and parents to find the right college. Building a better future for India, one student at a time.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link to="/colleges" className="w-full sm:w-auto inline-flex items-center justify-center text-slate-900 px-8 py-3.5 rounded-full font-bold text-sm sm:text-base hover:scale-105 transition-all shadow-xl shadow-teal-500/20" style={{ background: 'linear-gradient(135deg, #2dd4bf, #06b6d4)' }}>
                Find Your College
              </Link>
              <Link to="/colleges" className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent border-2 border-teal-500/30 text-teal-300 px-8 py-3.5 rounded-full font-bold text-sm sm:text-base hover:bg-teal-500/10 hover:border-teal-400 transition-all hover:scale-105">
                Get Job Ready Degree
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="py-16 sm:py-32 relative overflow-hidden bg-teal-50 mb-6 sm:mb-10">
        {/* Full-width Background Image */}
        <div 
          className="absolute inset-0 z-0 opacity-80 bg-cover bg-center bg-fixed transition-transform duration-[20s] ease-linear hover:scale-105"
          style={{ backgroundImage: 'url("/how-it-works.png")' }}
        />
        {/* Light overlay gradient (White & Green) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/95 via-white/50 to-white/95" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-16">
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-teal-100 text-teal-700 font-bold text-[10px] sm:text-xs tracking-widest uppercase mb-3 sm:mb-4 border border-teal-200 backdrop-blur-sm">How It Works</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-6 leading-tight">
              How we help you <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600">get there</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600">
              We've broken down the stressful admission process into three simple steps. No jargon, no confusion—just a clear path to your dream college.
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              { step: '01', title: 'Browse & Shortlist', desc: 'Look through our verified colleges, compare your favorites, and shortlist the ones that match your vibe and budget.', icon: BookOpen },
              { step: '02', title: 'Skip the Paperwork', desc: 'Submit your application right here. Fill out one simple form, upload your docs, and let us handle the rest.', icon: CheckCircle },
              { step: '03', title: 'Hop on a Call', desc: 'Talk to our counselors whenever you feel stuck. We\'re with you through every round until admission day.', icon: Award },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                className="relative bg-white/80 backdrop-blur-md rounded-2xl p-5 sm:p-8 border border-white/60 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8 group shadow-xl hover:border-teal-300 transition-colors"
              >
                {/* step number bg */}
                <div className="text-6xl sm:text-8xl font-black text-slate-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none transition-colors duration-300 group-hover:text-teal-50">
                  {s.step}
                </div>

                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-md border border-white bg-gradient-to-br from-teal-50 to-emerald-50 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <s.icon className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                </div>
                
                <div className="text-center sm:text-left relative z-10">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3 tracking-wide">{s.title}</h3>
                  <p className="text-slate-600 text-sm sm:text-lg leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ REAL STORIES BANNER ════════════════ */}
      <section className="py-20 bg-slate-50 overflow-hidden relative border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Real Stories from Real Students</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              See how we've helped thousands of students across India find their perfect college match.
            </p>
          </motion.div>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden flex bg-slate-50 pb-8 pt-4">
          {/* Gradient Edges for smooth fade effect */}
          <div className="absolute top-0 bottom-0 left-0 w-32 sm:w-64 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 right-0 w-32 sm:w-64 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

          {/* Marquee Track */}
          <div className="flex w-max animate-marquee gap-6 px-3">
            {[
              { name: 'Rahul Sharma', college: 'Amity University', text: 'I was totally lost with the admission process. The counselor guided me step-by-step and helped me secure my seat!', avatar: 'R', color: 'from-teal-500 to-cyan-500' },
              { name: 'Priya Patel', college: 'SRM Institute of Science and Technology', text: 'The smart search saved me hours. I could compare fee structures and cutoffs instantly. Highly recommended!', avatar: 'P', color: 'from-blue-500 to-indigo-500' },
              { name: 'Arjun Mehta', college: 'Symbiosis International', text: 'Live tracking is a game changer. I knew exactly where my application was at all times without calling anyone.', avatar: 'A', color: 'from-emerald-500 to-teal-500' },
              { name: 'Sneha Gupta', college: 'Lovely Professional University (LPU)', text: 'Degree Difference helped me find a college that matched my exact budget and placement expectations. Thank you!', avatar: 'S', color: 'from-indigo-500 to-purple-500' },
              { name: 'Karan Singh', college: 'Chandigarh University', text: 'The verified data gave me so much confidence. I didn\'t have to worry about fake reviews or outdated fee structures.', avatar: 'K', color: 'from-cyan-500 to-blue-500' },
              { name: 'Anjali Verma', college: 'KIIT Bhubaneswar', text: 'Skipping the endless paperwork was the best part. I filled out one form and they handled everything else.', avatar: 'A', color: 'from-teal-400 to-emerald-400' },
              { name: 'Vikram Das', college: 'VIT Vellore', text: 'My counselor was available even on weekends. They really care about where you end up studying.', avatar: 'V', color: 'from-blue-600 to-blue-400' },
              { name: 'Neha Reddy', college: 'Manipal Academy', text: 'I was aiming for top tier private colleges and the experts here helped me build a profile that got me accepted.', avatar: 'N', color: 'from-purple-500 to-pink-500' },
              { name: 'Rohan Joshi', college: 'Sharda University', text: 'It is so easy to use! I shortlisted my top 5 colleges in 10 minutes and applied to all of them the same day.', avatar: 'R', color: 'from-emerald-400 to-cyan-400' },
              { name: 'Aisha Khan', college: 'Christ University', text: 'From confusing application deadlines to interview prep, they walked me through everything. Absolutely the best platform.', avatar: 'A', color: 'from-indigo-400 to-blue-400' },
              { name: 'Deepak Nair', college: 'UPES Dehradun', text: 'I didn\'t know I was eligible for a scholarship until my counselor pointed it out. Saved my parents so much money!', avatar: 'D', color: 'from-cyan-400 to-teal-400' },
              { name: 'Meera Pillai', college: 'Galgotias University', text: 'The interface is beautiful and the support team is genuinely supportive. They truly want you to succeed.', avatar: 'M', color: 'from-teal-500 to-emerald-500' },
            ].concat([
              { name: 'Rahul Sharma', college: 'Amity University', text: 'I was totally lost with the admission process. The counselor guided me step-by-step and helped me secure my seat!', avatar: 'R', color: 'from-teal-500 to-cyan-500' },
              { name: 'Priya Patel', college: 'SRM Institute of Science and Technology', text: 'The smart search saved me hours. I could compare fee structures and cutoffs instantly. Highly recommended!', avatar: 'P', color: 'from-blue-500 to-indigo-500' },
              { name: 'Arjun Mehta', college: 'Symbiosis International', text: 'Live tracking is a game changer. I knew exactly where my application was at all times without calling anyone.', avatar: 'A', color: 'from-emerald-500 to-teal-500' },
              { name: 'Sneha Gupta', college: 'Lovely Professional University (LPU)', text: 'Degree Difference helped me find a college that matched my exact budget and placement expectations. Thank you!', avatar: 'S', color: 'from-indigo-500 to-purple-500' },
              { name: 'Karan Singh', college: 'Chandigarh University', text: 'The verified data gave me so much confidence. I didn\'t have to worry about fake reviews or outdated fee structures.', avatar: 'K', color: 'from-cyan-500 to-blue-500' },
              { name: 'Anjali Verma', college: 'KIIT Bhubaneswar', text: 'Skipping the endless paperwork was the best part. I filled out one form and they handled everything else.', avatar: 'A', color: 'from-teal-400 to-emerald-400' },
              { name: 'Vikram Das', college: 'VIT Vellore', text: 'My counselor was available even on weekends. They really care about where you end up studying.', avatar: 'V', color: 'from-blue-600 to-blue-400' },
              { name: 'Neha Reddy', college: 'Manipal Academy', text: 'I was aiming for top tier private colleges and the experts here helped me build a profile that got me accepted.', avatar: 'N', color: 'from-purple-500 to-pink-500' },
              { name: 'Rohan Joshi', college: 'Sharda University', text: 'It is so easy to use! I shortlisted my top 5 colleges in 10 minutes and applied to all of them the same day.', avatar: 'R', color: 'from-emerald-400 to-cyan-400' },
              { name: 'Aisha Khan', college: 'Christ University', text: 'From confusing application deadlines to interview prep, they walked me through everything. Absolutely the best platform.', avatar: 'A', color: 'from-indigo-400 to-blue-400' },
              { name: 'Deepak Nair', college: 'UPES Dehradun', text: 'I didn\'t know I was eligible for a scholarship until my counselor pointed it out. Saved my parents so much money!', avatar: 'D', color: 'from-cyan-400 to-teal-400' },
              { name: 'Meera Pillai', college: 'Galgotias University', text: 'The interface is beautiful and the support team is genuinely supportive. They truly want you to succeed.', avatar: 'M', color: 'from-teal-500 to-emerald-500' },
            ]).map((t, i) => (
              <div
                key={`${t.name}-${i}`}
                className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-slate-100 w-[260px] sm:w-[400px] shrink-0 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 mt-auto">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg bg-gradient-to-br ${t.color} shadow-inner`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium">{t.college}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA BANNER ════════════════ */}
      <section className="relative overflow-hidden py-10 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800"
        >
          {/* Animated Background Orbs inside banner */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Orb size={400} x="-10%" y="-20%" delay={0} color="#0d9488" />
            <Orb size={300} x="80%" y="60%" delay={2} color="#059669" />
            <Orb size={200} x="40%" y="80%" delay={4} color="#0891b2" />
          </div>

          {/* Inner Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          />

          <div className="relative px-6 py-12 sm:py-16 text-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-teal-500/20 text-teal-400 mb-4 sm:mb-6 relative">
                 <div className="absolute inset-0 rounded-full border-2 border-teal-500/30 animate-pulse" />
                 <div className="absolute inset-2 rounded-full border border-teal-400/20 animate-ping" />
                 <Award className="w-6 h-6 sm:w-8 sm:h-8 relative z-10" />
              </div>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 sm:mb-4 leading-tight tracking-tight"
            >
              Ready to Start Your <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 animate-gradient-x">
                Journey?
              </span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg text-slate-300 mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed"
            >
              Join thousands of students who found their dream colleges through DegreeDifference
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="relative inline-block"
            >
              {/* Glowing Pulse effect behind button */}
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full opacity-30 blur-md animate-pulse" />
              
              <Link
                to="/colleges"
                className="relative inline-flex items-center gap-2 bg-white text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-teal-500/25 group overflow-hidden"
              >
                <span className="relative z-10">Explore Colleges</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-200/50 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}
