import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Building2, BookOpen, HeartPulse, Briefcase } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCollegeStore } from '../store/collegeStore';

export default function AddCollege() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addCollege, updateCollege, colleges } = useCollegeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const isEditMode = !!id;
  const college = isEditMode ? colleges.find(c => c.id === id) : null;

  useEffect(() => {
    if (isEditMode && !college) {
      navigate('/admin');
    }
  }, [isEditMode, college, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const fd = new FormData(e.currentTarget);
    
    try {
      setLoadingText(isEditMode ? 'Updating Database...' : 'AI Enhancing Details...');
      
      const payload = {
        name: fd.get('name') as string,
        location: fd.get('location') as string,
        city: fd.get('city') as string,
        state: fd.get('state') as string,
        type: fd.get('type') as any,
        affiliation: fd.get('affiliation') as string,
        established: parseInt(fd.get('established') as string),
        rating: parseFloat(fd.get('rating') as string),
        totalSeats: parseInt(fd.get('totalSeats') as string),
        coursesOffered: (fd.get('courses') as string).split(',').map((c) => c.trim()),
        facilities: (fd.get('facilities') as string).split(',').map((f) => f.trim()),
        fees: { min: parseInt(fd.get('minFees') as string), max: parseInt(fd.get('maxFees') as string) },
        image: (fd.get('image') as string) || 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
        description: fd.get('description') as string,
        accreditation: (fd.get('accreditation') as string).split(',').map(a => a.trim()),
        nirf_rank: parseInt(fd.get('nirf_rank') as string) || undefined,
        website: fd.get('website') as string,
        campusSize: fd.get('campusSize') as string,
        hostelDetails: fd.get('hostelDetails') as string,
        foodQuality: fd.get('foodQuality') as string,
        gymFacilities: fd.get('gymFacilities') as string,
        collegeLifeReview: fd.get('collegeLifeReview') as string,
        scholarshipsAvailable: fd.get('scholarshipsAvailable') === 'on',
        placementReview: fd.get('placementReview') as string,
        placements: {
          averagePackage: parseInt(fd.get('avgPackage') as string) || 0,
          highestPackage: parseInt(fd.get('highestPackage') as string) || 0,
          placementRate: parseFloat(fd.get('placementRate') as string) || 0,
        }
      };

      if (!isEditMode) {
        // Call AI Backend only for new colleges
        const aiResponse = await fetch('http://localhost:3001/api/enhance-college', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        let finalData = payload;
        if (aiResponse.ok) {
          const { data } = await aiResponse.json();
          finalData = data;
        } else {
          console.warn('AI enhancement failed, using raw data');
        }

        setLoadingText('Saving to Database...');
        await addCollege(finalData);
      } else {
        await updateCollege(id, payload);
      }

      navigate('/admin');
    } catch (err) {
      console.error("Failed to save college:", err);
      alert("Failed to save college. Check the console for more details.");
    } finally {
      setIsSubmitting(false);
      setLoadingText('');
    }
  };

  if (isEditMode && !college) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1">{isEditMode ? 'Edit College' : 'Add New College'}</h1>
              <p className="text-slate-500 text-sm">Fill in the comprehensive details below.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. General Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center"><Building2 className="h-4 w-4" /></div>
              <h2 className="text-lg font-bold text-slate-900">General Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">College Name *</label>
                <input name="name" defaultValue={college?.name} type="text" required placeholder="e.g. Indian Institute of Technology" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Website URL</label>
                <input name="website" defaultValue={college?.website} type="url" placeholder="https://example.edu" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Established Year *</label>
                <input name="established" defaultValue={college?.established} type="number" required placeholder="1961" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Address *</label>
                <input name="location" defaultValue={college?.location} type="text" required placeholder="Hauz Khas, New Delhi" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                <input name="city" defaultValue={college?.city} type="text" required placeholder="New Delhi" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
                <input name="state" defaultValue={college?.state} type="text" required placeholder="Delhi" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                <select name="type" defaultValue={college?.type} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white">
                  {['Engineering','Medical','Business','Arts','Science','Law'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Affiliation *</label>
                <input name="affiliation" defaultValue={college?.affiliation} type="text" required placeholder="Autonomous / University Name" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Campus Size</label>
                <input name="campusSize" defaultValue={college?.campusSize} type="text" placeholder="e.g. 320 Acres" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Seats *</label>
                <input name="totalSeats" defaultValue={college?.totalSeats} type="number" required placeholder="2500" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea name="description" defaultValue={college?.description} rows={3} required placeholder="Detailed overview of the college..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                <input name="image" defaultValue={college?.image} type="url" placeholder="https://..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
            </div>
          </div>

          {/* 2. Academics */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"><BookOpen className="h-4 w-4" /></div>
              <h2 className="text-lg font-bold text-slate-900">Academics & Fees</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Courses Offered (comma separated) *</label>
                <input name="courses" defaultValue={college?.coursesOffered?.join(', ')} type="text" required placeholder="B.Tech, M.Tech, MBA, PhD" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Fees (₹) *</label>
                <input name="minFees" defaultValue={college?.fees?.min} type="number" required placeholder="200000" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Maximum Fees (₹) *</label>
                <input name="maxFees" defaultValue={college?.fees?.max} type="number" required placeholder="900000" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="scholarshipsAvailable" defaultChecked={college?.scholarshipsAvailable} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-medium text-slate-700">Scholarships & Financial Aid Available</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Overall Rating (0-5) *</label>
                <input name="rating" defaultValue={college?.rating} type="number" step="0.1" required placeholder="4.8" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIRF Rank</label>
                <input name="nirf_rank" defaultValue={college?.nirf_rank} type="number" placeholder="1" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Accreditation (comma separated)</label>
                <input name="accreditation" defaultValue={college?.accreditation?.join(', ')} type="text" placeholder="NAAC A++, NBA" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
            </div>
          </div>

          {/* 3. Campus Life */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center"><HeartPulse className="h-4 w-4" /></div>
              <h2 className="text-lg font-bold text-slate-900">Infrastructure & Campus Life</h2>
            </div>
            <div className="p-6 grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Facilities Available (comma separated) *</label>
                <input name="facilities" defaultValue={college?.facilities?.join(', ')} type="text" required placeholder="Library, Hostel, Sports Complex, Labs, Wi-Fi" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hostel Details</label>
                <textarea name="hostelDetails" defaultValue={college?.hostelDetails} rows={2} placeholder="AC/Non-AC, capacity, fees..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Food / Cafeteria Review</label>
                <input name="foodQuality" defaultValue={college?.foodQuality} type="text" placeholder="Quality of mess food, canteens available..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gym & Sports Facilities</label>
                <input name="gymFacilities" defaultValue={college?.gymFacilities} type="text" placeholder="Swimming pool, basketball court, modern gym..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">College Life & Culture Review</label>
                <textarea name="collegeLifeReview" defaultValue={college?.collegeLifeReview} rows={3} placeholder="Festivals, clubs, student vibe..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
            </div>
          </div>

          {/* 4. Placements */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><Briefcase className="h-4 w-4" /></div>
              <h2 className="text-lg font-bold text-slate-900">Placements & Careers</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Average Package (₹)</label>
                <input name="avgPackage" defaultValue={college?.placements?.averagePackage} type="number" placeholder="1800000" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Highest Package (₹)</label>
                <input name="highestPackage" defaultValue={college?.placements?.highestPackage} type="number" placeholder="12000000" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Placement Rate (%)</label>
                <input name="placementRate" defaultValue={college?.placements?.placementRate} type="number" step="0.1" placeholder="95.0" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Placement Review & Top Recruiters</label>
                <textarea name="placementReview" defaultValue={college?.placementReview} rows={3} placeholder="Top recruiters include Google, Microsoft. Training programs..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4 pb-12">
            <button type="button" onClick={() => navigate('/admin')} className="px-6 py-3 rounded-xl font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <motion.button disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-teal-500/20 disabled:opacity-70" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
              {isSubmitting ? loadingText : (
                <>
                  <Save className="h-5 w-5" /> {isEditMode ? 'Save Changes' : 'Save College'}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
