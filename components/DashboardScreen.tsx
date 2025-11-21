
import React, { useState, useEffect, useContext } from 'react';
import { Zap, Thermometer, Droplets, Sun, Lightbulb, AlertTriangle, Bell, X, Settings, CreditCard, ArrowRight, Activity } from 'lucide-react';
import { getQuickEnergyTip } from '../services/geminiService';
import { AppContext } from '../App';

const playAlertSound = () => {
  try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
  } catch (e) { console.error(e); }
}

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
};

// --- Welcome Summary Modal ---
const WelcomeSummary: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 dark:bg-black/60 backdrop-blur-sm animate-fade-up" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 w-full max-w-sm shadow-2xl border border-white/20 dark:border-white/5">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
                    <Activity size={24} />
                </div>
                <div>
                    <h2 id="welcome-title" className="text-xl font-bold text-black dark:text-white">{getGreeting()}, ADMIN</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Here's your summary while you were away.</p>
                </div>
            </div>
            <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-2xl">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Energy Usage</span>
                    <span className="font-bold text-black dark:text-white">Stable (-2%)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-2xl">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Tesla Charger</span>
                    <span className="font-bold text-green-500">Completed 100%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-2xl">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Security</span>
                    <span className="font-bold text-black dark:text-white">2 Events</span>
                </div>
            </div>
            <button onClick={onClose} className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm hover:scale-[1.02] transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500">
                Dismiss
            </button>
        </div>
    </div>
);

const PinterestCard: React.FC<{ children: React.ReactNode; className?: string; height?: string }> = ({ children, className = "", height = "auto" }) => (
    <div className={`bg-white dark:bg-[#1C1C1E] rounded-[32px] p-5 shadow-sm hover:shadow-md transition-shadow duration-300 mb-4 break-inside-avoid text-black dark:text-white ${className}`} style={{ height }}>
        {children}
    </div>
);

const DeviceConsumptionAlert: React.FC<{ deviceName: string; usage: number; onClose: () => void }> = ({ deviceName, usage, onClose }) => (
    <div className="fixed top-6 left-4 right-4 z-50 animate-fade-up" role="alert">
        <div className="bg-white dark:bg-[#1C1C1E] text-black dark:text-white rounded-2xl p-4 shadow-2xl border border-red-100 dark:border-red-900/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-red-500 text-white p-2 rounded-full animate-pulse">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <p className="font-bold text-sm">High Usage Alert</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{deviceName} is pulling {usage}kW</p>
                </div>
            </div>
            <button onClick={onClose} aria-label="Close Alert" className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"><X size={16}/></button>
        </div>
    </div>
);

