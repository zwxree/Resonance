
import React, { useState, useCallback } from 'react';
import { Home, Zap, BarChart3, Store, MessageSquare, Image, Bot, Speaker } from 'lucide-react';
import DashboardScreen from './components/DashboardScreen';
import DevicesScreen from './components/DevicesScreen';
import UsageScreen from './components/UsageScreen';
import StoreScreen from './components/StoreScreen';
import ChatBot from './components/ChatBot';
import ImageEditor from './components/ImageEditor';
import { Tab, Screen } from './types';

// Fix: Corrected typo from onTabTabChange to onTabChange to match prop definition.
const TabBar: React.FC<{ activeTab: Tab; onTabChange: (tab: Tab) => void }> = ({ activeTab, onTabChange }) => {
  const tabs: { id: Tab; icon: React.ElementType }[] = [
    { id: Tab.Dashboard, icon: Home },
    { id: Tab.Devices, icon: Zap },
    { id: Tab.Usage, icon: BarChart3 },
    { id: Tab.Store, icon: Store },
    { id: Tab.ImageEditor, icon: Image },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-resonance-gray-800/80 backdrop-blur-lg border-t border-resonance-gray-700">
      <div className="max-w-md mx-auto flex justify-around items-center h-20">
        {tabs.map(({ id, icon: Icon }) => (
          <button
            key={id}
            // Fix: Corrected typo from onTabTabChange to onTabChange.
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center justify-center w-16 h-16 transition-colors duration-300 rounded-lg ${
              activeTab === id ? 'text-electric-blue-500' : 'text-resonance-gray-500 hover:text-white'
            }`}
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
    if (activeScreen.type === 'tab') {
      switch (activeScreen.tab) {
        case Tab.Dashboard:
          return <DashboardScreen />;
        case Tab.Devices:
          return <DevicesScreen />;
        case Tab.Usage:
          return <UsageScreen />;
        case Tab.Store:
          return <StoreScreen />;
        case Tab.ImageEditor:
          return <ImageEditor />;
        default:
          return <DashboardScreen />;
      }
    }
    // Could handle other screen types here if needed
    return null;
  };

  return (
    <div className="bg-resonance-gray-900 text-white min-h-screen font-sans">
      <div className="max-w-md mx-auto pb-28">
        {renderScreen()}
      </div>
      <FAB onClick={() => setIsChatOpen(true)} />
      {isChatOpen && <ChatBot onClose={() => setIsChatOpen(false)} />}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
