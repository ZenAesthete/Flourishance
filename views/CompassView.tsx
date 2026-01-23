import React, { useState, useMemo } from 'react';
import { Book, PieChart, Telescope, Send, BrainCircuit, Play, Plus, Trash2, Settings2, RefreshCw, X, Map, Search, AlertOctagon, HelpCircle, Save, CheckSquare, Bookmark, CheckCircle2, ChevronRight, Activity, TrendingUp, Target, Lock, Info } from 'lucide-react';
import { useStore } from '../store';
import { resolveDecision, simulateFuture, generateRoadmap, runDeepDiveAnalysis } from '../services/openRouterService';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { DecisionResult, Rule, Roadmap, DeepDiveResult, SimulationResult, PortfolioCategory } from '../types';

// Tools available
type ActiveView = 'dashboard' | 'rules' | 'portfolio' | 'simulator' | 'pathfinder' | 'deepdive' | 'premortem';

const CompassView = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard': return <Dashboard onNavigate={setActiveView} />;
      case 'rules': return <ConstitutionPanel onBack={() => setActiveView('dashboard')} />;
      case 'portfolio': return <PortfolioPanel onBack={() => setActiveView('dashboard')} />;
      case 'simulator': return <SimulatorTool onBack={() => setActiveView('dashboard')} />;
      case 'pathfinder': return <PathfinderTool onBack={() => setActiveView('dashboard')} />;
      case 'deepdive': return <DeepDiveTool mode="5whys" onBack={() => setActiveView('dashboard')} />;
      case 'premortem': return <DeepDiveTool mode="premortem" onBack={() => setActiveView('dashboard')} />;
      default: return <Dashboard onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="pt-8 min-h-full flex flex-col px-4 pb-24">
      {renderContent()}
    </div>
  );
};

// --- Dashboard View (The Launcher) ---

const Dashboard = ({ onNavigate }: { onNavigate: (view: ActiveView) => void }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Compass</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Strategic Governance & Direction</p>
      </header>

      {/* Governance Section */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => onNavigate('rules')}
          className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group shadow-sm"
        >
          <Book size={24} className="text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">Rules</span>
        </button>
        <button 
          onClick={() => onNavigate('portfolio')}
          className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group shadow-sm"
        >
          <PieChart size={24} className="text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">Portfolio</span>
        </button>
      </div>

      {/* Tools List */}
      <div className="space-y-3">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Strategy Tools</h2>
        
        <ToolButton 
          icon={<Telescope size={18} />} 
          label="Trajectory Simulator" 
          description="Predict 2nd order consequences"
          onClick={() => onNavigate('simulator')}
        />
        
        <ToolButton 
          icon={<Map size={18} />} 
          label="Pathfinder" 
          description="High-ROI Roadmap Generator"
          onClick={() => onNavigate('pathfinder')}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onNavigate('deepdive')}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Search size={16} className="text-indigo-500 dark:text-indigo-400" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Deep Dive</span>
          </button>
          
          <button 
            onClick={() => onNavigate('premortem')}
            className="bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 p-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-500/30 transition-colors shadow-sm"
          >
            <AlertOctagon size={16} className="text-rose-500 dark:text-rose-400" />
            <span className="text-sm font-bold text-rose-700 dark:text-white">Pre-Mortem</span>
          </button>
        </div>
      </div>

      {/* Quick Resolver */}
      <div className="pt-4">
        <div className="bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-500/20 p-6 rounded-3xl relative overflow-hidden shadow-sm">
           <div className="flex items-center gap-3 mb-2">
             <BrainCircuit size={20} className="text-indigo-500 dark:text-indigo-400" />
             <h3 className="text-sm font-bold text-slate-800 dark:text-white">Decision Core</h3>
           </div>
           <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
             Quickly resolve a dilemma against your defined principles.
           </p>
           <button 
             onClick={() => onNavigate('rules')} // Directs to Rules view where the resolver lives
             className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
           >
             Open Resolver
           </button>
        </div>
      </div>
    </div>
  );
};

const ToolButton = ({ icon, label, description, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98] shadow-sm"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
        {icon}
      </div>
      <div className="text-left">
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">{label}</div>
        <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{description}</div>
      </div>
    </div>
    <ChevronRight size={18} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400" />
  </button>
);

const HeaderWithBack = ({ title, onBack }: { title: string, onBack: () => void }) => (
  <div className="flex items-center gap-4 mb-6">
    <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
      <ChevronRight size={20} className="rotate-180" />
    </button>
    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
  </div>
);

