import React, { useState } from 'react';
import { motion } from 'motion/react';
import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Plus, Trash2, Edit2, LogOut, Settings, MessageCircle, Briefcase, X, Save, ArrowUpRight } from 'lucide-react';

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [user] = useAuthState(auth);
  const isAdmin = user?.email === 'mdalif1046@gmail.com';

  const [projectsSnapshot] = useCollection(
    query(collection(db, 'projects'), orderBy('order', 'asc'))
  );
  const [messagesSnapshot] = useCollection(
    query(collection(db, 'messages'), orderBy('createdAt', 'desc'))
  );

  const [settingsSnapshot] = useCollection(collection(db, 'settings'));
  const settings = settingsSnapshot?.docs.find(d => d.id === 'global')?.data() || {};

  const [view, setView] = useState<'projects' | 'messages' | 'settings'>('projects');
  const [editingProject, setEditingProject] = useState<any>(null);

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  if (!user) {
    return (
      <div className="fixed inset-0 z-[200] bg-primary flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-secondary p-12 text-center paper-shadow">
          <h2 className="font-display text-4xl font-bold uppercase mb-8 tracking-tighter">Restricted Access</h2>
          <button 
            onClick={login}
            className="w-full py-4 bg-primary text-secondary font-bold uppercase tracking-widest hover:bg-accent transition-colors"
          >
            Login with Google
          </button>
          <button onClick={onClose} className="mt-6 text-xs uppercase opacity-40 hover:opacity-100 italic">Go back</button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[200] bg-primary flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-secondary p-12 text-center text-red-500 font-bold paper-shadow">
          ACCESS DENIED. YOUR EMAIL IS NOT AUTHORIZED.
          <button onClick={logout} className="block w-full mt-8 py-4 bg-primary text-secondary hover:bg-red-500">Logout</button>
          <button onClick={onClose} className="mt-6 text-xs text-primary uppercase opacity-40 hover:opacity-100 italic">Exit</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-secondary flex flex-col font-mono text-xs">
      <header className="px-8 py-6 border-b border-primary/10 flex justify-between items-center bg-white">
        <div className="flex items-center gap-8">
          <h1 className="font-display text-2xl font-bold tracking-tighter uppercase mr-12">HQ PANEL mk2</h1>
          <nav className="flex gap-4">
            <button 
              onClick={() => setView('projects')}
              className={`px-4 py-2 flex items-center gap-2 ${view === 'projects' ? 'bg-primary text-secondary' : 'hover:bg-primary/5'}`}
            >
              <Briefcase size={14} /> Projects
            </button>
            <button 
              onClick={() => setView('messages')}
              className={`px-4 py-2 flex items-center gap-2 ${view === 'messages' ? 'bg-primary text-secondary' : 'hover:bg-primary/5'}`}
            >
              <MessageCircle size={14} /> Messages
            </button>
            <button 
              onClick={() => setView('settings')}
              className={`px-4 py-2 flex items-center gap-2 ${view === 'settings' ? 'bg-primary text-secondary' : 'hover:bg-primary/5'}`}
            >
              <Settings size={14} /> Settings
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="font-bold">{user.displayName}</p>
            <p className="opacity-40">{user.email}</p>
          </div>
          <button onClick={logout} className="p-2 hover:bg-red-50 text-red-500"><LogOut size={16} /></button>
          <button onClick={onClose} className="p-2 hover:bg-primary/5"><X size={20} /></button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-12 bg-[#f8f9fa]">
        {view === 'projects' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-2xl font-bold uppercase tracking-tight">Portfolio Items</h2>
              <button 
                onClick={() => setEditingProject({ title: '', category: '', image: '', description: '', order: (projectsSnapshot?.docs.length || 0) + 1 })}
                className="px-6 py-3 bg-accent text-white font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
              >
                <Plus size={16} /> New Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-[10px]">
              {projectsSnapshot?.docs.map(d => {
                const p = d.data();
                return (
                  <div key={d.id} className="bg-white p-6 border border-primary/5 shadow-sm group">
                    <img src={p.image} className="w-full aspect-video object-cover mb-4 grayscale" referrerPolicy="no-referrer" />
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-accent font-bold mb-1 uppercase letter-widest">{p.category}</p>
                        <h3 className="text-sm font-bold uppercase">{p.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-accent/10 text-accent"><ArrowUpRight size={12} /></a>}
                        <button onClick={() => setEditingProject({ ...p, id: d.id })} className="p-2 hover:bg-primary/5"><Edit2 size={12} /></button>
                        <button onClick={() => deleteDoc(doc(db, 'projects', d.id))} className="p-2 hover:bg-red-50 text-red-400"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <p className="opacity-60 line-clamp-2 mb-4">{p.description}</p>
                    <div className="pt-4 border-t border-primary/5 flex justify-between items-baseline opacity-40 italic">
                      <span>Order: {p.order}</span>
                      <span>#{d.id.slice(0, 6)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'messages' && (
          <div className="max-w-4xl mx-auto">
             <h2 className="text-2xl font-bold uppercase tracking-tight mb-12">Visitor Intel</h2>
             <div className="space-y-4">
               {messagesSnapshot?.docs.map(d => {
                 const m = d.data();
                 return (
                   <div key={d.id} className="bg-white p-8 border border-primary/5 shadow-sm flex gap-12 items-start">
                     <div className="flex-1">
                        <div className="flex justify-between mb-4">
                          <span className="font-bold uppercase tracking-widest">{m.email || 'Anonymous'}</span>
                          <span className="opacity-40 italic">{m.createdAt?.toDate().toLocaleString()}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-primary/80 bg-secondary/30 p-4 font-sans">{m.message}</p>
                     </div>
                     <button onClick={() => deleteDoc(doc(db, 'messages', d.id))} className="p-2 text-red-400 mt-1"><Trash2 size={16} /></button>
                   </div>
                 );
               })}
             </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-4xl mx-auto pb-32">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-12">Global Config</h2>
            <div className="bg-white p-12 border border-primary/5 shadow-sm space-y-12">
               {/* Hero Customization */}
               <div className="space-y-6">
                 <h3 className="text-xs font-bold uppercase text-accent border-b border-accent/10 pb-2">Hero Section Content</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div>
                     <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">Line 1 (e.g. I shape)</label>
                     <input value={settings.heroTitle1 || ''} onChange={e => updateSettings('heroTitle1', e.target.value)} className="w-full p-3 border border-primary/10 font-bold uppercase text-[10px]" />
                   </div>
                   <div>
                     <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">Line 2 (Accent/Italic)</label>
                     <input value={settings.heroTitle2 || ''} onChange={e => updateSettings('heroTitle2', e.target.value)} className="w-full p-3 border border-primary/10 font-serif italic text-[10px]" />
                   </div>
                   <div>
                     <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">Line 3 (e.g. with coding)</label>
                     <input value={settings.heroTitle3 || ''} onChange={e => updateSettings('heroTitle3', e.target.value)} className="w-full p-3 border border-primary/10 font-serif italic text-[10px]" />
                   </div>
                 </div>
                 <div>
                   <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">Hero Subtitle / Intro</label>
                   <textarea value={settings.heroSubtitle || ''} onChange={e => updateSettings('heroSubtitle', e.target.value)} className="w-full p-3 border border-primary/10 text-[10px] h-20" placeholder="Engineer focused on..." />
                 </div>
                 <div>
                   <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">Footer Tagline (Sign-off)</label>
                   <input value={settings.footerTagline || ''} onChange={e => updateSettings('footerTagline', e.target.value)} className="w-full p-3 border border-primary/10 text-[10px] font-hand text-lg" placeholder="everything begins with an idea." />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {/* Visuals */}
                 <div className="space-y-6">
                   <h3 className="text-xs font-bold uppercase text-accent border-b border-accent/10 pb-2">Visual Assets & Files</h3>
                   <div>
                     <label className="block text-[8px] uppercase font-bold mb-2 opacity-50 flex justify-between">
                       Main Portrait Image URL
                       <span className="text-[7px] text-accent normal-case italic">Use direct links (.jpg / .png)</span>
                     </label>
                     <input 
                       value={settings.portraitImage || ''} 
                       onChange={e => updateSettings('portraitImage', e.target.value)}
                       className="w-full p-3 border border-primary/10 font-mono text-[10px] outline-none hover:border-primary/30 focus:border-accent transition-colors" 
                       placeholder="https://imgur.com/...png"
                     />
                     <p className="mt-2 text-[7px] opacity-40 leading-tight">Note: Direct links from Google Search might not work due to protection. Try Imgur or right-click "Open Image in New Tab" to get raw link.</p>
                   </div>
                   <div>
                     <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">CV / Resume Link (PDF/URL)</label>
                     <input 
                       value={settings.cvUrl || ''} 
                       onChange={e => updateSettings('cvUrl', e.target.value)}
                       className="w-full p-3 border border-primary/10 font-mono text-[10px] outline-none hover:border-primary/30 focus:border-accent transition-colors" 
                       placeholder="https://drive.google.com/..."
                     />
                   </div>
                 </div>

                 {/* Socials */}
                 <div className="space-y-6">
                   <h3 className="text-xs font-bold uppercase text-accent border-b border-accent/10 pb-2">Social Connections</h3>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">GitHub URL</label>
                       <input 
                         value={settings.socials?.github || ''} 
                         onChange={e => updateSocials('github', e.target.value)}
                         className="w-full p-3 border border-primary/10 font-mono text-[10px] outline-none" 
                       />
                     </div>
                     <div>
                       <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">LinkedIn URL</label>
                       <input 
                         value={settings.socials?.linkedin || ''} 
                         onChange={e => updateSocials('linkedin', e.target.value)}
                         className="w-full p-3 border border-primary/10 font-mono text-[10px] outline-none" 
                       />
                     </div>
                     <div>
                       <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">Twitter URL</label>
                       <input 
                         value={settings.socials?.twitter || ''} 
                         onChange={e => updateSocials('twitter', e.target.value)}
                         className="w-full p-3 border border-primary/10 font-mono text-[10px] outline-none" 
                       />
                     </div>
                     <div>
                       <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">Contact Email</label>
                       <input 
                         value={settings.socials?.email || ''} 
                         onChange={e => updateSocials('email', e.target.value)}
                         className="w-full p-3 border border-primary/10 font-mono text-[10px] outline-none" 
                       />
                     </div>
                   </div>
                 </div>
               </div>

               {/* Personal Notes */}
               <div className="space-y-6 pt-6 border-t border-primary/5">
                 <h3 className="text-xs font-bold uppercase text-accent border-b border-accent/10 pb-2">Personal Notes (Paper Slips)</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div>
                     <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">Reading Now</label>
                     <textarea 
                       value={settings.reading || ''} 
                       onChange={e => updateSettings('reading', e.target.value)}
                       className="w-full p-3 border border-primary/10 text-[10px] font-serif italic outline-none h-24" 
                     />
                   </div>
                   <div>
                     <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">Current Focus</label>
                     <textarea 
                       value={settings.focus || ''} 
                       onChange={e => updateSettings('focus', e.target.value)}
                       className="w-full p-3 border border-primary/10 text-[10px] outline-none h-24" 
                     />
                   </div>
                   <div>
                     <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">Philosophy / Goal</label>
                     <textarea 
                       value={settings.philosophy || ''} 
                       onChange={e => updateSettings('philosophy', e.target.value)}
                       className="w-full p-3 border border-primary/10 text-[10px] font-mono outline-none h-24" 
                     />
                   </div>
                 </div>
               </div>

               <div className="pt-12 text-center text-[10px] opacity-40 uppercase tracking-widest italic flex items-center justify-center gap-4">
                 <span className="w-12 h-[1px] bg-primary" />
                 Autosaved to mk2-core
                 <span className="w-12 h-[1px] bg-primary" />
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Editor Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-[300] bg-primary/20 backdrop-blur-sm flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl bg-white p-12 shadow-2xl relative"
          >
            <button onClick={() => setEditingProject(null)} className="absolute top-6 right-6 p-2"><X /></button>
            <h3 className="text-xl font-bold uppercase mb-8 tracking-tighter">
              {editingProject.id ? 'Modify Entity' : 'New Creation'}
            </h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const { id, ...data } = editingProject;
              if (id) {
                await updateDoc(doc(db, 'projects', id), data);
              } else {
                await addDoc(collection(db, 'projects'), { ...data, createdAt: serverTimestamp() });
              }
              setEditingProject(null);
            }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">Title</label>
                  <input required value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} className="w-full p-3 border border-primary/10 font-bold focus:ring-1 focus:ring-accent outline-none uppercase" />
                </div>
                <div>
                  <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">Category</label>
                  <input required value={editingProject.category} onChange={e => setEditingProject({...editingProject, category: e.target.value})} className="w-full p-3 border border-primary/10 font-bold focus:ring-1 focus:ring-accent outline-none uppercase" />
                </div>
              </div>
              <div>
                <label className="block text-[8px] uppercase font-bold mb-2 opacity-50 flex justify-between">
                  Image URL
                  <span className="text-accent normal-case italic">Use direct links (.jpg / .png) from Imgur or Postimages</span>
                </label>
                <input required value={editingProject.image} onChange={e => setEditingProject({...editingProject, image: e.target.value})} className="w-full p-3 border border-primary/10 font-mono text-xs focus:ring-1 focus:ring-accent outline-none" placeholder="https://i.imgur.com/example.png" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">GitHub URL (Source)</label>
                  <input value={editingProject.githubUrl || ''} onChange={e => setEditingProject({...editingProject, githubUrl: e.target.value})} className="w-full p-3 border border-primary/10 font-mono text-xs focus:ring-1 focus:ring-accent outline-none" placeholder="https://github.com/..." />
                </div>
                <div>
                  <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">Live URL (Demo)</label>
                  <input value={editingProject.liveUrl || ''} onChange={e => setEditingProject({...editingProject, liveUrl: e.target.value})} className="w-full p-3 border border-primary/10 font-mono text-xs focus:ring-1 focus:ring-accent outline-none" placeholder="https://your-app.render.com" />
                </div>
              </div>
              <div>
                <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">Description</label>
                <textarea required rows={3} value={editingProject.description} onChange={e => setEditingProject({...editingProject, description: e.target.value})} className="w-full p-3 border border-primary/10 font-sans text-xs focus:ring-1 focus:ring-accent outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <div>
                  <label className="block text-[8px] uppercase font-bold mb-2 opacity-50">Order</label>
                  <input type="number" required value={editingProject.order} onChange={e => setEditingProject({...editingProject, order: parseInt(e.target.value)})} className="w-full p-3 border border-primary/10 font-bold outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-primary text-secondary font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent transition-colors mt-8">
                <Save size={16} /> Finalize Changes
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );

  async function updateSettings(field: string, value: any) {
    const docRef = doc(db, 'settings', 'global');
    try {
      await updateDoc(docRef, { [field]: value });
    } catch {
      // If doc doesn't exist, create it
      const { setDoc } = await import('firebase/firestore');
      await setDoc(docRef, { [field]: value }, { merge: true });
    }
  }

  async function updateSocials(field: string, value: any) {
    const docRef = doc(db, 'settings', 'global');
    try {
      await updateDoc(docRef, { [`socials.${field}`]: value });
    } catch {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(docRef, { socials: { [field]: value } }, { merge: true });
    }
  }
}
