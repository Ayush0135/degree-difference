import { GraduationCap, Mail, MapPin, Phone, Heart, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0e0e10] border-t border-white/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-20">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 group inline-flex">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center transition-transform group-hover:scale-105">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">Degree Difference</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              We're on a mission to simplify college admissions in India. Honest guidance, transparent data, and no hidden fees—just finding where you belong.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white text-[10px] font-bold tracking-widest uppercase mb-6">Platform</h3>
            <ul className="space-y-4">
              {[
                { name: 'Browse Colleges', path: '/colleges' },
                { name: 'Become a Counselor', path: '/counselor-registration' },
                { name: 'Student Portal', path: '/dashboard' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin / Counselors */}
          <div>
            <h3 className="text-white text-[10px] font-bold tracking-widest uppercase mb-6">Access</h3>
            <ul className="space-y-4">
              {[
                { name: 'Counselor Login', path: '/login?role=counselor' },
                { name: 'Admin Dashboard', path: '/login?role=admin' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1 group">
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-[10px] font-bold tracking-widest uppercase mb-6">Contact</h3>
            <ul className="space-y-4">
              <li>
                <a href="tel:8005825412" className="flex items-start gap-3 text-sm text-slate-400 hover:text-white transition-colors group">
                  <Phone className="w-4 h-4 mt-0.5 text-slate-600 group-hover:text-teal-400 transition-colors" />
                  <span>8005825412<br/><span className="text-[11px] text-slate-500 block mt-0.5">Mon-Sat, 9AM-6PM</span></span>
                </a>
              </li>
              <li>
                <a href="mailto:hello@degreedifference.com" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors group">
                  <Mail className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                  <span>hello@degreedifference.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-slate-400">
                  <MapPin className="w-4 h-4 mt-0.5 text-slate-600" />
                  <span>Level 4, TechPark<br/>Bengaluru, KA 560001</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-slate-600" />
            <span>for students across India. © {new Date().getFullYear()}</span>
          </div>
          
          <div className="flex items-center gap-6 text-xs font-medium">
            <Link to="/privacy" className="text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-500 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
