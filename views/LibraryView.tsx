import React, { useState } from 'react';
import { useStore } from '../store';
import { SavedItem, SavedItemType, Tab } from '../types';
import { Trash2, Map, Search, BrainCircuit, Activity, FileText, ChevronDown, ChevronRight, Calendar, Sparkles } from 'lucide-react';

const LibraryView = ({ onBack }: { onBack: () => void }) => {
  const { savedItems, deleteSavedItem } = useStore();
  const [activeCategory, setActiveCategory] = useState<SavedItemType | 'all'>('all');

  const filteredItems = activeCategory === 'all' 
    ? savedItems 
    : savedItems.filter(i => i.type === activeCategory);

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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-none">Library</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Strategic Archives & Intelligence</p>
         </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <FilterBtn active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} label="All" />
        <FilterBtn active={activeCategory === 'spark'} onClick={() => setActiveCategory('spark')} label="Sparks" />
        <FilterBtn active={activeCategory === 'decision'} onClick={() => setActiveCategory('decision')} label="Decisions" />
        <FilterBtn active={activeCategory === 'roadmap'} onClick={() => setActiveCategory('roadmap')} label="Roadmaps" />
        <FilterBtn active={activeCategory === 'simulation'} onClick={() => setActiveCategory('simulation')} label="Futures" />
        <FilterBtn active={activeCategory === 'deepdive'} onClick={() => setActiveCategory('deepdive')} label="Deep Dives" />
        <FilterBtn active={activeCategory === 'briefing'} onClick={() => setActiveCategory('briefing')} label="Briefs" />
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredItems.length === 0 && (
            <div className="text-center py-20 opacity-60 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl">
                <p className="text-slate-500 font-bold">Library is empty.</p>
                <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">Save AI insights to build your knowledge base.</p>
            </div>
        )}
        
        {filteredItems.map(item => (
            <SavedItemCard key={item.id} item={item} onDelete={deleteSavedItem} />
        ))}
      </div>
    </div>
  );
};

const FilterBtn = ({ active, onClick, label }: any) => (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
        active 
          ? 'bg-slate-800 dark:bg-slate-700 text-white border-transparent shadow-md' 
          : 'bg-white dark:bg-slate-900/50 text-slate-600 dark:text-slate-500 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5'
      }`}
    >
      {label}
    </button>
);

const SavedItemCard = ({ item, onDelete }: { item: SavedItem, onDelete: (id: string) => void }) => {
    const [expanded, setExpanded] = useState(false);

    const getIcon = () => {
        switch(item.type) {
            case 'decision': return <BrainCircuit size={16} className="text-indigo-500 dark:text-indigo-400" />;
            case 'roadmap': return <Map size={16} className="text-cyan-600 dark:text-cyan-400" />;
            case 'simulation': return <Activity size={16} className="text-purple-500 dark:text-purple-400" />;
            case 'deepdive': return <Search size={16} className="text-rose-500 dark:text-rose-400" />;
            case 'briefing': return <FileText size={16} className="text-emerald-500 dark:text-emerald-400" />;
            case 'spark': return <Sparkles size={16} className="text-amber-500 dark:text-amber-400" />;
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors shadow-sm">
            <div 
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5`}>
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{item.type}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-600 flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">{item.title}</h3>
                </div>
                <div className="text-slate-400 dark:text-slate-500">
                    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
            </div>

            {expanded && (
                <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2">
                    <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 text-sm text-slate-700 dark:text-slate-300 space-y-3">
                        {renderContent(item)}
                    </div>
                    <div className="mt-3 flex justify-end">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                            className="text-xs font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const renderContent = (item: SavedItem) => {
    const data = item.data as any;
    
    switch(item.type) {
        case 'decision':
            return (
                <>
                    <div><span className="text-indigo-600 dark:text-indigo-400 font-bold">Analysis:</span> {data.analysis}</div>
                    <div><span className="text-emerald-600 dark:text-emerald-400 font-bold">Verdict:</span> {data.verdict}</div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                        {data.actionPlan?.map((step: string, i: number) => <li key={i}>{step}</li>)}
                    </ul>
                </>
            );
        case 'roadmap':
             return (
                <>
                   <div className="font-bold text-slate-900 dark:text-white mb-2">{data.goal}</div>
                   <div className="mb-2"><span className="text-cyan-600 dark:text-cyan-400 font-bold">Next Action:</span> {data.nextAction}</div>
                   <div className="space-y-3 pl-2 border-l border-slate-300 dark:border-slate-700">
                       {data.phases?.map((phase: any, i: number) => (
                           <div key={i}>
                               <div className="text-xs font-bold text-slate-500 uppercase">{phase.phaseName}</div>
                               <div className="text-xs text-slate-600 dark:text-slate-400">{phase.steps?.join(', ')}</div>
                           </div>
                       ))}
                   </div>
                </>
             );
        case 'simulation':
             return (
                 <div className="grid grid-cols-1 gap-2">
                     <div className="p-2 bg-white dark:bg-white/5 rounded border border-slate-200 dark:border-transparent"><span className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase block">24 Hours</span>{data.oneDay}</div>
                     <div className="p-2 bg-white dark:bg-white/5 rounded border border-slate-200 dark:border-transparent"><span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase block">1 Week</span>{data.oneWeek}</div>
                     <div className="p-2 bg-white dark:bg-white/5 rounded border border-slate-200 dark:border-transparent"><span className="text-purple-600 dark:text-purple-400 font-bold text-xs uppercase block">6 Months</span>{data.sixMonths}</div>
                 </div>
             );
        case 'deepdive':
            return (
                <>
                   <div className="font-bold text-slate-900 dark:text-white mb-2">{data.title}</div>
                   <div className="text-xs text-slate-500 dark:text-slate-400 italic mb-3">{data.summary}</div>
                   <div className="space-y-2">
                       {data.items?.map((point: any, i: number) => (
                           <div key={i} className="flex gap-2 text-xs">
                               <span className="font-bold text-slate-500 shrink-0">{point.label}:</span>
                               <span>{point.content}</span>
                           </div>
                       ))}
                   </div>
                </>
            );
        case 'briefing':
             return (
                 <div className="space-y-2">
                     <div className="flex justify-between">
                         <span className="text-slate-500 dark:text-slate-400">Score</span>
                         <span className="font-bold text-slate-900 dark:text-white">{data.governanceScore}</span>
                     </div>
                     <div><span className="text-rose-500 dark:text-rose-400 font-bold">Leak:</span> {data.leakAnalysis}</div>
                     <div><span className="text-blue-600 dark:text-blue-400 font-bold">Focus:</span> {data.focusIdentity}</div>
                     <div><span className="text-emerald-600 dark:text-emerald-400 font-bold">Tactic:</span> {data.tacticalAdjustment}</div>
                 </div>
             );
        case 'spark':
            return (
                <>
                    <div className="text-[10px] font-black uppercase text-purple-500 dark:text-purple-400 mb-1">{data.category}</div>
                    <div className="font-bold text-slate-900 dark:text-white mb-2">{data.title}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{data.content}</div>
                </>
            );
        default: return <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
    }
};

export default LibraryView;