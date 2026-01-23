import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { 
  ShieldAlert, 
  History, 
  Skull, 
  Plus, 
  X, 
  Trash2, 
  Zap, 
  BrainCircuit, 
  Info, 
  Activity,
  AlertTriangle,
  ShieldCheck,
  Pencil,
  Save
} from 'lucide-react';
import { FailureMode } from '../types';

const DefenseView = () => {
  const { failureModes, interrupterLogs, addFailureMode, updateFailureMode, deleteFailureMode, energyLevel, addInterrupterLog, clearInterrupterLogs, deleteInterrupterLog } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newProtocol, setNewProtocol] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTrigger, setEditTrigger] = useState('');
  const [editProtocol, setEditProtocol] = useState('');

  // Risk Radar Logic
  const riskMetrics = useMemo(() => {
    const recent = interrupterLogs.slice(0, 10);
    const failures = recent.filter(l => !l.success).length;
    const intensityAvg = recent.length ? recent.reduce((a, b) => a + b.intensity, 0) / recent.length : 0;
    
    // Risk score 0-100
    let score = (failures * 20) + (intensityAvg * 5);
    if (energyLevel === 'Low') score += 15; // Fatigue increases risk
    
    // Fix: Round to nearest integer to avoid float precision issues in UI
    score = Math.round(score);
    
    return {
      score: Math.min(score, 100),
      label: score > 70 ? 'CRITICAL' : score > 40 ? 'ELEVATED' : 'NOMINAL',
      color: score > 70 ? 'text-rose-500' : score > 40 ? 'text-amber-500' : 'text-emerald-500',
      barColor: score > 70 ? 'bg-rose-500' : score > 40 ? 'bg-amber-500' : 'bg-emerald-500'
    };
  }, [interrupterLogs, energyLevel]);

  const handleAdd = () => {
    if (!newName.trim() || !newTrigger.trim()) return;
    const protocolList = newProtocol.split('\n').filter(p => p.trim() !== '');
    addFailureMode({
      id: Date.now().toString(),
      name: newName,
      trigger: newTrigger,
      protocol: protocolList.length > 0 ? protocolList : ['Stop', 'Breathe', 'Reset']
    });
    setNewName('');
    setNewTrigger('');
    setNewProtocol('');
    setIsAdding(false);
  };

  const startEditing = (mode: FailureMode) => {
    setEditingId(mode.id);
    setEditName(mode.name);
    setEditTrigger(mode.trigger);
    setEditProtocol(mode.protocol.join('\n'));
  };

  const saveEdit = () => {
    if (editingId) {
        const protocolList = editProtocol.split('\n').filter(p => p.trim() !== '');
        updateFailureMode(editingId, {
            name: editName,
            trigger: editTrigger,
            protocol: protocolList.length > 0 ? protocolList : ['Stop', 'Breathe', 'Reset']
        });
        setEditingId(null);
    }
  };

  const cancelEdit = () => {
      setEditingId(null);
  };

  const handleReportBreach = (modeName: string) => {
    addInterrupterLog({
      id: Date.now().toString(),
      timestamp: Date.now(),
      urge: modeName,
      intensity: 10, // Max intensity for manual breach report
      success: false
    });
  };

  return (
    <div className="p-5 pt-10 space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Defense</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Countermeasures & Interception</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`p-3 rounded-full transition-all active:scale-90 shadow-lg ${isAdding ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-red-600 text-white hover:bg-red-500'}`}
        >
          {isAdding ? <X size={24} /> : <Plus size={24} />}
        </button>
      </header>

      {/* Risk Radar HUD */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-xl backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 dark:bg-white/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
        
        <div className="flex justify-between items-end mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={18} className="text-slate-400" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">System Threat Level</span>
            </div>
            <div className={`text-4xl font-black tracking-tight ${riskMetrics.color} drop-shadow-sm`}>
              {riskMetrics.score}%
            </div>
          </div>
          <div className={`text-xs font-black tracking-widest px-3 py-1.5 rounded-lg border border-transparent dark:border-white/5 ${riskMetrics.score > 70 ? 'bg-rose-100 text-rose-600 dark:bg-black/40 dark:text-rose-500' : riskMetrics.score > 40 ? 'bg-amber-100 text-amber-600 dark:bg-black/40 dark:text-amber-500' : 'bg-emerald-100 text-emerald-600 dark:bg-black/40 dark:text-emerald-500'}`}>
            {riskMetrics.label}
          </div>
        </div>

        <div className="h-3 bg-slate-100 dark:bg-black/40 rounded-full overflow-hidden border border-slate-200 dark:border-white/5 relative z-10">
          <div 
            className={`h-full transition-all duration-1000 ${riskMetrics.barColor} shadow-[0_0_15px_rgba(255,255,255,0.3)]`}
            style={{ width: `${riskMetrics.score}%` }}
          ></div>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white dark:bg-slate-900/80 border border-red-500/30 rounded-3xl p-6 animate-in fade-in zoom-in duration-200 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4 text-red-500 dark:text-red-400">
            <ShieldAlert size={20} />
            <h3 className="text-sm font-black uppercase">New Protocol</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Failure Mode Name</label>
              <input 
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Doomscroll Spiral"
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-white text-sm focus:border-red-500 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Trigger Signal</label>
              <input 
                value={newTrigger}
                onChange={e => setNewTrigger(e.target.value)}
                placeholder="e.g. Opening phone without intent"
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-white text-sm focus:border-red-500 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Emergency Steps</label>
              <textarea 
                value={newProtocol}
                onChange={e => setNewProtocol(e.target.value)}
                placeholder="Drop phone immediately&#10;Drink water"
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-white text-sm focus:border-red-500 outline-none h-24 resize-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
            <button 
              onClick={handleAdd}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-red-500/30 dark:shadow-red-900/30 transition-transform active:scale-95"
            >
              Initialize Defense
            </button>
          </div>
        </div>
      )}

      {/* Active Protocols */}
      <section className="space-y-4">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Active Protocols</h2>
        
        <div className="space-y-4">
          {failureModes.length === 0 && !isAdding && (
             <div className="text-center py-10 opacity-50 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl">
                <p className="text-slate-500 font-bold">No defenses configured.</p>
             </div>
          )}
          
          {failureModes.map(mode => {
            const isEditing = editingId === mode.id;

            if (isEditing) {
                return (
                    <div key={mode.id} className="bg-white dark:bg-slate-900/80 border border-red-500/30 rounded-3xl p-6 animate-in fade-in relative shadow-xl">
                        <div className="flex items-center gap-2 mb-4 text-red-500 dark:text-red-400">
                            <Pencil size={20} />
                            <h3 className="text-sm font-black uppercase">Edit Protocol</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Failure Mode Name</label>
                                <input 
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-white text-sm focus:border-red-500 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Trigger Signal</label>
                                <input 
                                    value={editTrigger}
                                    onChange={e => setEditTrigger(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-white text-sm focus:border-red-500 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Emergency Steps</label>
                                <textarea 
                                    value={editProtocol}
                                    onChange={e => setEditProtocol(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-slate-900 dark:text-white text-sm focus:border-red-500 outline-none h-24 resize-none transition-colors"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={saveEdit}
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
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

            return (
                <div key={mode.id} className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-200 dark:border-white/5 relative group hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm">
                    <div className="absolute top-5 right-5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => startEditing(mode)}
                            className="text-slate-400 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 p-2 transition-colors"
                        >
                            <Pencil size={18} />
                        </button>
                        <button 
                            onClick={() => deleteFailureMode(mode.id)}
                            className="text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-2 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                
                    <div className="flex items-start gap-4 mb-5">
                        <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-red-100 dark:border-red-500/10">
                        <Skull size={24} className="text-red-500 dark:text-red-400" />
                        </div>
                        <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{mode.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1 text-slate-500 dark:text-slate-400">
                            <Zap size={12} className="text-amber-500" />
                            <span className="text-xs font-bold uppercase">Trigger: {mode.trigger}</span>
                        </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-black/30 p-5 rounded-2xl border border-slate-200 dark:border-white/5">
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-tighter mb-3">Protocol</div>
                        <ul className="space-y-3">
                        {mode.protocol.map((step, i) => (
                            <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-3">
                            <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">
                                {i+1}
                            </div>
                            <span className="font-medium">{step}</span>
                            </li>
                        ))}
                        </ul>
                    </div>

                    <button 
                        onClick={() => handleReportBreach(mode.name)}
                        className="w-full mt-4 py-3 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-100 dark:border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold transition-all active:scale-95 group/btn"
                    >
                        <AlertTriangle size={16} className="group-hover/btn:scale-110 transition-transform" />
                        REPORT BREACH
                    </button>
                </div>
            );
          })}
        </div>
      </section>

      {/* Interception Log */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Recent Activity</h2>
          {interrupterLogs.length > 0 && (
            <button 
              onClick={clearInterrupterLogs}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white uppercase tracking-wider transition-colors"
            >
              Clear Log
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {interrupterLogs.length === 0 ? (
             <div className="bg-white dark:bg-white/5 p-6 rounded-2xl text-center border border-slate-200 dark:border-white/5">
               <ShieldCheck className="mx-auto text-emerald-500/30 mb-2" size={24} />
               <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Secure. No incidents.</p>
            </div>
          ) : (
            interrupterLogs.slice(0, 5).map(log => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 transition-all hover:bg-slate-50 dark:hover:bg-white/10 group shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${log.success ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-200">{log.urge}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Level {log.intensity}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded-lg ${log.success ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10' : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/10'}`}>
                    {log.success ? 'SECURED' : 'BREACH'}
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteInterrupterLog(log.id); }}
                    className="text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default DefenseView;