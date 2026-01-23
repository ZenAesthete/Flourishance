import React, { useState } from 'react';
import { useStore } from '../store';
import { ShieldCheck, Zap, Plus, Trash2, X, ThumbsUp, ThumbsDown, AlertTriangle, Flame, CheckCircle2, Pencil, Save } from 'lucide-react';
import { Identity } from '../types';

const IdentityView = () => {
  const { identities, addIdentity, deleteIdentity, updateIdentity, updateIdentityVote } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  
  // Create state variables for new identity
  const [newStatement, setNewStatement] = useState('');
  const [newProofs, setNewProofs] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatement, setEditStatement] = useState('');
  const [editProofs, setEditProofs] = useState('');

  const handleAdd = () => {
    if (!newStatement.trim()) return;
    const proofsList = newProofs.split('\n').filter(p => p.trim() !== '');
    addIdentity({
      id: Date.now().toString(),
      statement: newStatement,
      proofs: proofsList.length > 0 ? proofsList : ['Take action'],
      strength: 0,
      votes: 0,
      downvotes: 0,
      streak: 0
    });
    setNewStatement('');
    setNewProofs('');
    setIsAdding(false);
  };

  const startEditing = (identity: Identity) => {
    setEditingId(identity.id);
    setEditStatement(identity.statement);
    setEditProofs(identity.proofs.join('\n'));
  };

  const saveEdit = () => {
    if (editingId) {
        const proofsList = editProofs.split('\n').filter(p => p.trim() !== '');
        updateIdentity(editingId, {
            statement: editStatement,
            proofs: proofsList.length > 0 ? proofsList : ['Take action']
        });
        setEditingId(null);
    }
  };

  const cancelEdit = () => {
      setEditingId(null);
  };

  return (
    <div className="p-5 pt-10 space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Identity</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Character Architecture</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`p-3 rounded-full transition-all active:scale-90 shadow-lg ${isAdding ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
        >
          {isAdding ? <X size={24} /> : <Plus size={24} />}
        </button>
      </header>

      {/* Add New Form */}
      {isAdding && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-blue-500/30 rounded-3xl p-6 animate-in fade-in slide-in-from-top-4 shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <h3 className="text-xs font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-4">New Definition</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Statement</label>
              <input 
                value={newStatement}
                onChange={e => setNewStatement(e.target.value)}
                placeholder="I am someone who..."
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Proofs (One per line)</label>
              <textarea 
                value={newProofs}
                onChange={e => setNewProofs(e.target.value)}
                placeholder="Run 5k&#10;Eat vegetables"
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none h-24 resize-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
            <button 
              onClick={handleAdd}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 dark:shadow-blue-900/30 active:scale-95 transition-transform"
            >
              Initialize Identity
            </button>
          </div>
        </div>
      )}

      {/* Identity List */}
      <div className="space-y-5">
        {identities.length === 0 && !isAdding && (
          <div className="text-center py-12 px-6 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800">
             <p className="text-slate-500 font-bold">No identities defined.</p>
             <p className="text-slate-600 text-sm mt-1">Tap + to start building yourself.</p>
          </div>
        )}

        {identities.map(identity => {
          const isEditing = editingId === identity.id;
          
          if (isEditing) {
              return (
                <div key={identity.id} className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-blue-500/30 rounded-3xl p-6 animate-in fade-in shadow-xl relative overflow-hidden">
                    <h3 className="text-xs font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-4">Edit Identity</h3>
                    <div className="space-y-4">
                        <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Statement</label>
                        <input 
                            value={editStatement}
                            onChange={e => setEditStatement(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none transition-colors"
                        />
                        </div>
                        <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Proofs (One per line)</label>
                        <textarea 
                            value={editProofs}
                            onChange={e => setEditProofs(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-white text-sm focus:border-blue-500 outline-none h-24 resize-none transition-colors"
                        />
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={saveEdit}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                            >
                                <Save size={16} /> Save Changes
                            </button>
                            <button 
                                onClick={cancelEdit}
                                className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white py-3 rounded-xl font-bold text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
              );
          }

          const total = identity.votes + identity.downvotes;
          const upPercentage = total === 0 ? 0 : (identity.votes / total) * 100;
          const downPercentage = total === 0 ? 0 : (identity.downvotes / total) * 100;

          return (
            <div key={identity.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm">
              
              <div className="flex justify-between items-start mb-4">
                <div className="pr-4 flex-1">
                   <h3 className="font-bold text-xl text-slate-900 dark:text-white leading-tight mb-2">{identity.statement}</h3>
                   <div className="flex items-center gap-3 opacity-60">
                      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-500 dark:text-emerald-400">
                         <ShieldCheck size={12} /> {identity.votes} Proofs
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600"></div>
                      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-orange-500 dark:text-orange-400">
                         <Flame size={12} /> {identity.streak || 0} Day Streak
                      </div>
                   </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right mb-1">
                    <span className={`text-3xl font-black leading-none ${identity.strength > 80 ? 'text-emerald-500 dark:text-emerald-400' : identity.strength > 40 ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400'}`}>
                      {identity.strength}%
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                        onClick={() => startEditing(identity)}
                        className="text-slate-400 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-1.5"
                    >
                        <Pencil size={16} />
                    </button>
                    <button 
                        onClick={() => deleteIdentity(identity.id)}
                        className="text-slate-400 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1.5"
                    >
                        <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Explicit Proofs List */}
              <div className="mb-6 bg-slate-50 dark:bg-black/20 rounded-xl p-3 border border-slate-200 dark:border-white/5">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Valid Evidence
                </p>
                <div className="flex flex-wrap gap-2">
                  {identity.proofs.map((proof, i) => (
                    <span key={i} className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/60 px-2 py-1 rounded-md border border-slate-200 dark:border-white/5">
                      {proof}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-black/40 h-3 rounded-full mb-6 flex overflow-hidden">
                 {total > 0 ? (
                   <>
                     <div 
                       className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-700"
                       style={{ width: `${upPercentage}%` }}
                     ></div>
                     <div 
                       className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)] transition-all duration-700"
                       style={{ width: `${downPercentage}%` }}
                     ></div>
                   </>
                 ) : (
                   <div className="w-full h-full text-[9px] text-slate-400 dark:text-slate-600 flex items-center justify-center font-bold tracking-widest uppercase">No data</div>
                 )}
              </div>

              {/* Voting Controls */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => updateIdentityVote(identity.id, true)}
                  className="flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all active:scale-95"
                >
                  <ThumbsUp size={16} /> CAST PROOF
                </button>
                <button 
                  onClick={() => updateIdentityVote(identity.id, false)}
                  className="flex items-center justify-center gap-2 py-3 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold transition-all active:scale-95"
                >
                  <ThumbsDown size={16} /> LOG SLIP
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IdentityView;