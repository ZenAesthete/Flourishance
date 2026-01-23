import React, { useState } from 'react';
import { useStore } from '../store';
import { Tab } from '../types';
import { Moon, Sun, Trash, Database, Info, ClipboardList, Library, ChevronRight, AlertTriangle } from 'lucide-react';

interface SettingsViewProps {
  onNavigate: (tab: Tab) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const { theme, toggleTheme, identities, rules, failureModes } = useStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
     localStorage.clear();
     window.location.reload();
  };

  return (
    <div className="p-5 pt-10 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <header className="mb-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">System Configuration</p>
      </header>

      <div className="space-y-6">
        
        {/* System Tools */}
        <section>
             <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">System Tools</h2>
             <div className="space-y-3">
                <ToolCard 
                    icon={<ClipboardList size={20} />}
                    label="Weekly Review"
                    description="System Audit & Calibration"
                    color="text-indigo-500"
                    onClick={() => onNavigate('review')}
                />
                <ToolCard 
                    icon={<Library size={20} />}
                    label="Library"
                    description="Strategic Archives & Intelligence"
                    color="text-cyan-500"
                    onClick={() => onNavigate('library')}
                />
             </div>
        </section>

        {/* Appearance */}
        <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        {theme === 'dark' ? <Moon size={20} className="text-purple-500"/> : <Sun size={20} className="text-amber-500"/>}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">Display Mode</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Current: {theme === 'dark' ? 'Dark' : 'Light'}</div>
                    </div>
                </div>
                <button 
                    onClick={toggleTheme}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${theme === 'dark' ? 'bg-purple-600' : 'bg-slate-300'}`}
                >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        </section>

        {/* Data */}
        <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Data Management</h2>
            
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Identities: {identities.length} • Rules: {rules.length} • Defense: {failureModes.length}
                    </div>
                    <Database size={16} className="text-slate-400" />
                </div>

                <button 
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full py-3.5 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 font-bold text-sm rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                >
                    <Trash size={16} /> Reset All Data
                </button>
             </div>
        </section>

         <section className="text-center py-6">
             <div className="inline-flex items-center gap-2 text-xs text-slate-400 dark:text-slate-600 font-medium">
                 <Info size={12} />
                 <span>SelfOS v1.2 • Local Storage Only</span>
             </div>
         </section>
      </div>

      {/* Warning Popup */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-4">
            <div className="flex flex-col items-center text-center gap-3">
               <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                 <AlertTriangle size={24} />
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Factory Reset?</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                 This will permanently wipe all identities, logs, rules, and settings from your device. This action cannot be undone.
               </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                 onClick={() => setShowResetConfirm(false)}
                 className="py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                 onClick={handleReset}
                 className="py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 transition-colors flex items-center justify-center gap-2"
              >
                <Trash size={16} /> Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ToolCard = ({ icon, label, description, color, onClick }: any) => (
    <button 
        onClick={onClick}
        className="w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.99] shadow-sm"
    >
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center ${color} border border-slate-100 dark:border-transparent`}>
                {icon}
            </div>
            <div className="text-left">
                <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{label}</div>
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{description}</div>
            </div>
        </div>
        <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400" />
    </button>
);

export default SettingsView;