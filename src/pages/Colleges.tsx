import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, SearchX, Loader2, Scale, X, CheckCircle2 } from 'lucide-react';
import CollegeCard from '../components/CollegeCard';
import { useCollegeStore } from '../store/collegeStore';
import { useSearchParams } from 'react-router-dom';
import Fuse from 'fuse.js';
import SEO from '../components/SEO';

export default function Colleges() {
  const { colleges, isLoading, initializeColleges, compareList, clearCompare, toggleCompare } = useCollegeStore();
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [filters, setFilters] = useState({ search: searchParams.get('search') || '', type: searchParams.get('type') || '', location: '', minFees: 0, maxFees: 5000000, minRating: 0 });
  const [semanticMatchIds, setSemanticMatchIds] = useState<string[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => { initializeColleges(); }, [initializeColleges]);

  // Debounced semantic search
  useEffect(() => {
    if (!filters.search.trim()) {
      setSemanticMatchIds(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: filters.search })
        });
        if (res.ok) {
          const data = await res.json();
          setSemanticMatchIds(data.matches || []);
        } else {
          setSemanticMatchIds(null);
        }
      } catch (err) {
        console.error("Semantic search failed", err);
        setSemanticMatchIds(null);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  const filtered = useMemo(() => {
    let result = colleges;

    // Apply strict filters first
    result = result.filter((c) => {
      if (filters.type && c.type !== filters.type) return false;
      if (filters.location) {
        const l = filters.location.toLowerCase();
        if (!c.city.toLowerCase().includes(l) && !c.state.toLowerCase().includes(l)) return false;
      }
      if (c.fees.min > filters.maxFees) return false;
      if (c.rating < filters.minRating) return false;
      return true;
    });

    // Apply semantic search if we have results from the backend
    if (semanticMatchIds !== null && filters.search.trim()) {
      // Sort the strict-filtered results by the order returned from the vector search
      const matchedMap = new Map(semanticMatchIds.map((id, index) => [id, index]));
      result = result
        .filter(c => matchedMap.has(c.id))
        .sort((a, b) => matchedMap.get(a.id)! - matchedMap.get(b.id)!);
    } else if (filters.search.trim()) {
      // Fallback to fuzzy search if semantic search hasn't returned yet or failed
      const fuse = new Fuse(result, {
        keys: [
          { name: 'name', weight: 2 },
          { name: 'city', weight: 1 },
          { name: 'state', weight: 1 },
          { name: 'coursesOffered', weight: 1.5 },
          { name: 'facilities', weight: 0.5 },
        ],
        threshold: 0.3,
        includeScore: true,
      });
      
      result = fuse.search(filters.search).map(r => r.item);
    }

    return result;
  }, [colleges, filters, semanticMatchIds]);

  const reset = () => setFilters({ search: '', type: '', location: '', minFees: 0, maxFees: 5000000, minRating: 0 });

  const compareColleges = colleges.filter(c => compareList.includes(c.id));

  return (
    <>
    <SEO 
      title="Explore Colleges" 
      description="Browse our comprehensive directory of engineering, medical, and arts colleges. Filter by location, fees, rating, and more to find your perfect fit."
      canonical="/colleges"
    />
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-slate-50 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-1">Discover Colleges</h1>
          <p className="text-slate-500 text-sm flex items-center gap-2 mb-6">
            {filtered.length} colleges match your criteria
          </p>

          <div className="relative max-w-3xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchX className="h-5 w-5 text-teal-500" />
            </div>
            <input 
              type="text" 
              value={filters.search} 
              onChange={(e) => setFilters({ ...filters, search: e.target.value })} 
              placeholder="AI Matchmaker: Try 'Colleges in Jaipur with under 10L fee'..." 
              className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-shadow" 
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
              </div>
            )}
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="lg:w-72 xl:w-80 shrink-0">
            <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden w-full bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold text-slate-800 text-sm"><Filter className="h-4 w-4" />Filters</span><SlidersHorizontal className="h-4 w-4 text-slate-400" />
            </button>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2"><Filter className="h-4 w-4" />Filters</h2>
                <button onClick={reset} className="text-xs text-teal-600 font-semibold">Reset</button>
              </div>
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Search</label>
                  <input type="text" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Name, location..." className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Type</label>
                  <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                    <option value="">All Types</option>{['Engineering','Medical','Business','Arts','Science','Law'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Location</label>
                  <input type="text" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder="City or State" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Annual Fees (Max)</label>
                  <input type="range" min="0" max="5000000" step="100000" value={filters.maxFees} onChange={(e) => setFilters({ ...filters, maxFees: parseInt(e.target.value) })} className="w-full accent-teal-600" />
                  <div className="text-xs text-slate-500 mt-1">Up to ₹{(filters.maxFees / 100000).toFixed(1)}L</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Min Rating</label>
                  <input type="range" min="0" max="5" step="0.5" value={filters.minRating} onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })} className="w-full accent-teal-600" />
                  <div className="text-xs text-slate-500 mt-1">{filters.minRating}+ stars</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
                <span className="ml-3 text-slate-600">Loading colleges...</span>
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">{filtered.map((c, i) => <CollegeCard key={c.id} college={c} index={i} />)}</div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><SearchX className="h-8 w-8 text-slate-400" /></div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No colleges found</h3>
                <p className="text-slate-500 text-sm mb-4">Try adjusting your filters</p>
                <button onClick={reset} className="text-white px-6 py-2 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>Reset Filters</button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>

    {/* Floating Compare Bar */}
    {compareList.length > 0 && (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6"
      >
        <div className="flex items-center gap-3">
          <div className="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
            {compareList.length}
          </div>
          <div>
            <p className="font-bold text-sm">Colleges Selected</p>
            <p className="text-xs text-slate-300">Select up to 3</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-l border-slate-700 pl-6">
          <button
            onClick={() => setShowCompareModal(true)}
            disabled={compareList.length < 2}
            className="bg-white text-slate-900 px-5 py-2 rounded-xl font-bold text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Scale className="w-4 h-4" />
            Compare
          </button>
          <button
            onClick={clearCompare}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    )}

    {/* Compare Modal */}
    {showCompareModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-600" />
              Compare Colleges
            </h2>
            <button
              onClick={() => setShowCompareModal(false)}
              className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Feature column */}
              <div className="hidden md:flex flex-col gap-8 pt-[220px] font-semibold text-slate-500 text-sm">
                <div className="h-10 flex items-center">Institution Type</div>
                <div className="h-10 flex items-center">Location</div>
                <div className="h-10 flex items-center">Annual Fees</div>
                <div className="h-10 flex items-center">NIRF Ranking</div>
                <div className="h-10 flex items-center">Average Placement</div>
                <div className="h-10 flex items-center">Highest Package</div>
                <div className="flex-1 mt-4">Top Facilities</div>
              </div>

              {/* College columns */}
              {compareColleges.map((c) => (
                <div key={c.id} className="flex flex-col gap-8 relative">
                  <button 
                    onClick={() => {
                      toggleCompare(c.id);
                      if (compareList.length <= 2) setShowCompareModal(false);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-slate-400 hover:text-red-500 shadow-sm z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="h-[200px] flex flex-col items-center text-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <img src={c.image} alt={c.name} className="w-20 h-20 rounded-full object-cover shadow-sm mb-3" />
                    <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 mb-1">{c.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star className="w-3 h-3 fill-current" /> {c.rating}
                    </div>
                  </div>
                  
                  <div className="h-10 flex flex-col justify-center text-sm">
                    <span className="md:hidden text-xs text-slate-400 font-semibold">Type</span>
                    <span className="font-semibold text-slate-900">{c.type}</span>
                  </div>
                  <div className="h-10 flex flex-col justify-center text-sm">
                    <span className="md:hidden text-xs text-slate-400 font-semibold">Location</span>
                    <span className="text-slate-700 truncate">{c.city}, {c.state}</span>
                  </div>
                  <div className="h-10 flex flex-col justify-center text-sm">
                    <span className="md:hidden text-xs text-slate-400 font-semibold">Annual Fees</span>
                    <span className="font-bold text-teal-700">₹{(c.fees.min / 100000).toFixed(1)}L - ₹{(c.fees.max / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="h-10 flex flex-col justify-center text-sm">
                    <span className="md:hidden text-xs text-slate-400 font-semibold">NIRF</span>
                    <span className="font-semibold text-slate-900">{c.nirf_rank ? `#${c.nirf_rank}` : 'N/A'}</span>
                  </div>
                  <div className="h-10 flex flex-col justify-center text-sm">
                    <span className="md:hidden text-xs text-slate-400 font-semibold">Avg Placement</span>
                    <span className="font-bold text-slate-900">{c.placements ? `₹${(c.placements.averagePackage / 100000).toFixed(1)}L` : 'N/A'}</span>
                  </div>
                  <div className="h-10 flex flex-col justify-center text-sm">
                    <span className="md:hidden text-xs text-slate-400 font-semibold">High Package</span>
                    <span className="font-bold text-slate-900">{c.placements ? `₹${(c.placements.highestPackage / 100000).toFixed(1)}L` : 'N/A'}</span>
                  </div>
                  <div className="flex-1 mt-4">
                    <span className="md:hidden text-xs text-slate-400 font-semibold block mb-2">Facilities</span>
                    <ul className="space-y-2">
                      {c.facilities.slice(0, 4).map(f => (
                        <li key={f} className="text-sm flex items-center gap-2 text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-teal-500" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    )}
    </>
  );
}
