import React, { useState, useEffect, useMemo } from 'react';
import { Check, TrendingUp, AlertCircle, BatteryLow, BatteryMedium, BatteryFull, RotateCw, Zap, ShieldAlert, Fingerprint, ArrowUpRight, Flame, Sparkles, Bookmark, Lightbulb } from 'lucide-react';
import { useStore } from '../store';
import { Identity, SparkResult } from '../types';
import { generateSpark } from '../services/openRouterService';

const HomeView = () => {
  const { dailyStack, toggleDailyItem, swapItemOption, identities, interrupterLogs, energyLevel, setEnergyLevel, updateIdentityVote, refreshDailyStack, addSavedItem } = useStore();
  const [activeIdIndex, setActiveIdIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [logWinState, setLogWinState] = useState<'idle' | 'logged'>('idle');
  
  // Spark State
  const [spark, setSpark] = useState<SparkResult | null>(null);
  const [loadingSpark, setLoadingSpark] = useState(false);
  const [savedSpark, setSavedSpark] = useState(false);

  // Cycle through identities for the Header Ticker with fade out/in effect
  useEffect(() => {
    if (identities.length === 0) return;
    const interval = setInterval(() => {
      setIsFading(true); // Start Fade Out
      setTimeout(() => {
        setActiveIdIndex(prev => (prev + 1) % identities.length);
        setIsFading(false); // Start Fade In
      }, 500); // Wait for fade out to complete
    }, 6000);
    return () => clearInterval(interval);
  }, [identities.length]);

  const currentIdentity = identities.length > 0 ? identities[activeIdIndex] : null;

  // Metrics
  const completedCount = dailyStack.filter(i => i.completed).length;
  const progress = dailyStack.length > 0 ? (completedCount / dailyStack.length) * 100 : 0;
  
  // Smart Alerts Logic
  const decayAlerts = identities.filter(i => {
    if (!i.lastVoteDate) return false;
    const hoursSince = (Date.now() - i.lastVoteDate) / (1000 * 60 * 60);
    return hoursSince > 48; // Alert if neglected for 2 days
  });

  const recentFailures = interrupterLogs.slice(0, 5).filter(l => !l.success).length;
  const threatLevel = recentFailures > 2 ? 'Critical' : recentFailures > 0 ? 'Elevated' : 'Stable';
  
  // Cycle Energy Level
  const handleEnergyClick = () => {
    const levels: ('Low' | 'Moderate' | 'High')[] = ['Low', 'Moderate', 'High'];
    const next = levels[(levels.indexOf(energyLevel) + 1) % 3];
    setEnergyLevel(next);
    refreshDailyStack();
  };

  const handleQuickWin = (id: string) => {
    updateIdentityVote(id, true);
  };

  const handleManualWin = () => {
    const idToCredit = identities[0];
    if (idToCredit) {
        updateIdentityVote(idToCredit.id, true);
        setLogWinState('logged');
        setTimeout(() => setLogWinState('idle'), 1500);
    }
  };

  const handleIgnite = async () => {
    setLoadingSpark(true);
    setSpark(null);
    setSavedSpark(false);
    try {
        const result = await generateSpark();
        setSpark(result);
    } catch(e) { console.error(e); }
    setLoadingSpark(false);
  };

  const handleSaveSpark = () => {
      if (spark) {
          addSavedItem({
              type: 'spark',
              title: spark.title,
              data: spark
          });
          setSavedSpark(true);
      }
  };

  return (
    <div className="flex flex-col min-h-full pb-24">
      
      {/* --- 1. NORTH STAR HEADER (Restored & Enhanced) --- */}
      <div className="relative bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 p-6 pb-8 shadow-sm dark:shadow-2xl overflow-hidden group transition-all duration-500 ease-in-out min-h-[190px] flex flex-col">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${threatLevel === 'Critical' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Active</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</div>
            </div>
            
            {currentIdentity ? (
                <div 
                  className={`flex-1 flex flex-col justify-center transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
                >
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-3">
                        "{currentIdentity.statement}"
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                           <Fingerprint size={12} className="text-purple-500 dark:text-purple-400" />
                           <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{currentIdentity.strength}% Strength</span>
                        </div>
                        <button 
                            onClick={() => handleQuickWin(currentIdentity.id)}
                            className="text-[10px] bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-lg uppercase font-black tracking-wider transition-colors flex items-center gap-1"
                        >
                            <Zap size={10} /> Boost Now
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-slate-500 italic text-sm flex-1 flex items-center">Initialize identities to calibrate system.</div>
            )}
        </div>
        
        {/* Progress Bar anchored to bottom of header */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
            <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* --- 2. SYSTEM VITALS HUD --- */}
        <div className="grid grid-cols-2 gap-3">
            {/* Energy Controller */}
            <button 
                onClick={handleEnergyClick}
                className="relative bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between overflow-hidden group hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.98] shadow-sm"
            >
                <div className="absolute left-0 top-0 w-1 h-full bg-blue-500"></div>
                <div>
                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Energy State</div>
                    <div className={`text-lg font-bold ${energyLevel === 'High' ? 'text-blue-500 dark:text-blue-400' : energyLevel === 'Moderate' ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400'}`}>
                        {energyLevel}
                    </div>
                </div>
                <div className="text-slate-400 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                     {energyLevel === 'High' ? <BatteryFull size={24}/> : energyLevel === 'Moderate' ? <BatteryMedium size={24}/> : <BatteryLow size={24}/>}
                </div>
            </button>

            {/* Defense Status */}
            <div className="relative bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between overflow-hidden shadow-sm">
                <div className={`absolute left-0 top-0 w-1 h-full ${threatLevel === 'Critical' ? 'bg-red-500' : threatLevel === 'Elevated' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                <div>
                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Defense Grid</div>
                    <div className={`text-lg font-bold ${threatLevel === 'Critical' ? 'text-red-500 dark:text-red-400' : threatLevel === 'Elevated' ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                        {threatLevel}
                    </div>
                </div>
                <ShieldAlert size={24} className={threatLevel === 'Critical' ? 'text-red-500 animate-pulse' : 'text-slate-400 dark:text-slate-600'} />
            </div>
        </div>

        {/* --- 3. SMART ALERTS --- */}
        {decayAlerts.length > 0 && (
             <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                    <AlertCircle size={12} className="text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Attention Required</span>
                </div>
                {decayAlerts.map(identity => (
                    <div key={identity.id} className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl flex items-center justify-between shadow-sm">
                        <div>
                            <div className="text-xs font-bold text-amber-700 dark:text-amber-200">Identity Decay Detected</div>
                            <div className="text-[10px] text-amber-600 dark:text-amber-500/80 truncate max-w-[200px]">{identity.statement}</div>
                        </div>
                        <button 
                            onClick={() => updateIdentityVote(identity.id, true)}
                            className="bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 p-2 rounded-lg transition-colors"
                        >
                            <Zap size={16} fill="currentColor" />
                        </button>
                    </div>
                ))}
             </div>
        )}

        {/* --- 4. ACTION PROTOCOL (The Task Stack) --- */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-slate-400" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Action Protocol</h2>
                </div>
                <button onClick={refreshDailyStack} className="text-[10px] text-slate-500 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                    <RotateCw size={10} /> Refresh
                </button>
            </div>
            
            <div className="space-y-3">
            {dailyStack.map((item, idx) => (
                <ProtocolCard 
                key={item.id}
                item={item}
                onToggle={() => toggleDailyItem(item.id)}
                onSwap={() => swapItemOption(item.id)}
                delay={idx * 100}
                />
            ))}
            {dailyStack.length === 0 && (
                <div onClick={refreshDailyStack} className="cursor-pointer text-center py-10 opacity-50 text-xs font-bold text-slate-500 uppercase border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-all">
                    Protocol Clear • Tap to Regenerate
                </div>
            )}
            </div>
        </div>

        {/* --- 5. MICRO-WINS (Manual Entry) --- */}
        <div className="pt-2">
             <div className="bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white">Unplanned Victory?</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Log a win that wasn't on the protocol.</div>
                </div>
                <button 
                    onClick={handleManualWin}
                    disabled={identities.length === 0}
                    className={`
                        px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 active:scale-95 transition-all duration-300
                        ${logWinState === 'logged' 
                            ? 'bg-emerald-600 text-white shadow-emerald-500/40 scale-105' 
                            : 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-emerald-500/20 dark:shadow-emerald-900/20'
                        }
                        ${identities.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {logWinState === 'logged' ? <Check size={14} strokeWidth={3} /> : <Flame size={14} fill="currentColor" />} 
                    {logWinState === 'logged' ? 'Logged!' : 'Log Win'}
                </button>
             </div>
        </div>

        {/* --- 6. NEURAL SPARK (Moved here) --- */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="bg-white dark:bg-slate-900 rounded-[15px] p-4 relative overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400">
                        <Sparkles size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">Neural Spark</span>
                    </div>
                    {spark && (
                        <button 
                            onClick={handleSaveSpark}
                            disabled={savedSpark}
                            className={`p-1.5 rounded-lg transition-colors ${savedSpark ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                        >
                             {savedSpark ? <Check size={16} /> : <Bookmark size={16} />}
                        </button>
                    )}
                </div>

                {loadingSpark ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-3 animate-pulse">
                         <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                         <div className="text-xs font-bold text-indigo-500">Accessing Wisdom...</div>
                    </div>
                ) : spark ? (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <div className="text-[10px] font-bold text-purple-500 dark:text-purple-400 uppercase mb-1">{spark.category}</div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-2">{spark.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{spark.content}</p>
                        <button 
                            onClick={handleIgnite}
                            className="w-full py-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                        >
                            Ignite Another
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-2">
                         <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 font-medium">Need wisdom, advice, or a new mental model?</p>
                         <button 
                             onClick={handleIgnite}
                             className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition-transform active:scale-95 flex items-center justify-center gap-2"
                         >
                             <Lightbulb size={16} /> Amaze Me
                         </button>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

const ProtocolCard = ({ item, onToggle, onSwap, delay }: any) => {
  // Styles based on type
  const getStyles = (type: string) => {
    switch (type) {
      case 'identity': return {
        badge: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300',
        border: 'group-hover:border-purple-300 dark:group-hover:border-purple-500/30',
        activeBorder: 'border-purple-500',
        bg: 'hover:bg-purple-50 dark:hover:bg-purple-500/5'
      };
      case 'trajectory': return {
        badge: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300',
        border: 'group-hover:border-blue-300 dark:group-hover:border-blue-500/30',
        activeBorder: 'border-blue-500',
        bg: 'hover:bg-blue-50 dark:hover:bg-blue-500/5'
      };
      case 'portfolio': return {
        badge: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300',
        border: 'group-hover:border-emerald-300 dark:group-hover:border-emerald-500/30',
        activeBorder: 'border-emerald-500',
        bg: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/5'
      };
      case 'prevention': return {
        badge: 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300',
        border: 'group-hover:border-rose-300 dark:group-hover:border-rose-500/30',
        activeBorder: 'border-rose-500',
        bg: 'hover:bg-rose-50 dark:hover:bg-rose-500/5'
      };
      default: return {
        badge: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
        border: 'group-hover:border-slate-400 dark:group-hover:border-slate-500',
        activeBorder: 'border-slate-500',
        bg: 'hover:bg-slate-100 dark:hover:bg-slate-800'
      };
    }
  };

  const styles = getStyles(item.type);

  return (
    <div 
      onClick={onToggle} // Added click handler to main container
      className={`
        relative overflow-hidden rounded-2xl border transition-all duration-300 group cursor-pointer
        ${item.completed 
          ? 'bg-slate-100 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-50' 
          : `bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/10 ${styles.border} ${styles.bg} shadow-sm`
        }
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-4 flex items-start gap-4 relative z-10">
        {/* Checkbox */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={`
            mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300
            ${item.completed 
              ? 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-700 scale-100' 
              : `border-slate-300 dark:border-slate-600 ${styles.activeBorder} scale-95 group-hover:scale-105`
            }
          `}
        >
          {item.completed && <Check size={14} className="text-white" strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
           <div className="flex items-center gap-2 mb-1.5">
             <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${styles.badge}`}>
                {item.type}
              </span>
           </div>
          <h3 className={`text-sm font-bold leading-tight transition-all ${item.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
            {item.title}
          </h3>
          <p className={`text-xs mt-1 leading-snug font-medium ${item.completed ? 'text-slate-400 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>
            {item.subtitle}
          </p>
        </div>

        {/* Swap Button */}
        {item.availableOptions && item.availableOptions.length > 1 && !item.completed && (
          <button 
            onClick={(e) => { e.stopPropagation(); onSwap(); }}
            className="self-center p-2 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-white transition-colors hover:bg-slate-100 dark:hover:bg-white/10 rounded-full active:rotate-180 duration-500"
            title="Swap Protocol"
          >
            <RotateCw size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default HomeView;