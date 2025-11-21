
import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { Home, Zap, Cpu, BarChart3, Bot, LogOut, Moon, Sun, MapPin, Plus, WifiOff } from 'lucide-react';
import HomeScreen from './components/DashboardScreen';
import DevicesScreen from './components/DevicesScreen';
import HubScreen from './components/AttunerScreen';
import StatsScreen from './components/UsageScreen';
import AiScreen from './components/StoreScreen';
import { Tab, Screen } from './types';
import { findServiceCentres } from './services/geminiService';

// --- Theme Context ---
type Theme = 'light' | 'dark';
interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  user: { name: string; email: string; avatar: string } | null;
  logout: () => void;
  registerChip: (id: string) => void;
  isOffline: boolean;
}

export const AppContext = createContext<AppContextType>({
  theme: 'light',
  toggleTheme: () => {},
  user: null,
  logout: () => {},
  registerChip: () => {},
  isOffline: false,
});

// --- Auth Screen ---
const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-ios-bg dark:bg-black">
       <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-orange-400/20 blur-3xl opacity-50"></div>
       <div className="z-10 w-full max-w-sm text-center animate-fade-up">
          <div className="w-28 h-28 mx-auto mb-8 flex items-center justify-center shadow-2xl rounded-[28px] overflow-hidden bg-white dark:bg-black">
            <img src="1.jpg" alt="Aetherkraft Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-semibold mb-2 tracking-tight text-black dark:text-white">Aetherkraft</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium">Energy, reimagined.</p>
          
          <div className="space-y-4">
             <input 
                type="email" 
                placeholder="Email" 
                aria-label="Email Address"
                className="w-full p-4 rounded-2xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black dark:text-white placeholder-gray-400" 
             />
             <input 
                type="password" 
                placeholder="Password" 
                aria-label="Password"
                className="w-full p-4 rounded-2xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black dark:text-white placeholder-gray-400" 
             />
             
             <button onClick={onLogin} className="w-full py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {isRegistering ? 'Create Account' : 'Sign In'}
             </button>
          </div>
          
          <button onClick={() => setIsRegistering(!isRegistering)} className="mt-8 text-sm text-gray-500 font-medium hover:text-black dark:hover:text-white transition-colors focus:outline-none focus:underline">
            {isRegistering ? 'Already have an account? Log in' : 'Create new account'}
          </button>
       </div>
    </div>
  )
}

// --- Settings Modal ---
const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { theme, toggleTheme, logout, registerChip } = useContext(AppContext);
    const [loadingCenters, setLoadingCenters] = useState(false);
    const [centers, setCenters] = useState<string[]>([]);
    const [chipId, setChipId] = useState('');

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const handleFindCenters = async () => {
        setLoadingCenters(true);
        const results = await findServiceCentres();
        setCenters(results ? [results] : ["No centers found nearby."]);
        setLoadingCenters(false);
    }

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        registerChip(chipId);
        setChipId('');
        alert("Chip registered successfully!");
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/20 dark:bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div className="bg-white dark:bg-dark-card w-full sm:max-w-md h-[85vh] sm:h-auto sm:rounded-[32px] rounded-t-[32px] p-6 overflow-y-auto shadow-2xl animate-fade-up text-black dark:text-white">
                <div className="flex justify-between items-center mb-8">
                    <h2 id="settings-title" className="text-2xl font-bold">Settings</h2>
                    <button onClick={onClose} aria-label="Close Settings" className="p-2 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"><Plus className="rotate-45" /></button>
                </div>

                <div className="space-y-8">
                    {/* Theme */}
                    <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-white/10 rounded-2xl">
                        <div className="flex items-center gap-3">
                            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                            <span className="font-semibold">Appearance</span>
                        </div>
                        <button onClick={toggleTheme} className="px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-full text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {theme === 'light' ? 'Light' : 'Dark'}
                        </button>
                    </div>

                    {/* Register Chip */}
                    <div>
                        <h3 className="font-bold mb-3 text-xs text-gray-500 uppercase tracking-wide">Hardware</h3>
                        <form onSubmit={handleRegister} className="flex gap-2">
                            <input 
                                value={chipId}
                                onChange={(e) => setChipId(e.target.value)}
                                placeholder="Enter Chip ID"
                                aria-label="Enter Chip ID"
                                className="flex-1 bg-gray-100 dark:bg-white/5 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white placeholder-gray-400"
                            />
                            <button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-4 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">Add</button>
                        </form>
                    </div>

                    {/* Service Centers */}
                    <div>
                        <h3 className="font-bold mb-3 text-xs text-gray-500 uppercase tracking-wide">Support</h3>
                        <button 
                            onClick={handleFindCenters}
                            disabled={loadingCenters}
                            className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl font-bold mb-4 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <div className="flex items-center gap-2"><MapPin size={18}/> Find Service Centres</div>
                            {loadingCenters && <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>}
                        </button>
                        {centers.length > 0 && (
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                                {centers[0]}
                            </div>
                        )}
                    </div>

                    {/* Account */}
                    <button onClick={logout} className="w-full py-4 text-red-500 font-bold bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                        <LogOut size={18} /> Log Out
                    </button>
                </div>
            </div>
        </div>
    )
}

