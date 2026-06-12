import { motion } from 'framer-motion';
import { MapPin, Star, TrendingUp, Heart, ArrowUpRight } from 'lucide-react';
import type { College } from '../types';
import { useCollegeStore } from '../store/collegeStore';
import { Link } from 'react-router-dom';

export default function CollegeCard({ college, index }: { college: College; index: number }) {
  const { favorites, toggleFavorite } = useCollegeStore();
  const isFav = favorites.includes(college.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay: (index % 10) * 0.08, duration: 0.5 }}
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100 group"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img 
          src={college.image} 
          alt={college.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          loading="lazy" 
          onError={(e) => { e.currentTarget.src = '/students_campus.png'; }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.7), transparent 60%)' }} />

        {college.nirf_rank && (
          <div className="absolute top-3 left-3 bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
            NIRF #{college.nirf_rank}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.preventDefault(); toggleFavorite(college.id); }}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white"
        >
          <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
        </motion.button>

        <div className="absolute bottom-3 left-3">
          <span className="text-white text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
            {college.type}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-base font-bold text-slate-900 mb-1.5 leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {college.name}
        </h3>

        <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{college.location}</span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-semibold">
            <Star className="h-3.5 w-3.5 fill-current" /> {college.rating}
          </span>
          <span className="text-slate-400 text-xs">Est. {college.established}</span>
        </div>

        {college.placements && (
          <div className="bg-slate-50 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-1 text-teal-700 mb-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">Placements</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-500">Average</p>
                <p className="font-bold text-slate-800">₹{(college.placements.averagePackage / 100000).toFixed(1)}L</p>
              </div>
              <div>
                <p className="text-slate-500">Highest</p>
                <p className="font-bold text-slate-800">₹{(college.placements.highestPackage / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-[11px] text-slate-500">Annual Fees</p>
            <p className="text-sm font-bold text-slate-800">₹{(college.fees.min / 100000).toFixed(1)}L – ₹{(college.fees.max / 100000).toFixed(1)}L</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-500">Seats</p>
            <p className="text-sm font-bold text-slate-800">{college.totalSeats}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {college.coursesOffered.slice(0, 3).map((c) => (
            <span key={c} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium">{c}</span>
          ))}
          {college.coursesOffered.length > 3 && (
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium">+{college.coursesOffered.length - 3}</span>
          )}
        </div>

        <Link
          to={`/college/${college.id}`}
          className="flex items-center justify-center gap-2 w-full text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-shadow"
          style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}
        >
          View Details <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}
