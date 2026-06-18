import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, BookOpen, Wallet, Send, ArrowRight, Loader2, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import type { College } from '../types';
import SEO from '../components/SEO';

export default function AIMatchmaker() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponse(null);
    setColleges([]);

    const fd = new FormData(e.currentTarget);
    const city = fd.get('city') as string;
    const program = fd.get('program') as string;
    const budget = fd.get('budget') as string;
    const customPreferences = fd.get('custom') as string;

    try {
      const res = await fetch('/api/ai-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, program, budget, custom: customPreferences })
      });
      const data = await res.json();
      
      if (data.response) setResponse(data.response);
      if (data.colleges) setColleges(data.colleges);
    } catch (err) {
      console.error(err);
      setResponse("Oops! The AI got confused. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <SEO 
      title="AI College Matchmaker" 
      description="Tell us what you're looking for, and our AI will find the perfect colleges for you straight from our verified directory."
      canonical="/ai-matchmaker"
    />
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-teal-600" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">AI College Matchmaker</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">Tell us what you're looking for, and our AI will find the perfect colleges for you straight from our verified directory.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1"><MapPin className="h-4 w-4" /> Preferred City</label>
                <input name="city" placeholder="e.g. Pune, Bangalore, Delhi..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1"><BookOpen className="h-4 w-4" /> Program / Course</label>
                <input required name="program" placeholder="e.g. Computer Science Engineering, MBA..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1"><Wallet className="h-4 w-4" /> Max Budget (Fees)</label>
                <input name="budget" placeholder="e.g. 5 Lakhs, 10 Lakhs..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Any specific preferences?</label>
                <textarea name="custom" rows={3} placeholder="e.g. Must have good sports facilities, AC hostels, and high placement rates." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500 resize-none" />
              </div>
              
              <button disabled={isSubmitting} type="submit" className="w-full py-3 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-500/20 flex justify-center items-center gap-2 disabled:opacity-70" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Send className="h-4 w-4" /> Find My Match</>}
              </button>
            </form>
          </div>

          {/* Results Area */}
          <div className="flex flex-col gap-6">
            {!response && !isSubmitting && (
              <div className="h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Bot className="h-12 w-12 mb-3 text-slate-300" />
                <p>Submit your preferences to see your personalized AI recommendations here.</p>
              </div>
            )}

            {isSubmitting && (
              <div className="h-full min-h-[300px] bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-teal-600 p-8 text-center">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <p className="font-medium animate-pulse">Scanning the directory for perfect matches...</p>
              </div>
            )}

            {response && !isSubmitting && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* AI Text Response */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
                    <Sparkles className="h-5 w-5" /> AI Recommendation
                  </div>
                  <div className="prose prose-sm prose-emerald text-emerald-900 leading-relaxed max-w-none">
                    <ReactMarkdown>{response}</ReactMarkdown>
                  </div>
                </div>

                {/* College Cards */}
                {colleges.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 px-1">Top Matches ({colleges.length})</h3>
                    {colleges.map((c) => (
                      <Link key={c.id} to={`/college/${c.id}`} className="block group">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex gap-4 hover:shadow-md transition-shadow">
                          <img 
                            src={c.image} 
                            alt={c.name} 
                            className="w-20 h-20 rounded-lg object-cover shrink-0" 
                            onError={(e) => { e.currentTarget.src = '/students_campus.png'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-teal-600">{c.name}</h4>
                            <p className="text-xs text-slate-500 mb-2 truncate">{c.city}, {c.state}</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">{c.type}</span>
                              <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-semibold">⭐ {c.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center shrink-0">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
