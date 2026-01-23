import React, { useState } from 'react';
import { AppProvider } from './store';
import { Tab } from './types';
import Layout from './components/Layout';
import HomeView from './views/HomeView';
import CompassView from './views/CompassView';
import IdentityView from './views/IdentityView';
import DefenseView from './views/DefenseView';
import ReviewView from './views/ReviewView';
import LibraryView from './views/LibraryView';
import SettingsView from './views/SettingsView';

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  return (
    <AppProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="min-h-full animate-in fade-in duration-300">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'compass' && <CompassView />}
          {activeTab === 'identity' && <IdentityView />}
          {activeTab === 'defense' && <DefenseView />}
          
          {/* Sub-views now accessible via Settings */}
          {activeTab === 'review' && <ReviewView onBack={() => setActiveTab('settings')} />}
          {activeTab === 'library' && <LibraryView onBack={() => setActiveTab('settings')} />}
          
          {activeTab === 'settings' && <SettingsView onNavigate={setActiveTab} />}
        </div>
      </Layout>
    </AppProvider>
  );
};

export default App;