
import React, { useState, useCallback } from 'react';
import { Home, Zap, Cpu, BarChart3, Bot } from 'lucide-react';
import HomeScreen from './components/DashboardScreen';
import DevicesScreen from './components/DevicesScreen';
import HubScreen from './components/AttunerScreen';
import StatsScreen from './components/UsageScreen';
import AiScreen from './components/StoreScreen';
import { Tab, Screen } from './types';

const TabBar: React.FC<{ activeTab: Tab; onTabChange: (tab: Tab) => void }> = ({ activeTab, onTabChange }) => {
  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: Tab.Home, icon: Home, label: 'Home' },
    { id: Tab.Devices, icon: Zap, label: 'Devices' },
    { id: Tab.Hub, icon: Cpu, label: 'Hub' },
    { id: Tab.Stats, icon: BarChart3, label: 'Stats' },
    { id: Tab.AI, icon: Bot, label: 'AI' },
  ];
  const activeIndex = tabs.findIndex(t => t.id === activeTab);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto p-4">
        <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-full flex justify-around items-center h-20 shadow-2xl shadow-black/50">
          {/* FIX: The `Icon` component was not defined. It must be dynamically set to the `icon` property of the `tab` object being iterated over. It must also be capitalized to be used as a JSX component. */}
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex-1 flex flex-col items-center justify-center h-full transition-colors duration-300 z-10"
                aria-label={tab.label}
                aria-current={activeTab === tab.id}
              >
                <Icon size={24} strokeWidth={2.5} className={`transition-transform duration-300 ${activeTab === tab.id ? 'text-white scale-110' : 'text-apple-gray-300'}`} />
                <span className={`text-[10px] mt-1 font-bold transition-opacity duration-300 ${activeTab === tab.id ? 'text-white opacity-100' : 'text-apple-gray-300 opacity-80'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 h-16 w-[calc(20%-0.4rem)] mx-[0.2rem] bg-electric-blue-500/80 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
  const [activeScreen, setActiveScreen] = useState<Screen>({ type: 'tab', tab: Tab.Home });

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setActiveScreen({ type: 'tab', tab });
  }, []);

  const renderScreen = () => {
    // The key prop is crucial here to make React re-mount the component on tab change, which triggers the animation.
    const screenComponent = () => {
        if (activeScreen.type === 'tab') {
          switch (activeScreen.tab) {
            case Tab.Home:
              return <HomeScreen />;
            case Tab.Devices:
              return <DevicesScreen />;
            case Tab.Hub:
              return <HubScreen />;
            case Tab.Stats:
              return <StatsScreen />;
            case Tab.AI:
              return <AiScreen />;
            default:
              return <HomeScreen />;
          }
        }
        return null;
    }
    return <div key={activeTab} className="animate-screen-fade-in">{screenComponent()}</div>
  };

  return (
    <div className="bg-apple-gray-700 text-white min-h-screen font-sans">
      <main className="max-w-md mx-auto pb-32">
        {renderScreen()}
      </main>
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}