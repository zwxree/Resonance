
import React, { useState, useCallback } from 'react';
import { Home, Zap, SlidersHorizontal, BarChart3, Store, MessageSquare } from 'lucide-react';
import DashboardScreen from './components/DashboardScreen';
import DevicesScreen from './components/DevicesScreen';
import AttunerScreen from './components/AttunerScreen';
import UsageScreen from './components/UsageScreen';
import StoreScreen from './components/StoreScreen';
import ChatBot from './components/ChatBot';
import { Tab, Screen } from './types';

const TabBar: React.FC<{ activeTab: Tab; onTabChange: (tab: Tab) => void }> = ({ activeTab, onTabChange }) => {
  const tabs: { id: Tab; icon: React.ElementType }[] = [
    { id: Tab.Dashboard, icon: Home },
    { id: Tab.Devices, icon: Zap },
    { id: Tab.Attuner, icon: SlidersHorizontal },
    { id: Tab.Usage, icon: BarChart3 },
    { id: Tab.Store, icon: Store },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-resonance-gray-800/80 backdrop-blur-lg border-t border-resonance-gray-700 z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-20">
        {tabs.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center justify-center w-16 h-16 transition-colors duration-300 rounded-lg ${
              activeTab === id ? 'text-electric-blue-500' : 'text-resonance-gray-500 hover:text-white'
            }`}
            aria-label={id}
            aria-current={activeTab === id}
          >
            <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} />
            <span className="text-xs mt-1 capitalize">{id}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const FAB: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-24 right-4 bg-electric-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-electric-blue-600 transition-transform transform hover:scale-110 focus:outline-none z-50"
     aria-label="Open AI Chat"
  >
    <MessageSquare size={24} />
  </button>
);


export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [activeScreen, setActiveScreen] = useState<Screen>({ type: 'tab', tab: Tab.Dashboard });
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setActiveScreen({ type: 'tab', tab });
  }, []);

  const renderScreen = () => {
    // The key prop is crucial here to make React re-mount the component on tab change, which triggers the animation.
    const screenComponent = () => {
        if (activeScreen.type === 'tab') {
          switch (activeScreen.tab) {
            case Tab.Dashboard:
              return <DashboardScreen />;
            case Tab.Devices:
              return <DevicesScreen />;
            case Tab.Attuner:
              return <AttunerScreen />;
            case Tab.Usage:
              return <UsageScreen />;
            case Tab.Store:
              return <StoreScreen />;
            default:
              return <DashboardScreen />;
          }
        }
        return null;
    }
    return <div key={activeTab} className="animate-screen-fade-in">{screenComponent()}</div>
  };

  return (
    <div className="bg-resonance-gray-900 text-white min-h-screen font-sans">
      <main className="max-w-md mx-auto pb-28">
        {renderScreen()}
      </main>
      <FAB onClick={() => setIsChatOpen(true)} />
      {isChatOpen && <ChatBot onClose={() => setIsChatOpen(false)} />}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}