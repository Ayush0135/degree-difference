import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

export default function Terms() {
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
              <BookOpen className="w-6 h-6 text-teal-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Terms of Service</h1>
          </div>
          
          <div className="prose prose-slate prose-teal max-w-none">
            <p className="text-lg text-slate-600 lead">
              Welcome to DegreeDifference. By using our platform, you agree to these simple rules. We've written them to be clear, fair, and easy to understand.
            </p>

            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. What we do</h3>
            <p className="text-slate-600 mb-4">
              DegreeDifference provides college discovery tools, comparison data, and access to admission counselors. We do our absolute best to ensure all data (fees, cutoffs, placements) is accurate and up-to-date, but we always recommend verifying with the college directly before making a final decision.
            </p>

            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Your responsibilities</h3>
            <p className="text-slate-600 mb-4">
              We ask that you use our platform honestly. Please don't create fake accounts, submit fraudulent counseling requests, or try to scrape/steal our database. If you're a student looking for help, we are here for you.
            </p>

            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. College Admissions</h3>
            <p className="text-slate-600 mb-4">
              While our expert counselors have a phenomenal success rate, using DegreeDifference does not guarantee admission to any specific institution. Admission decisions are ultimately made by the colleges themselves based on your merit and application.
            </p>

            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Account Termination</h3>
            <p className="text-slate-600 mb-4">
              We reserve the right to suspend or delete accounts that violate these terms or engage in abusive behavior toward our counselors or support staff. Let's keep things respectful!
            </p>

            <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-500 m-0">
                Last updated: June 2026. If you have any questions about these terms, drop us a line at <a href="mailto:hello@degreedifference.com" className="text-teal-600 hover:text-teal-700">hello@degreedifference.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
