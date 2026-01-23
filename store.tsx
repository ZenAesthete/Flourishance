import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Identity, Rule, PortfolioCategory, FailureMode, DailyStackItem, InterrupterLog, SmartStackItem, SavedItem } from './types';

interface AppState {
  identities: Identity[];
  rules: Rule[];
  portfolio: PortfolioCategory[];
  failureModes: FailureMode[];
  dailyStack: SmartStackItem[];
  interrupterLogs: InterrupterLog[];
  savedItems: SavedItem[];
  energyLevel: 'Low' | 'Moderate' | 'High';
  theme: 'dark' | 'light';
  
  setEnergyLevel: (level: 'Low' | 'Moderate' | 'High') => void;
  toggleTheme: () => void;
  toggleDailyItem: (id: string) => void;
  swapItemOption: (id: string) => void;
  addInterrupterLog: (log: InterrupterLog) => void;
  clearInterrupterLogs: () => void;
  deleteInterrupterLog: (id: string) => void;
  refreshDailyStack: () => void;
  updateIdentityVote: (id: string, isPositive: boolean) => void;
  
  addIdentity: (identity: Identity) => void;
  updateIdentity: (id: string, updates: Partial<Identity>) => void;
  deleteIdentity: (id: string) => void;
  addRule: (rule: Rule) => void;
  updateRule: (id: string, updates: Partial<Rule>) => void;
  deleteRule: (id: string) => void;
  addFailureMode: (mode: FailureMode) => void;
  updateFailureMode: (id: string, updates: Partial<FailureMode>) => void;
  deleteFailureMode: (id: string) => void;
  updatePortfolio: (id: string, updates: Partial<PortfolioCategory>) => void;
  
