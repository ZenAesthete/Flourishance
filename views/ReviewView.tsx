import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  ClipboardCheck, 
  BarChart3, 
  Sparkles, 
  RefreshCw, 
  ArrowRight, 
  Activity, 
  Target,
  AlertTriangle,
  Lightbulb,
  Bookmark,
  CheckSquare,
  ChevronRight
} from 'lucide-react';
import { generateWeeklyBriefing } from '../services/openRouterService';
import { WeeklyBriefing, Tab } from '../types';

const ReviewView = ({ onBack }: { onBack: () => void }) => {
  const { identities, portfolio, interrupterLogs, refreshDailyStack, addSavedItem } = useStore();
  const [isAuditing, setIsAuditing] = useState(false);
  const [briefing, setBriefing] = useState<WeeklyBriefing | null>(null);
  const [saved, setSaved] = useState(false);

  const runAudit = async () => {
    setIsAuditing(true);
    setSaved(false);
    try {
      const result = await generateWeeklyBriefing(identities, portfolio, interrupterLogs);
      setBriefing(result);
    } catch (e) {
      console.error(e);
    }
    setIsAuditing(false);
  };

  const handleSave = () => {
    if (briefing) {
        addSavedItem({
            type: 'briefing',
            title: `Weekly Briefing: ${new Date().toLocaleDateString()}`,
            data: briefing
        });
        setSaved(true);
    }
  };

  const weakestIdentity = [...identities].sort((a, b) => a.strength - b.strength)[0];
  const lowestPortfolio = [...portfolio].sort((a, b) => a.investment - b.investment)[0];
  const totalIncidents = interrupterLogs.length;
  const failureRate = totalIncidents === 0 ? 0 : Math.round((interrupterLogs.filter(l => !l.success).length / totalIncidents) * 100);

  return (
    <div className="p-5 pt-8 space-y-6 animate-in slide-in-from-right-8 duration-300">
      
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-2">
         <button 
           onClick={onBack}
           className="p-2 -ml-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
         >
            <ChevronRight size={24} className="rotate-180" />
         </button>
         <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-none">Weekly Review</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">System Audit & Calibration</p>
         </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-white/5 p-5 rounded-3xl border border-slate-200 dark:border-white/5 backdrop-blur-sm shadow-sm">
          <Activity size={24} className="text-blue-500 dark:text-blue-400 mb-3" />
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Drift Rate</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{failureRate}%</div>
        </div>
        <div className="bg-white dark:bg-white/5 p-5 rounded-3xl border border-slate-200 dark:border-white/5 backdrop-blur-sm shadow-sm">
          <Target size={24} className="text-emerald-500 dark:text-emerald-400 mb-3" />
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Identity ROI</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">High</div>
        </div>
      </div>

      {/* Intelligence Engine */}
      <div className="bg-indigo-50 dark:bg-gradient-to-br dark:from-indigo-900/40 dark:to-slate-900/60 border border-indigo-200 dark:border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">System Intelligence</h2>
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest">AI Diagnostics</p>
            </div>
          </div>

          {!briefing && !isAuditing && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-8 leading-relaxed font-medium opacity-80">
              Run a complete diagnostic of your behavioral data to identify governance leaks and optimization opportunities.
            </p>
          )}

          {isAuditing && (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
                <RefreshCw className="text-indigo-500 dark:text-indigo-400 animate-spin relative z-10" size={40} />
              </div>
              <p className="text-sm text-indigo-600 dark:text-indigo-200 animate-pulse font-bold tracking-wide">ANALYZING PATTERNS...</p>
            </div>
          )}

          {briefing && !isAuditing && (
            <div className="bg-white dark:bg-slate-950/50 p-5 rounded-2xl border border-indigo-100 dark:border-white/5 animate-in fade-in slide-in-from-top-2 shadow-inner mb-6 space-y-5 relative">
              <button 
                onClick={handleSave}
                disabled={saved}
                className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${saved ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-white/5'}`}
             >
                {saved ? <CheckSquare size={16}/> : <Bookmark size={16} />}
             </button>

              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
                 <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Integrity Score</span>
                 <span className={`text-2xl font-black ${briefing.governanceScore > 70 ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`}>{briefing.governanceScore}/100</span>
              </div>
              
              <div>
                 <div className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-2"><AlertTriangle size={12}/> Leak Analysis</div>
                 <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{briefing.leakAnalysis}</p>
              </div>

              <div>
                 <div className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Target size={12}/> Primary Focus</div>
                 <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">Double down on: <strong>{briefing.focusIdentity}</strong></p>
              </div>
              
               <div className="bg-indigo-100 dark:bg-indigo-500/10 p-3 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
                 <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Lightbulb size={12}/> Tactical Shift</div>
                 <p className="text-sm text-indigo-800 dark:text-indigo-100 leading-relaxed font-medium">{briefing.tacticalAdjustment}</p>
              </div>
            </div>
          )}

          <button 
            onClick={runAudit}
            disabled={isAuditing}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/30 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {briefing ? 'Refresh Diagnostics' : 'Run Diagnostics'} <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Critical Rebalancing Needs */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Required Adjustments</h3>
        
        <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-slate-200 dark:border-white/5 flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 border border-purple-200 dark:border-purple-500/10">
            <BarChart3 size={24} />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Focus Area</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">{weakestIdentity?.statement || 'All systems nominal'}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-slate-200 dark:border-white/5 flex items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 border border-orange-200 dark:border-orange-500/10">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Portfolio Deficit</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">{lowestPortfolio?.name || 'Balanced'} ({lowestPortfolio?.investment}%)</div>
          </div>
        </div>
      </section>

      {/* Finalize Button */}
      <div className="pt-4 pb-8">
        <button 
          onClick={() => { refreshDailyStack(); }}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition-transform"
        >
          <ClipboardCheck size={20} /> Commit Calibration
        </button>
        <p className="text-[10px] text-center text-slate-500 dark:text-slate-600 mt-4 uppercase font-bold tracking-widest">
          Refreshes daily action protocol
        </p>
      </div>
    </div>
  );
};

export default ReviewView;