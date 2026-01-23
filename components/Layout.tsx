import React, { useState } from 'react';
import { Home, Compass, User, Shield, Zap, Settings } from 'lucide-react';
import { Tab } from '../types';
import InterrupterModal from './InterrupterModal';
import { useStore } from '../store';

interface LayoutProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const [isInterrupterOpen, setIsInterrupterOpen] = useState(false);

  return (
    <div className="h-[100dvh] flex flex-col max-w-md mx-auto relative overflow-hidden bg-slate-50 dark:bg-slate-950/50 shadow-2xl md:border-x border-slate-200 dark:border-white/5 transition-colors duration-300">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        <div className="min-h-full pb-32">
          {children}
        </div>
      </main>

      {/* Floating Interrupter Button */}
      <div className="absolute bottom-24 right-5 z-50">
        <button 
          onClick={() => setIsInterrupterOpen(true)}
          title="INTERRUPT URGE"
          className="relative group w-14 h-14 flex items-center justify-center"
        >
          {/* Pulse effect */}
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
          {/* Button base */}
          <div className="relative w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center text-white transition-transform active:scale-90 border border-red-400/30">
            <Zap size={24} className="fill-current" />
          </div>
        </button>
      </div>

      {/* Floating Glass Navigation */}
      <div className="absolute bottom-0 w-full max-w-md z-40 p-3 pointer-events-none">
        <nav className="pointer-events-auto mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex justify-between items-center px-4 py-2 transition-colors duration-300">
          <NavBtn 
            icon={<Home size={20} />} 
            label="Home" 
            isActive={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
          />
          <NavBtn 
            icon={<Compass size={20} />} 
            label="Compass" 
            isActive={activeTab === 'compass'} 
            onClick={() => setActiveTab('compass')} 
          />
          <NavBtn 
            icon={<User size={20} />} 
            label="Identity" 
            isActive={activeTab === 'identity'} 
            onClick={() => setActiveTab('identity')} 
          />
          <NavBtn 
            icon={<Shield size={20} />} 
            label="Defense" 
            isActive={activeTab === 'defense'} 
            onClick={() => setActiveTab('defense')} 
          />
          <NavBtn 
            icon={<Settings size={20} />} 
            label="Settings" 
            // Keep Settings active even if we are in sub-views Review or Library
            isActive={['settings', 'review', 'library'].includes(activeTab)} 
            onClick={() => setActiveTab('settings')} 
          />
        </nav>
      </div>

      {/* Interrupter Modal */}
      {isInterrupterOpen && <InterrupterModal onClose={() => setIsInterrupterOpen(false)} />}
    </div>
  );
};

const NavBtn = ({ icon, label, isActive, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center min-w-[3.5rem] w-12 h-11 rounded-xl transition-all duration-300 group shrink-0 ${
      isActive ? 'text-blue-600 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
    }`}
  >
    <div className={`transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-semibold absolute bottom-0.5 transition-all duration-300 ${
      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    }`}>
      {label}
    </span>
    {isActive && (
      <div className="absolute -bottom-2 w-6 h-6 bg-blue-500/20 blur-lg rounded-full" />
    )}
  </button>
);

export default Layout;