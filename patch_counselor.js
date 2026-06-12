const fs = require('fs');
const file = '/Users/ayush/Downloads/college-discovery-platform-development/src/pages/CounselorDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix scholarship form
content = content.replace(/<div className="flex items-center gap-3">\s*<span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">\{a\.documents\.length\} files<\/span>\s*<div className="flex gap-2">\s*\{a\.documents\.map\(\(doc: any, i: number\) => \(\s*<button key=\{doc\.id \|\| i\} onClick=\{\(\) => window\.open\(doc\.url, '_blank'\)\} className="text-\[11px\] font-bold text-white bg-slate-800 px-3 py-1\.5 rounded-lg hover:bg-slate-700 transition-colors">\s*View \{doc\.type === 'pdf' \? 'PDF' : 'Image'\}\s*<\/button>\s*\)\)\}\s*<\/div>\s*<\/div>/g, 
  '<div className="flex gap-2"><button type="submit" className="bg-emerald-600 text-white text-[11px] px-3 py-1.5 rounded-lg font-bold">Save</button><button type="button" onClick={() => setScholarshipForm(null)} className="text-slate-500 text-[11px] px-3 py-1.5 hover:bg-slate-200 rounded-lg">Cancel</button></div>');

// Add modals at the bottom before closing tags
const modals = `
        {showRegForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Register New Walk-in Student</h3>
                <button onClick={() => setShowRegForm(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleRegister} className="p-4">
                <div className="space-y-3 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student Name</label>
                    <input required name="name" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input required type="tel" name="phone" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                      <input type="email" name="email" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target College</label>
                    <select required name="college" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500">
                      <option value="">Select College</option>
                      {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Interested Course</label>
                    <input required name="course" placeholder="e.g. B.Tech Computer Science" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500" />
                  </div>
                </div>
                <button type="submit" className="w-full text-white py-2.5 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                  Submit Registration
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showMsgForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-teal-600"/> Message Administration</h3>
                <button onClick={() => setShowMsgForm(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleSendMsg} className="p-6">
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                    <input required name="subject" placeholder="e.g. Missing Document for Ayush" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
                    <textarea required name="message" rows={4} placeholder="Type your message to the administration..." className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-teal-500 resize-none"></textarea>
                  </div>
                </div>
                <button type="submit" className="w-full text-white py-2.5 rounded-xl text-sm font-bold" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)' }}>
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showDocsModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><FileText className="h-4 w-4 text-teal-600"/> Review Documents</h3>
                <button onClick={() => setShowDocsModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <p className="text-sm text-slate-500 mb-4">The following students have uploaded documents for review.</p>
                <div className="space-y-3">
                  {applications.filter((a: any) => a.documents && a.documents.length > 0).length === 0 ? (
                    <div className="text-center text-sm text-slate-400 py-6 border border-dashed border-slate-200 rounded-xl">No pending documents to review right now.</div>
                  ) : (
                    applications.filter((a: any) => a.documents && a.documents.length > 0).map((a: any) => (
                      <div key={a.id} className="border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{a.studentName}</h4>
                          <p className="text-xs text-slate-500">{a.collegeName}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">{a.documents.length} files</span>
                          <div className="flex gap-2">
                            {a.documents.map((doc: any, i: number) => (
                              <button key={doc.id || i} onClick={() => window.open(doc.url, '_blank')} className="text-[11px] font-bold text-white bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
                                View {doc.type === 'pdf' ? 'PDF' : 'Image'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

if (!content.includes('showDocsModal &&')) {
  content = content.replace(/      <\/div>\n    <\/div>\n  \);\n\}\n/g, modals + '\n      </div>\n    </div>\n  );\n}\n');
}

fs.writeFileSync(file, content);
