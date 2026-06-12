import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-slate-50 py-20 sm:py-32"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-12 border border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Privacy Policy</h1>
          </div>
          
          <div className="prose prose-slate prose-teal max-w-none">
            <p className="text-lg text-slate-600 lead">
              At DegreeDifference, we respect your privacy. This policy explains in simple terms how we collect, use, and protect your personal information. We promise not to bury you in legal jargon.
            </p>

            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. What information we collect</h3>
            <p className="text-slate-600 mb-4">
              When you use our platform, we collect basic information to help you find the right college. This includes your name, email, phone number (if you request counseling), and your academic preferences.
            </p>

            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. How we use your information</h3>
            <p className="text-slate-600 mb-4">
              We use your data solely to make your college search better. This means sending you relevant college recommendations, connecting you with our expert counselors, and keeping you updated on your application status. We do <strong>not</strong> sell your personal data to third-party marketing agencies.
            </p>

            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Keeping your data safe</h3>
            <p className="text-slate-600 mb-4">
              We use modern encryption and secure servers to make sure your data is safe with us. Only verified counselors and authorized staff have access to the details you provide for counseling purposes.
            </p>

            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Your rights</h3>
            <p className="text-slate-600 mb-4">
              You own your data. If you ever want us to delete your account or stop sending you emails, just let us know at <a href="mailto:hello@degreedifference.com" className="text-teal-600 hover:text-teal-700">hello@degreedifference.com</a>, and we'll take care of it immediately.
            </p>

            <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-500 m-0">
                Last updated: June 2026. If we make any major changes to this policy, we'll let you know via email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