// --- Sub-Panels (Flattened) ---

const ConstitutionPanel = ({ onBack }: { onBack: () => void }) => {
  const { rules, addRule, updateRule, deleteRule, addSavedItem } = useStore();
  const [dilemma, setDilemma] = useState('');
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newRuleText, setNewRuleText] = useState('');
  const [filter, setFilter] = useState<'all' | 'rule' | 'principle' | 'value'>('all');

  const handleConsult = async () => {
    if (!dilemma.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await resolveDecision(dilemma, rules, ["Long-term thinking", "Discipline"]);
      setResult(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = () => {
    if (result) {
        addSavedItem({ type: 'decision', title: dilemma, data: result });
        setSaved(true);
    }
  };

  const filteredRules = filter === 'all' ? rules : rules.filter(r => r.category === filter);

  const getCategoryStyles = (category: string) => {
    switch(category) {
        case 'rule': return { 
            headerBg: 'bg-rose-100 dark:bg-rose-500/20', 
            headerText: 'text-rose-700 dark:text-rose-300',
            borderColor: 'border-rose-200 dark:border-rose-500/20'
        };
        case 'principle': return { 
            headerBg: 'bg-blue-100 dark:bg-blue-500/20', 
            headerText: 'text-blue-700 dark:text-blue-300',
            borderColor: 'border-blue-200 dark:border-blue-500/20'
        };
        case 'value': return { 
            headerBg: 'bg-amber-100 dark:bg-amber-500/20', 
            headerText: 'text-amber-700 dark:text-amber-300',
            borderColor: 'border-amber-200 dark:border-amber-500/20'
        };
        default: return { 
            headerBg: 'bg-slate-100 dark:bg-slate-800', 
            headerText: 'text-slate-700 dark:text-slate-300',
            borderColor: 'border-slate-200 dark:border-slate-700'
        };
    }
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-300 pb-20">
      <HeaderWithBack title="Rules & Decisions" onBack={onBack} />
      
      {/* Resolver */}
      <div className="mb-8">
        <div className="bg-slate-50 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-500/20 p-5 rounded-3xl relative overflow-hidden shadow-sm">
          {result ? (
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Analysis Complete</span>
                  <button onClick={handleSave} disabled={saved} className={saved ? "text-emerald-500" : "text-slate-400"}>
                    {saved ? <CheckSquare size={18}/> : <Bookmark size={18}/>}
                  </button>
               </div>
               <div className="text-lg font-bold text-slate-900 dark:text-white">{result.verdict}</div>
               <p className="text-sm text-slate-600 dark:text-slate-300 border-l-2 border-indigo-500/30 pl-3">{result.analysis}</p>
               <div className="space-y-2 pt-2">
                  {result.actionPlan.map((a, i) => (
                    <div key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
                      <span className="text-indigo-600 dark:text-indigo-500 font-bold">{i+1}.</span>
                      {a}
                    </div>
                  ))}
               </div>
               <button onClick={() => setResult(null)} className="w-full py-2 mt-2 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-bold uppercase text-slate-500 dark:text-slate-400">New Query</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                 <BrainCircuit size={16} className="text-indigo-500 dark:text-indigo-400" />
                 <span className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Decision Core</span>
              </div>
              <textarea
                className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none h-24 resize-none transition-colors"
                placeholder="Describe the dilemma... (e.g., 'Should I work late on the project or go to the gym as planned?')"
                value={dilemma}
                onChange={(e) => setDilemma(e.target.value)}
              />
              <button 
                onClick={handleConsult}
                disabled={loading || !dilemma}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-indigo-900/20"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <><BrainCircuit size={16} /> Consult</>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-6">
         {/* Filters */}
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['all', 'rule', 'principle', 'value'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors shrink-0 ${filter === f ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10'}`}
              >
                {f}
              </button>
            ))}
         </div>

         {/* Add Rule Input */}
         <div className="flex gap-2">
            <input 
              value={newRuleText}
              onChange={(e) => setNewRuleText(e.target.value)}
              placeholder="Add new rule..."
              className="flex-1 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-colors shadow-sm"
              onKeyDown={(e) => {
                if(e.key === 'Enter' && newRuleText) {
                  addRule({ id: Date.now().toString(), category: filter === 'all' ? 'rule' : filter as any, text: newRuleText });
                  setNewRuleText('');
                }
              }}
            />
            <button 
                onClick={() => { if(newRuleText) { addRule({ id: Date.now().toString(), category: filter === 'all' ? 'rule' : filter as any, text: newRuleText }); setNewRuleText(''); }}} 
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-12 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
            >
                <Plus size={20} />
            </button>
         </div>

         {/* Rules Cards */}
         <div className="space-y-3">
            {filteredRules.length === 0 && (
                <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
                    No items found.
                </div>
            )}
            {filteredRules.map(r => {
              const styles = getCategoryStyles(r.category);
              return (
                <div key={r.id} className={`bg-white dark:bg-slate-900/40 rounded-2xl border ${styles.borderColor} overflow-hidden group shadow-sm flex flex-col transition-all hover:shadow-md`}>
                   {/* Header */}
                   <div className={`px-4 py-2.5 flex justify-between items-center ${styles.headerBg}`}>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${styles.headerText}`}>{r.category}</span>
                      <button onClick={() => deleteRule(r.id)} className={`${styles.headerText} opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/5 rounded`}>
                        <Trash2 size={14} />
                      </button>
                   </div>
                   {/* Body */}
                   <div className="p-4">
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{r.text}</p>
                   </div>
                </div>
              );
            })}
         </div>
      </div>
    </div>
  );
};

// --- Portfolio Components ---

const PortfolioPanel = ({ onBack }: { onBack: () => void }) => {
  const { portfolio, updatePortfolio, theme } = useStore();

  const radarData = portfolio.map(p => ({ subject: p.name, A: p.investment * 10, fullMark: 100 }));

  return (
    <div className="animate-in slide-in-from-right-4 duration-300 pb-20">
      <HeaderWithBack title="Life Portfolio" onBack={onBack} />
      
      {/* Radar Chart Overlay */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl p-4 shadow-sm mb-6">
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke={theme === 'dark' ? "#334155" : "#e2e8f0"} strokeOpacity={0.5} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 9, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Balance" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.2} />
            </RadarChart>
            </ResponsiveContainer>
        </div>
        <div className="text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">Resource Allocation Shape</p>
        </div>
      </div>

      {/* Portfolio Cards */}
      <div className="space-y-4">
        {portfolio.map(p => (
           <PortfolioItemCard key={p.id} category={p} onUpdate={updatePortfolio} />
        ))}
      </div>
    </div>
  );
};

const PortfolioItemCard = ({ category, onUpdate }: { category: PortfolioCategory, onUpdate: any }) => {
    // Algorithmic status determination based on Impact, Control, and Investment
    const getStatus = (c: PortfolioCategory) => {
        // High Impact (Weight), Low Investment = Neglect
        if (c.weight >= 8 && c.investment <= 3) return { label: 'CRITICAL NEGLECT', color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' };
        
        // High Impact, High Control, High Investment = Optimization
        if (c.weight >= 7 && c.controllability >= 7 && c.investment >= 7) return { label: 'HIGH LEVERAGE', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' };

        // Low Control, High Investment = Stoic Trap
        if (c.controllability <= 3 && c.investment >= 7) return { label: 'STOIC TRAP', color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' };

        // Low Impact, High Investment = Waste
        if (c.weight <= 4 && c.investment >= 7) return { label: 'OVER-INVESTED', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' };

        return { label: 'STABLE', color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' };
    };

    const status = getStatus(category);

    return (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{category.name}</h3>
                    {category.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug max-w-[90%]">
                            {category.description}
                        </p>
                    )}
                </div>
                <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                    {status.label}
                </div>
            </div>

            <div className="space-y-5 mt-4">
                {/* 1. IMPACT (Weight) */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Target size={14} className="text-purple-500" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">IMPACT / IMPORTANCE</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">{category.weight}/10</span>
                    </div>
                    <input 
                        type="range" min="0" max="10" 
                        value={category.weight}
                        onChange={(e) => onUpdate(category.id, { weight: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                </div>

                {/* 2. CONTROL (Controllability) */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Lock size={14} className="text-blue-500" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">DEGREE OF CONTROL</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{category.controllability}/10</span>
                    </div>
                    <input 
                        type="range" min="0" max="10" 
                        value={category.controllability}
                        onChange={(e) => onUpdate(category.id, { controllability: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* 3. INVESTMENT (Effort) */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/5">
                    <div className="flex justify-between items-center mt-2">
                         <div className="flex items-center gap-2">
                            <Activity size={14} className="text-emerald-500" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">CURRENT INVESTMENT</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{category.investment}/10</span>
                    </div>
                     <input 
                        type="range" min="0" max="10" 
                        value={category.investment}
                        onChange={(e) => onUpdate(category.id, { investment: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                </div>
            </div>
        </div>
    );
};

// --- Strategy Tools ---

const SimulatorTool = ({ onBack }: { onBack: () => void }) => {
  const { identities, addSavedItem } = useStore();
  const [action, setAction] = useState('');
  const [sim, setSim] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try { const res = await simulateFuture(action, identities); setSim(res); } catch(e){}
    setLoading(false);
  };

  const renderTimePoint = (label: string, content: string, colorClass: string) => (
     <div className={`p-4 bg-white dark:bg-white/5 rounded-2xl border-l-4 shadow-sm ${colorClass}`}>
       <div className={`text-[10px] uppercase font-bold mb-1 opacity-80`}>{label}</div>
       <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{content}</p>
     </div>
  );

  return (
    <div className="animate-in slide-in-from-right-4 duration-300 pb-20">
      <HeaderWithBack title="Trajectory" onBack={onBack} />
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-1 px-1">
            <Telescope size={16} className="text-purple-500 dark:text-purple-400" />
            <span className="text-xs font-black text-purple-500 dark:text-purple-400 uppercase tracking-widest">Causality Engine</span>
        </div>
        <textarea 
          placeholder="What habit are you considering? (e.g., 'Reading 30 mins before bed')" 
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white focus:border-purple-500 outline-none h-32 transition-colors"
          value={action} onChange={e => setAction(e.target.value)}
        />
        <button onClick={run} disabled={loading || !action} className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-purple-500/20">
           {loading ? <RefreshCw className="animate-spin"/> : <Play size={20} fill="currentColor" />} Run Simulation
        </button>
        
        {sim && (
          <div className="space-y-4 pt-4 animate-in fade-in">
             <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-500 uppercase">Projected Timeline</h3>
                <button onClick={() => addSavedItem({type: 'simulation', title: action, data: sim})} className="text-emerald-500"><Bookmark size={18}/></button>
             </div>
             
             <div className="space-y-3 relative">
                 {/* Connector Line */}
                 <div className="absolute left-[1.3rem] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10"></div>
                 
                 {/* Timeline Items */}
                 <TimelineItem label="24 Hours" content={sim.oneDay} color="bg-blue-500" />
                 <TimelineItem label="1 Week" content={sim.oneWeek} color="bg-indigo-500" />
                 <TimelineItem label="1 Month" content={sim.oneMonth} color="bg-violet-500" />
                 <TimelineItem label="3 Months" content={sim.threeMonths} color="bg-purple-500" />
                 <TimelineItem label="6 Months" content={sim.sixMonths} color="bg-fuchsia-500" />
                 <TimelineItem label="1 Year" content={sim.oneYear} color="bg-pink-500" />
                 <TimelineItem label="10 Years" content={sim.tenYears} color="bg-rose-500" />
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TimelineItem = ({ label, content, color }: { label: string, content: string, color: string }) => (
    <div className="flex gap-4">
        <div className={`w-3 h-3 mt-1.5 rounded-full shrink-0 ${color} ring-4 ring-white dark:ring-slate-900`}></div>
        <div className="pb-4">
             <div className={`text-[10px] uppercase font-black ${color.replace('bg-', 'text-')} mb-1`}>{label}</div>
             <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{content}</p>
        </div>
    </div>
);

const PathfinderTool = ({ onBack }: { onBack: () => void }) => {
    const { addSavedItem } = useStore();
    const [goal, setGoal] = useState('');
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [loading, setLoading] = useState(false);
  
    const run = async () => {
      setLoading(true);
      try { const res = await generateRoadmap(goal); setRoadmap(res); } catch(e){}
      setLoading(false);
    };
  
    return (
      <div className="animate-in slide-in-from-right-4 duration-300 pb-20">
        <HeaderWithBack title="Pathfinder" onBack={onBack} />
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1 px-1">
            <Map size={16} className="text-blue-500 dark:text-blue-400" />
            <span className="text-xs font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest">High-ROI Roadmap</span>
          </div>
          <textarea 
            placeholder="Enter a major goal (e.g. 'Senior SE at Google', 'Run a Marathon')" 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white focus:border-blue-500 outline-none h-32 transition-colors"
            value={goal} onChange={e => setGoal(e.target.value)}
          />
          <button onClick={run} disabled={loading || !goal} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20">
             {loading ? <RefreshCw className="animate-spin"/> : <Map size={20} />} Generate Roadmap
          </button>
          
          {roadmap && (
            <div className="space-y-6 pt-4 animate-in fade-in">
               <div className="flex justify-between items-center">
                  <div className="text-xs font-black text-slate-500 uppercase">Strategic Plan</div>
                  <button onClick={() => addSavedItem({type: 'roadmap', title: goal, data: roadmap})} className="text-emerald-500"><Bookmark size={18}/></button>
               </div>
               
               <div className="bg-blue-50 dark:bg-blue-500/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-500/20 flex items-center gap-4 shadow-sm">
                 <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                 <div>
                   <div className="text-[10px] uppercase font-bold text-blue-500 dark:text-blue-300">Immediate Action</div>
                   <div className="text-sm font-bold text-slate-900 dark:text-white">{roadmap.nextAction}</div>
                 </div>
               </div>

               <div className="space-y-6 border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 py-2">
                 {roadmap.phases.map((p, i) => (
                   <div key={i} className="relative">
                     <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-blue-500" />
                     <h4 className="text-sm font-bold text-blue-600 dark:text-blue-200 mb-2">{p.phaseName}</h4>
                     <ul className="space-y-2">
                       {p.steps.map((s, j) => (
                         <li key={j} className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-transparent shadow-sm">{s}</li>
                       ))}
                     </ul>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    );
};

const DeepDiveTool = ({ mode, onBack }: { mode: '5whys' | 'premortem', onBack: () => void }) => {
    const { addSavedItem } = useStore();
    const [topic, setTopic] = useState('');
    const [result, setResult] = useState<DeepDiveResult | null>(null);
    const [loading, setLoading] = useState(false);
  
    const run = async () => {
      setLoading(true);
      try { const res = await runDeepDiveAnalysis(topic, mode); setResult(res); } catch(e){}
      setLoading(false);
    };
  
    return (
      <div className="animate-in slide-in-from-right-4 duration-300 pb-20">
        <HeaderWithBack title={mode === '5whys' ? 'Deep Dive' : 'Pre-Mortem'} onBack={onBack} />
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1 px-1">
             {mode === '5whys' ? <HelpCircle size={16} className="text-indigo-500 dark:text-indigo-400" /> : <AlertOctagon size={16} className="text-rose-500 dark:text-rose-400" />}
             <span className={`text-xs font-black uppercase tracking-widest ${mode === '5whys' ? 'text-indigo-500 dark:text-indigo-400' : 'text-rose-500 dark:text-rose-400'}`}>
                {mode === '5whys' ? 'Root Cause Analysis' : 'Failure Simulation'}
             </span>
          </div>
          <textarea 
            placeholder={mode === '5whys' ? "Describe the problem (e.g. 'I missed 3 workouts')" : "Describe the project (e.g. 'Launch new product')"} 
            className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white outline-none h-32 transition-colors ${mode === '5whys' ? 'focus:border-indigo-500' : 'focus:border-rose-500'}`}
            value={topic} onChange={e => setTopic(e.target.value)}
          />
          <button onClick={run} disabled={loading || !topic} className={`w-full py-4 text-white font-bold rounded-xl flex justify-center items-center gap-2 shadow-lg ${mode === '5whys' ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-rose-600 shadow-rose-500/20'}`}>
             {loading ? <RefreshCw className="animate-spin"/> : <Search size={20} />} Analyze
          </button>
          
          {result && (
            <div className="space-y-4 pt-4 animate-in fade-in">
               <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-500 uppercase">Analysis Results</h3>
                  <button onClick={() => addSavedItem({type: 'deepdive', title: topic, data: result})} className="text-emerald-500"><Bookmark size={18}/></button>
               </div>
               
               <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
                   <h3 className="font-bold text-slate-900 dark:text-white mb-2">{result.title}</h3>
                   <div className="text-sm text-slate-500 dark:text-slate-400 italic mb-4 pb-4 border-b border-slate-100 dark:border-white/5">{result.summary}</div>
                   
                   <div className="space-y-3">
                       {result.items.map((item, i) => (
                           <div key={i} className="flex gap-3">
                               <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0 text-slate-500">{i+1}</div>
                               <div>
                                   <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-0.5">{item.label}</div>
                                   <p className="text-sm text-slate-600 dark:text-slate-400">{item.content}</p>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
            </div>
          )}
        </div>
      </div>
    );
};

export default CompassView;