  addSavedItem: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
  deleteSavedItem: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const SEED_IDENTITIES: Identity[] = [
  { id: '1', statement: "I am disciplined with my attention.", proofs: ["25m deep work", "No phone first 30m", "Clear inbox"], strength: 65, votes: 12, downvotes: 2, streak: 3, lastVoteDate: Date.now() - 100000000 },
  { id: '2', statement: "I am physically resilient.", proofs: ["10m stretching", "Morning walk", "Cold shower", "Warm tea meditation"], strength: 40, votes: 5, downvotes: 3, streak: 0 },
  { id: '3', statement: "I am a finisher.", proofs: ["Close open loops", "Ship one update"], strength: 80, votes: 30, downvotes: 1, streak: 12, lastVoteDate: Date.now() },
];

const SEED_RULES: Rule[] = [
  { id: '1', category: 'rule', text: "No screens after 10:30 PM." },
  { id: '2', category: 'principle', text: "If overwhelmed: reduce scope, not standards." },
  { id: '3', category: 'value', text: "Clarity over comfort." },
];

const SEED_PORTFOLIO: PortfolioCategory[] = [
  { id: '1', name: 'Health', description: "Physical vitality, sleep quality, and energy baseline.", weight: 10, investment: 7, controllability: 9, lastUpdated: Date.now() },
  { id: '2', name: 'Wealth', description: "Financial runway, resource acquisition, and security.", weight: 8, investment: 5, controllability: 6, lastUpdated: Date.now() },
  { id: '3', name: 'Relationships', description: "Social capital, intimacy, and community connection.", weight: 9, investment: 4, controllability: 5, lastUpdated: Date.now() }, 
  { id: '4', name: 'Learning', description: "Skill acquisition, mental plasticity, and curiosity.", weight: 6, investment: 3, controllability: 10, lastUpdated: Date.now() },
  { id: '5', name: 'Peace', description: "Internal stability, stress management, and spiritual grounding.", weight: 10, investment: 2, controllability: 10, lastUpdated: Date.now() },
  { id: '6', name: 'Fun', description: "Novelty, play, and dopaminergic recovery.", weight: 5, investment: 1, controllability: 8, lastUpdated: Date.now() },
  { id: '7', name: 'Purpose', description: "North star alignment and contribution to the whole.", weight: 9, investment: 6, controllability: 7, lastUpdated: Date.now() },
  { id: '8', name: 'Environment', description: "Physical space, digital clutter, and aesthetic order.", weight: 7, investment: 8, controllability: 10, lastUpdated: Date.now() },
];

const SEED_FAILURES: FailureMode[] = [
  { id: '1', name: 'Doomscroll Spiral', trigger: 'Tired + Phone in hand', protocol: ['Drop phone', 'Drink water'] },
  { id: '2', name: 'Avoidance Loop', trigger: 'Big undefined task', protocol: ['5 min timer', 'Change room'] },
];

function usePersistedState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {}
  }, [key, state]);

  return [state, setState] as const;
}

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [identities, setIdentities] = usePersistedState<Identity[]>('selfos_identities', SEED_IDENTITIES);
  const [rules, setRules] = usePersistedState<Rule[]>('selfos_rules', SEED_RULES);
  const [portfolio, setPortfolio] = usePersistedState<PortfolioCategory[]>('selfos_portfolio', SEED_PORTFOLIO);
  const [failureModes, setFailureModes] = usePersistedState<FailureMode[]>('selfos_failures', SEED_FAILURES);
  const [interrupterLogs, setInterrupterLogs] = usePersistedState<InterrupterLog[]>('selfos_logs', []);
  const [energyLevel, setEnergyLevel] = usePersistedState<'Low' | 'Moderate' | 'High'>('selfos_energy', 'High');
  const [dailyStack, setDailyStack] = usePersistedState<SmartStackItem[]>('selfos_daily_stack', []);
  const [savedItems, setSavedItems] = usePersistedState<SavedItem[]>('selfos_library', []);
  const [theme, setTheme] = usePersistedState<'dark' | 'light'>('selfos_theme', 'dark');

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const generateStack = (): SmartStackItem[] => {
    const stack: SmartStackItem[] = [];
    const hour = new Date().getHours();
    const isMorning = hour < 10;
    const isEvening = hour > 18;

    // 1. IDENTITY PROTOCOL (Purple)
    // Find the identity that needs the most love (lowest strength)
    // Add randomness among bottom 3 to ensure variety
    const sortedIdentities = [...identities].sort((a, b) => a.strength - b.strength);
    const poolSize = Math.min(sortedIdentities.length, 3);
    const selectedIndex = Math.floor(Math.random() * poolSize);
    const targetIdentity = sortedIdentities[selectedIndex] || sortedIdentities[0];

    if (targetIdentity) {
      // Pick a random proof action to keep it fresh
      const proofAction = targetIdentity.proofs[Math.floor(Math.random() * targetIdentity.proofs.length)] || "Take action";
      
      stack.push({
        id: `id-${Date.now()}`,
        type: 'identity',
        title: 'Cast an Identity Vote',
        subtitle: `Action: ${proofAction}`,
        availableOptions: targetIdentity.proofs.map(p => ({ title: 'Cast an Identity Vote', subtitle: `Action: ${p}` })),
        completed: false
      });
    }

    // 2. TRAJECTORY PROTOCOL (Blue)
    // Intelligent Contextual selection based on Time & Energy
    let trajectoryOptions: { title: string; subtitle: string }[] = [];

    if (isMorning) {
        if (energyLevel === 'High') {
            trajectoryOptions = [
                { title: 'Eat the Frog', subtitle: "Tackle the hardest task immediately" },
                { title: 'Deep Work', subtitle: "90m distraction-free block" }
            ];
        } else {
            trajectoryOptions = [
                { title: 'Morning Momentum', subtitle: "Complete 3 small wins (5m each)" },
                { title: 'Clarity Session', subtitle: "Plan the day's 3 priorities" }
            ];
        }
    } else if (isEvening) {
        trajectoryOptions = [
             { title: 'Shutdown Ritual', subtitle: "Clear desk & plan tomorrow" },
             { title: 'Loop Closing', subtitle: "Review and clear inbox" }
        ];
    } else {
        // Mid-day
        trajectoryOptions = energyLevel === 'High' 
            ? [{ title: 'Power Hour', subtitle: "Advance your #1 Goal" }, { title: 'Skill Sprint', subtitle: "30m learning session" }]
            : [{ title: 'Energy Reset', subtitle: "15m non-sleep deep rest" }, { title: 'Admin Batch', subtitle: "Clear low-energy tasks" }];
    }

    stack.push({ 
      id: `traj-${Date.now()}`, 
      type: 'trajectory', 
      title: trajectoryOptions[0].title, 
      subtitle: trajectoryOptions[0].subtitle, 
      availableOptions: trajectoryOptions,
      completed: false 
    });

    // 3. PORTFOLIO PROTOCOL (Green)
    // Find the GAP: High Importance (Weight) - Low Investment
    const sortedPortfolio = [...portfolio].sort((a, b) => {
        const gapA = a.weight - a.investment;
        const gapB = b.weight - b.investment;
        return gapB - gapA; // Descending gap
    });

    const target = sortedPortfolio[0];
    if (target) {
      const gap = target.weight - target.investment;
      let actionVerb = "Invest in";
      if (gap >= 7) actionVerb = "Rescue";
      else if (gap >= 4) actionVerb = "Boost";
      else if (gap <= 0) actionVerb = "Maintain"; // Low priority if gap is negative or zero

      const portOptions = [
        { title: `${actionVerb}: ${target.name}`, subtitle: `Gap detected. Allocate 20m focus.` },
        { title: `${actionVerb}: ${target.name}`, subtitle: `Identify one blocker in ${target.name}` }
      ];
      stack.push({ 
        id: `port-${Date.now()}`, 
        type: 'portfolio', 
        title: portOptions[0].title, 
        subtitle: portOptions[0].subtitle, 
        availableOptions: portOptions,
        completed: false 
      });
    }

    // 4. DEFENSE (Optional - only if Low energy or recent failures)
    // Only show if we need to defend against a failure mode
    if (energyLevel === 'Low' || failureModes.length > 0) {
        // If recent failure (last 24h), surface that specific one
        const recentFail = interrupterLogs.find(l => !l.success && (Date.now() - l.timestamp < 86400000));
        const mode = recentFail 
            ? failureModes.find(m => m.name === recentFail.urge) 
            : failureModes[0];
            
        if (mode) {
             stack.push({ 
                id: `fail-${Date.now()}`, 
                type: 'prevention', 
                title: `Defense: ${mode.name}`, 
                subtitle: `Set intentional boundary: ${mode.trigger}`, 
                availableOptions: failureModes.map(m => ({ title: `Defend: ${m.name}`, subtitle: `Set boundary: ${m.trigger}` })),
                completed: false 
            });
        }
    }

    return stack;
  };

  // Initial generation
  useEffect(() => {
    if (dailyStack.length === 0) {
      setDailyStack(generateStack());
    }
  }, []);

  const toggleDailyItem = (id: string) => {
    setDailyStack(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const swapItemOption = (id: string) => {
    setDailyStack(prev => prev.map(item => {
      if (item.id === id && item.availableOptions.length > 1) {
        const currentIndex = item.availableOptions.findIndex(o => o.subtitle === item.subtitle);
        const nextIndex = (currentIndex + 1) % item.availableOptions.length;
        return { ...item, ...item.availableOptions[nextIndex], completed: false };
      }
      return item;
    }));
  };

  const updateIdentityVote = (id: string, isPositive: boolean) => {
    setIdentities(prev => prev.map(i => {
      if (i.id === id) {
        const newVotes = isPositive ? i.votes + 1 : i.votes;
        const newDownvotes = !isPositive ? i.downvotes + 1 : i.downvotes;
        const total = newVotes + newDownvotes;
        const newStrength = total === 0 ? 0 : Math.round((newVotes / total) * 100);
        
        // Streak Logic
        const now = Date.now();
        let newStreak = i.streak || 0;
        
        if (isPositive) {
          if (!i.lastVoteDate) {
             newStreak = 1;
          } else {
             const lastDate = new Date(i.lastVoteDate);
             const today = new Date(now);
             
             // Check if same day
             const isSameDay = lastDate.getDate() === today.getDate() && 
                               lastDate.getMonth() === today.getMonth() && 
                               lastDate.getFullYear() === today.getFullYear();
             
             if (!isSameDay) {
                 // Check if consecutive day (86400000 ms in a day)
                 const diffTime = Math.abs(today.getTime() - lastDate.getTime());
                 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                 
                 if (diffDays <= 2) { 
                     newStreak += 1;
                 } else {
                     newStreak = 1;
                 }
             }
          }
        } else {
            newStreak = 0; 
        }

        return { 
          ...i, 
          votes: newVotes, 
          downvotes: newDownvotes, 
          strength: newStrength,
          streak: newStreak,
          lastVoteDate: isPositive ? now : i.lastVoteDate 
        };
      }
      return i;
    }));
  };

  const addInterrupterLog = (log: InterrupterLog) => setInterrupterLogs(prev => [log, ...prev]);
  const clearInterrupterLogs = () => setInterrupterLogs([]);
  const deleteInterrupterLog = (id: string) => setInterrupterLogs(prev => prev.filter(l => l.id !== id));
  
  const refreshDailyStack = () => setDailyStack(generateStack());
  const addIdentity = (identity: Identity) => setIdentities(prev => [...prev, identity]);
  const updateIdentity = (id: string, updates: Partial<Identity>) => {
    setIdentities(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };
  const deleteIdentity = (id: string) => setIdentities(prev => prev.filter(i => i.id !== id));
  
  const addRule = (rule: Rule) => setRules(prev => [...prev, rule]);
  const updateRule = (id: string, updates: Partial<Rule>) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };
  const deleteRule = (id: string) => setRules(prev => prev.filter(r => r.id !== id));
  
  const addFailureMode = (mode: FailureMode) => setFailureModes(prev => [...prev, mode]);
  const updateFailureMode = (id: string, updates: Partial<FailureMode>) => {
    setFailureModes(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };
  const deleteFailureMode = (id: string) => setFailureModes(prev => prev.filter(f => f.id !== id));
  
  const updatePortfolio = (id: string, updates: Partial<PortfolioCategory>) => {
    setPortfolio(prev => prev.map(p => p.id === id ? { ...p, ...updates, lastUpdated: Date.now() } : p));
  };

  const addSavedItem = (item: Omit<SavedItem, 'id' | 'timestamp'>) => {
    setSavedItems(prev => [{ ...item, id: Date.now().toString(), timestamp: Date.now() }, ...prev]);
  };

  const deleteSavedItem = (id: string) => {
    setSavedItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <AppContext.Provider value={{
      identities, rules, portfolio, failureModes, dailyStack, interrupterLogs, savedItems, energyLevel, theme,
      setEnergyLevel, toggleTheme, toggleDailyItem, swapItemOption, addInterrupterLog, clearInterrupterLogs, deleteInterrupterLog, refreshDailyStack, updateIdentityVote,
      addIdentity, updateIdentity, deleteIdentity, addRule, updateRule, deleteRule, addFailureMode, updateFailureMode, deleteFailureMode, updatePortfolio,
      addSavedItem, deleteSavedItem
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useStore must be used within AppProvider");
  return context;
};