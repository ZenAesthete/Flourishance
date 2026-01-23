import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ArrowRight, CheckCircle2, Wind } from 'lucide-react';
import { useStore } from '../store';

const InterrupterModal = ({ onClose }: { onClose: () => void }) => {
  const { addInterrupterLog } = useStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
  // Box breathing state: 1=Inhale, 2=Hold, 3=Exhale, 4=Hold
  const [breathPhase, setBreathPhase] = useState(1);
  const [cycleCount, setCycleCount] = useState(0);
  const [urge, setUrge] = useState('');

  // Breathing Cycle Timer
  useEffect(() => {
    if (step === 2) {
      const interval = setInterval(() => {
        setBreathPhase(prev => {
          if (prev === 4) {
             setCycleCount(c => c + 1);
             return 1;
          }
          return prev + 1;
        });
      }, 4000); // 4 seconds per phase
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleFinish = (success: boolean) => {
    addInterrupterLog({
      id: Date.now().toString(),
      timestamp: Date.now(),
      urge,
      intensity: 8,
      success
    });
    onClose();
  };

  const getBreathLabel = () => {
    switch(breathPhase) {
        case 1: return "Inhale";
        case 2: return "Hold";
        case 3: return "Exhale";
        case 4: return "Hold";
        default: return "";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 dark:bg-black/95 backdrop-blur-xl p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-sm relative">
        <button onClick={onClose} className="absolute -top-12 right-0 text-white hover:text-slate-300 p-2">
          <X size={24} />
        </button>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col justify-center">
            {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                    <AlertTriangle size={32} className="text-red-500 animate-pulse" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Pattern Interrupt</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Identify the urge to break the loop.</p>
              </div>
              
              <div className="space-y-4">
                <input 
                    type="text" 
                    placeholder="I feel the urge to..." 
                    autoFocus
                    className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white text-lg focus:border-red-500 outline-none transition-colors text-center placeholder:text-slate-400"
                    value={urge}
                    onChange={(e) => setUrge(e.target.value)}
                />
                <button 
                    disabled={!urge}
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30 dark:shadow-red-900/30 transition-transform active:scale-95 uppercase tracking-wider"
                >
                    Disengage
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-4 space-y-8 animate-in zoom-in duration-300">
              <div>
                 <h3 className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-xs mb-1">Physiological Reset</h3>
                 <p className="text-slate-600 dark:text-slate-300 text-sm">Box Breathing Protocol</p>
              </div>
              
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                 {/* Breathing Circle */}
                 <div className={`absolute w-32 h-32 bg-blue-500/20 rounded-full blur-xl transition-transform duration-[4000ms] ease-in-out ${breathPhase === 1 || breathPhase === 2 ? 'scale-150' : 'scale-75'}`}></div>
                 <div className={`absolute w-24 h-24 border-4 border-blue-400 rounded-full transition-all duration-[4000ms] ease-in-out flex items-center justify-center ${breathPhase === 1 || breathPhase === 2 ? 'w-40 h-40 border-blue-300' : 'w-20 h-20 border-blue-600'}`}>
                    <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">{getBreathLabel()}</span>
                 </div>
              </div>

              <div className="space-y-4">
                  <div className="flex justify-center gap-1">
                      {[0,1,2].map(i => (
                          <div key={i} className={`h-1 w-8 rounded-full transition-colors ${i < cycleCount ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                      ))}
                  </div>
                  {cycleCount >= 3 ? (
                    <button onClick={() => setStep(3)} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-blue-900/30 animate-pulse">
                    Urge Subsided
                    </button>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">COMPLETE 3 CYCLES</p>
                  )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="text-center mb-2">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white">Choose Replacement</h2>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold tracking-wide">Select a positive alternative</p>
              </div>
              
              <div className="space-y-3">
                <button onClick={() => setStep(4)} className="w-full p-5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-2xl text-left flex items-center justify-between group transition-all">
                  <div>
                    <div className="font-bold text-emerald-500 dark:text-emerald-400 mb-1">Micro-Proof</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Do 2 minutes of identity work</div>
                  </div>
                  <ArrowRight size={20} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                </button>
                <button onClick={() => setStep(4)} className="w-full p-5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 rounded-2xl text-left flex items-center justify-between group transition-all">
                  <div>
                    <div className="font-bold text-blue-500 dark:text-blue-400 mb-1">Environment Shift</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Stand up, drink water, move room</div>
                  </div>
                  <ArrowRight size={20} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-6 space-y-6 animate-in zoom-in">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                 <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              
              <div>
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Pattern Broken</h2>
                 <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Identity strength preserved.</p>
              </div>
              
              <button onClick={() => handleFinish(true)} className="w-full py-4 bg-slate-800 dark:bg-slate-800 rounded-xl text-white font-bold hover:bg-slate-700 transition-colors">
                Return to Defense
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterrupterModal;