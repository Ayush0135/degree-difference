import { GraduationCap, Mail, MapPin, Phone, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative bg-slate-950 pt-20 pb-10 border-t border-slate-800 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/10 blur-[120px] pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 inline-flex">
              <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">DegreeDifference</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              We're on a mission to simplify college admissions. No jargon, no hidden fees—just honest guidance to help you find where you belong.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm tracking-widest uppercase">Explore</h3>
            <div className="flex flex-col gap-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'Browse Colleges', path: '/colleges' },
                { name: 'Become a Counselor', path: '/counselor-registration' },
                { name: 'Student Dashboard', path: '/dashboard' },
                { name: 'Counselor Login', path: '/login?role=counselor' },
                { name: 'Admin Login', path: '/login?role=admin' }
              ].map((link) => (
                <Link key={link.name} to={link.path} className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-teal-400 transition-colors" />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm tracking-widest uppercase">Disciplines</h3>
            <div className="flex flex-col gap-4">
              {['Engineering', 'Medical Sciences', 'Business & Management', 'Law & Legal Studies'].map((t) => (
                <Link key={t} to={`/colleges?type=${t.split(' ')[0]}`} className="text-sm text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-teal-400 transition-colors" />
                  {t}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm tracking-widest uppercase">We're Here For You</h3>
            <div className="flex flex-col gap-4">
              <a href="mailto:hello@degreedifference.com" className="flex items-start gap-3 text-sm text-slate-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4 mt-0.5 text-teal-500" />
                <span>hello@degreedifference.com</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-slate-400">
                <Phone className="w-4 h-4 mt-0.5 text-teal-500" />
                <span>+91 98765 43210<br/><span className="text-xs text-slate-500">(Mon-Sat, 9AM-6PM)</span></span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin className="w-4 h-4 mt-0.5 text-teal-500" />
                <span>Level 4, TechPark<br/>Bengaluru, Karnataka 560001</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Humanized Legal & Copyright */}
        <div className="border-t border-slate-800 pt-8 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>for students across India. © {new Date().getFullYear()}</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-slate-500 hidden sm:inline">We respect your data.</span>
            <Link to="/privacy" className="text-slate-400 hover:text-teal-400 transition-colors font-medium">Privacy Policy</Link>
            <span className="text-slate-700">•</span>
            <Link to="/terms" className="text-slate-400 hover:text-teal-400 transition-colors font-medium">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
