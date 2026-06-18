import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Award, ExternalLink, ChevronDown, Check, Building2, Landmark, Filter, Search, FileText, CheckCircle } from 'lucide-react';
import { mockScholarships } from '../data/mockData';
import SEO from '../components/SEO';

export default function Scholarships() {
  const [filter, setFilter] = useState<'All' | 'Government' | 'Private'>('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredScholarships = mockScholarships.filter(s => {
    const matchesFilter = filter === 'All' || s.type === filter;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.provider.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <>
    <SEO 
      title="Scholarship Directory" 
      description="Discover and apply for top government and private scholarships in India. Find the best opportunities to fund your education."
      canonical="/scholarships"
    />
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-12">
          <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Award className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Scholarship Directory</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Discover and apply for top government and private scholarships in India. We've compiled the best opportunities to fund your education.
          </p>
        </motion.div>

        {/* Controls */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center mb-8 sticky top-24 z-20">
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {['All', 'Government', 'Private'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  filter === type 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search scholarships..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="grid gap-6">
          <AnimatePresence>
            {filteredScholarships.map((s, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                key={s.id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div 
                  className="p-6 cursor-pointer flex flex-col md:flex-row gap-6 items-start md:items-center"
                  onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 ${
                        s.type === 'Government' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {s.type === 'Government' ? <Landmark className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                        {s.type}
                      </span>
                      {s.matchScore && s.matchScore > 80 && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Award className="w-3 h-3" /> High Match ({s.matchScore}%)
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-teal-600 transition-colors">{s.name}</h2>
                    <p className="text-sm font-semibold text-slate-500">{s.provider}</p>
                  </div>
                  
                  <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-0.5">Amount</p>
                      <p className="text-sm font-bold text-emerald-600">{s.amount}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-0.5">Deadline</p>
                        <p className="text-xs font-bold text-slate-900">{new Date(s.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'})}</p>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedId === s.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === s.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 bg-slate-50/50"
                    >
                      <div className="p-6 grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-teal-600" /> Scholarship Overview
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{s.inDepthDetails}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-teal-600" /> Eligibility Criteria
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{s.eligibility}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col justify-center">
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Ready to Apply?</h4>
                            <a 
                              href={s.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full flex justify-center items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                              Visit Official Portal <ExternalLink className="w-4 h-4" />
                            </a>
                            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                              You will be redirected to the official scholarship portal to complete your application.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredScholarships.length === 0 && (
            <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No scholarships found</h3>
              <p className="text-sm text-slate-500">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
