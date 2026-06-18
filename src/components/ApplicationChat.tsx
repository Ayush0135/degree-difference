import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Send, UserCircle, ShieldAlert } from 'lucide-react';
import { fetchApplicationNotes, addApplicationNote } from '../lib/supabase';

interface ApplicationChatProps {
  appId: string;
  studentName: string;
  currentUserId: string;
  currentUserRole: 'admin' | 'counselor';
  onClose: () => void;
}

export default function ApplicationChat({ appId, studentName, currentUserId, currentUserRole, onClose }: ApplicationChatProps) {
  const [notes, setNotes] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchApplicationNotes(appId).then(data => {
      setNotes(data);
      setLoading(false);
    });
  }, [appId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const note = await addApplicationNote(appId, currentUserId, currentUserRole, message);
    if (note) {
      setNotes([...notes, note]);
      setMessage('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl flex flex-col" style={{ height: '80vh', maxHeight: '600px' }}>
        
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5"><ShieldAlert className="h-4 w-4 text-emerald-600" /> Secure Terminal</h3>
            <p className="text-xs text-slate-500">Regarding: {studentName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50/50">
          {loading ? (
            <p className="text-center text-slate-400 text-sm mt-4">Loading messages...</p>
          ) : notes.length === 0 ? (
            <div className="text-center my-auto">
              <p className="text-slate-400 text-sm">No messages yet.</p>
              <p className="text-slate-400 text-xs">Start the discussion about this application.</p>
            </div>
          ) : (
            notes.map(n => {
              const isMine = n.sender_role === currentUserRole;
              return (
                <div key={n.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: n.sender_role === 'admin' ? '#fef2f2' : '#ecfeff', color: n.sender_role === 'admin' ? '#ef4444' : '#0891b2' }}>
                    {n.sender_role === 'admin' ? <ShieldAlert className="h-4 w-4" /> : <UserCircle className="h-4 w-4" />}
                  </div>
                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    <span className="text-[10px] text-slate-400 mb-1 px-1 uppercase tracking-wider">{n.sender_role}</span>
                    <div className={`p-3 rounded-2xl text-sm ${isMine ? 'bg-teal-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                      {n.message}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1 text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
            />
            <button type="submit" disabled={!message.trim()} className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white w-11 h-11 rounded-xl flex items-center justify-center transition-colors">
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </form>
        </div>

      </motion.div>
    </div>
  );
}