export default function HomeScreen({ openSettings }: { openSettings: () => void }) {
  const { user, isOffline } = useContext(AppContext);
  
  // Initialize state from localStorage
  const [isHubOn, setIsHubOn] = useState(() => {
      const saved = localStorage.getItem('isHubOn');
      return saved !== null ? JSON.parse(saved) : true;
  });
  const [alertThreshold, setAlertThreshold] = useState(() => {
      const saved = localStorage.getItem('alertThreshold');
      return saved ? parseFloat(saved) : 4.5;
  });

  const [consumption, setConsumption] = useState(2.3);
  const [tip, setTip] = useState<string>('Loading tip...');
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Alert State
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [highUsageDevice, setHighUsageDevice] = useState<{name: string, usage: number} | null>(null);

  // Persist state
  useEffect(() => {
      localStorage.setItem('isHubOn', JSON.stringify(isHubOn));
      localStorage.setItem('alertThreshold', alertThreshold.toString());
  }, [isHubOn, alertThreshold]);

  useEffect(() => {
      if (!isHubOn) { setConsumption(0); return; };
      const interval = setInterval(() => {
          setConsumption(prev => {
              const change = (Math.random() - 0.5) * 0.8; 
              const newVal = Math.max(0.5, Math.min(prev + change, 5.5));
              
              if (Math.random() > 0.95) return 5.2; 
              return newVal;
          });
      }, 2000);
      return () => clearInterval(interval);
  }, [isHubOn]);

  useEffect(() => {
      if (isOffline) {
          setTip("You are offline. Cached data is shown.");
      } else {
          const fetchTip = async () => { setTip(await getQuickEnergyTip()); };
          fetchTip();
      }
  }, [isOffline]);

  useEffect(() => {
      if (consumption > alertThreshold) {
          if (!alertTriggered) {
              setAlertTriggered(true);
              setHighUsageDevice({ name: "EV Charger", usage: consumption.toFixed(1) as any });
              playAlertSound();
          }
      } else {
          setAlertTriggered(false);
          setHighUsageDevice(null);
      }
  }, [consumption, alertThreshold, alertTriggered]);

  return (
    <div className="px-4 pt-12 pb-6">
      {showWelcome && <WelcomeSummary onClose={() => setShowWelcome(false)} />}
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8 px-2">
        <div className="flex items-center gap-3">
            <img src={user?.avatar} alt="User Avatar" className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-800 object-cover" />
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">{getGreeting()}</p>
                <h1 className="text-2xl font-bold text-black dark:text-white tracking-tight">{user?.name}</h1>
            </div>
        </div>
        <div className="flex gap-3">
             <button 
                className="p-3 bg-white dark:bg-[#1C1C1E] rounded-full shadow-sm hover:scale-105 transition-transform text-black dark:text-white relative focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Notifications"
             >
                <Bell size={20} />
                {alertTriggered && <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
            </button>
            <button 
                onClick={openSettings} 
                className="p-3 bg-black dark:bg-white rounded-full shadow-sm hover:scale-105 transition-transform text-white dark:text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Settings"
            >
                <Settings size={20} />
            </button>
        </div>
      </header>

      {/* Alert Overlay */}
      {highUsageDevice && (
          <DeviceConsumptionAlert 
            deviceName={highUsageDevice.name} 
            usage={highUsageDevice.usage} 
            onClose={() => setHighUsageDevice(null)} 
          />
      )}

      {/* Pinterest Masonry Grid */}
      <div className="masonry-grid">
         
         {/* Main Energy Card */}
         <PinterestCard className={`bg-[#1C1C1E] dark:bg-[#3A3A3C] !text-white relative overflow-hidden group ${alertTriggered ? 'animate-soft-pulse-red' : ''}`} height="320px">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <div className={`w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 blur-3xl transition-opacity duration-1000 ${isHubOn ? 'opacity-100' : 'opacity-0'}`}></div>
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                        <Zap size={20} fill="currentColor" className="text-white" />
                    </div>
                    <input 
                        type="checkbox" 
                        className="toggle-switch focus:ring-2 focus:ring-white/50" 
                        checked={isHubOn} 
                        onChange={() => setIsHubOn(!isHubOn)} 
                        aria-label="Master Power Switch"
                        role="switch"
                        aria-checked={isHubOn}
                    />
                </div>
                <div className="text-center">
                     <span className="text-6xl font-extrabold tracking-tighter text-white">{consumption.toFixed(1)}</span>
                     <p className="text-sm text-gray-300 font-medium uppercase tracking-widest mt-2">Kilowatts Active</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                    <div className="flex justify-between text-xs text-gray-200 mb-1 font-medium">
                        <label htmlFor="threshold-slider">Threshold</label>
                        <span>{alertThreshold} kW</span>
                    </div>
                    <input 
                        id="threshold-slider"
                        type="range" 
                        min="1" max="6" step="0.1" 
                        value={alertThreshold} 
                        onChange={(e) => setAlertThreshold(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-valuemin={1}
                        aria-valuemax={6}
                        aria-valuenow={alertThreshold}
                    />
                </div>
            </div>
         </PinterestCard>

         {/* Bill Payment Card */}
         <PinterestCard className="bg-[#F5F5F7] dark:bg-[#2C2C2E] flex flex-col justify-between" height="200px">
             <div>
                <div className="flex justify-between items-center mb-2">
                    <span className="bg-black/5 dark:bg-white/10 p-1.5 rounded-lg"><CreditCard size={16} className="text-black dark:text-white"/></span>
                    <span className="text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">Unpaid</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Current Bill</p>
                <h3 className="text-3xl font-bold text-black dark:text-white mt-1">$124.50</h3>
             </div>
             <button className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500">
                 Pay Now <ArrowRight size={16} />
             </button>
         </PinterestCard>

         {/* Daily Tip */}
         <PinterestCard className="bg-blue-50 dark:bg-[#1C1C1E] border border-blue-100 dark:border-blue-900/30">
            <Lightbulb className="text-blue-500 mb-3" size={24} />
            <h4 className="font-bold text-blue-900 dark:text-white text-lg mb-2">Insight</h4>
            <p className="text-sm text-blue-800 dark:text-gray-300 leading-relaxed">"{tip}"</p>
         </PinterestCard>

         {/* Quick Stats */}
         <PinterestCard>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-full text-orange-500"><Sun size={18}/></div>
                        <span className="text-sm font-bold text-black dark:text-white">Solar</span>
                    </div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">0.8 kW</span>
                </div>
                <div className="w-full h-[1px] bg-gray-100 dark:bg-white/10"></div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full text-green-500"><Droplets size={18}/></div>
                        <span className="text-sm font-bold text-black dark:text-white">Grid</span>
                    </div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">1.5 kW</span>
                </div>
             </div>
         </PinterestCard>

      </div>
    </div>
  );
}