const TabBar: React.FC<{ activeTab: Tab; onTabChange: (tab: Tab) => void }> = ({ activeTab, onTabChange }) => {
  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: Tab.Home, icon: Home, label: 'Home' },
    { id: Tab.Devices, icon: Zap, label: 'Devices' },
    { id: Tab.Hub, icon: Cpu, label: 'Hub' },
    { id: Tab.Stats, icon: BarChart3, label: 'Statistics' },
    { id: Tab.AI, icon: Bot, label: 'AI Assistant' },
  ];

  return (
    <div className="fixed bottom-8 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-full px-6 py-3 shadow-2xl pointer-events-auto flex gap-6 items-center" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-label={tab.label}
                onClick={() => onTabChange(tab.id)}
                className={`relative p-3 transition-all duration-300 rounded-full group focus:outline-none focus:ring-2 focus:ring-blue-500 ${isActive ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<Theme>('light'); 
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  // UPDATED USER: Name ADMIN, Avatar 2.jpg
  const [user] = useState({ name: "ADMIN", email: "admin@aether.com", avatar: "2.jpg" });

  // --- Adaptive Theme & Persistence ---
  useEffect(() => {
      // 1. Check localStorage
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme) {
          setTheme(savedTheme);
      } else {
          // 2. Adaptive Logic (System or Time)
          const hour = new Date().getHours();
          const isNight = hour < 6 || hour >= 18;
          const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          
          if (systemDark || isNight) {
              setTheme('dark');
          } else {
              setTheme('light');
          }
      }

      // Listen for system changes if no override? 
      // For simplicity, we just set initial. To be fully adaptive to system changes while app is open:
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
          if (!localStorage.getItem('theme')) { // Only change if user hasn't manually set it
              setTheme(e.matches ? 'dark' : 'light');
          }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
      if (theme === 'dark') {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
  }, [theme]);

  // --- Offline Detection ---
  useEffect(() => {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      }
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const logout = () => setIsAuthenticated(false);
  const registerChip = (id: string) => console.log("Registered", id);

  const renderScreen = () => {
     const screen = () => {
        switch (activeTab) {
            case Tab.Home: return <HomeScreen openSettings={() => setIsSettingsOpen(true)} />;
            case Tab.Devices: return <DevicesScreen />;
            case Tab.Hub: return <HubScreen />;
            case Tab.Stats: return <StatsScreen />;
            case Tab.AI: return <AiScreen />;
            default: return <HomeScreen openSettings={() => setIsSettingsOpen(true)} />;
        }
     }
     return <div key={activeTab} className="animate-fade-up pb-32">{screen()}</div>
  };

  if (!isAuthenticated) return (
      <AppContext.Provider value={{ theme, toggleTheme, user: null, logout, registerChip, isOffline }}>
        <LoginScreen onLogin={() => setIsAuthenticated(true)} />
      </AppContext.Provider>
  );

  return (
    <AppContext.Provider value={{ theme, toggleTheme, user, logout, registerChip, isOffline }}>
        <div className="min-h-screen selection:bg-blue-500 selection:text-white bg-ios-bg dark:bg-black text-ios-text dark:text-dark-text">
            {isOffline && (
                <div className="bg-red-500 text-white text-xs font-bold text-center py-1 px-4 fixed top-0 w-full z-[100]">
                    <div className="flex items-center justify-center gap-2">
                        <WifiOff size={12} /> Offline Mode - Changes saved locally
                    </div>
                </div>
            )}
            <main className={`max-w-lg mx-auto min-h-screen relative ${isOffline ? 'pt-6' : ''}`}>
                {renderScreen()}
            </main>
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    </AppContext.Provider>
  );
}
