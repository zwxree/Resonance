
import React, { useState, useEffect } from 'react';
import { Lamp, Tv, Car, Speaker, Zap, Power, ChevronDown } from 'lucide-react';
import { Device } from '../types';

const initialDevices: Device[] = [
  { id: '1', name: 'Bedroom Lamp', room: 'Bedroom', isOn: true, consumption: 0.1, status: 'optimal', priority: false, customVoltage: 220, maxVoltage: 240 },
  { id: '2', name: 'Living Room TV', room: 'Living Room', isOn: true, consumption: 0.3, status: 'optimal', priority: true, customVoltage: 220, maxVoltage: 240 },
  { id: '3', name: 'Tesla Charger', room: 'Garage', isOn: false, consumption: 7.2, status: 'optimal', priority: false, customVoltage: 240, maxVoltage: 250 },
  { id: '4', name: 'Sonos', room: 'Kitchen', isOn: true, consumption: 0.05, status: 'disconnected', priority: false, customVoltage: 220, maxVoltage: 220 },
];

const getIcon = (name: string) => {
  if (name.includes('Lamp')) return Lamp;
  if (name.includes('TV')) return Tv;
  if (name.includes('Charger')) return Car;
  if (name.includes('Sonos')) return Speaker;
  return Zap;
}

export default function DevicesScreen() {
  // Load from localStorage or use initial defaults
  const [devices, setDevices] = useState<Device[]>(() => {
      const saved = localStorage.getItem('devices');
      return saved ? JSON.parse(saved) : initialDevices;
  });

  // State to track which devices are expanded to show details
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Persist changes to localStorage
  useEffect(() => {
      localStorage.setItem('devices', JSON.stringify(devices));
  }, [devices]);
  
  const toggleDevice = (id: string) => {
      setDevices(prev => prev.map(d => d.id === id ? {...d, isOn: !d.isOn} : d));
  }

  const updateVoltage = (id: string, voltage: number) => {
      setDevices(prev => prev.map(d => d.id === id ? {...d, customVoltage: voltage} : d));
  }

  const toggleDetails = (id: string) => {
      setExpandedIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return newSet;
      });
  }

  return (
    <div className="px-4 pt-12 pb-24">
      <div className="flex justify-between items-center mb-8 px-2">
        <h1 className="text-3xl font-extrabold text-black dark:text-white">Connected</h1>
        <button 
            onClick={() => setDevices(d => d.map(x => ({...x, isOn: false})))} 
            className="bg-gray-100 dark:bg-white/10 p-3 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Turn off all devices"
        >
            <Power size={20} className="text-black dark:text-white" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {devices.map(device => {
            const Icon = getIcon(device.name);
            const isOptimal = device.status === 'optimal';
            const isExpanded = expandedIds.has(device.id);
            
            return (
                <div key={device.id} className={`group relative overflow-hidden rounded-[24px] transition-all duration-300 ${device.isOn ? 'bg-white dark:bg-[#1C1C1E] text-black dark:text-white shadow-sm' : 'bg-gray-50 dark:bg-black/40 text-gray-400'}`}>
                    
                    {/* Minimal Header Section */}
                    <div className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleDetails(device.id)}>
                            <div className="relative">
                                <div className={`p-3 rounded-2xl transition-colors ${device.isOn ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'bg-gray-200 dark:bg-white/5'}`}>
                                    <Icon size={24} strokeWidth={1.5} />
                                </div>
                                {/* Status Indicator */}
                                <div 
                                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-[2px] border-white dark:border-[#1C1C1E] ${isOptimal ? 'bg-[#34C759]' : 'bg-[#FF3B30] animate-pulse'}`}
                                    role="status"
                                    aria-label={isOptimal ? "Status: Optimal" : "Status: Disconnected"}
                                ></div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight leading-tight">{device.name}</h3>
                                <div className="flex items-center gap-2">
                                    <p className={`text-xs font-medium ${device.isOn ? 'text-gray-500 dark:text-gray-400' : 'opacity-50'}`}>{device.room}</p>
                                    {/* Small indicator if expanded */}
                                    <ChevronDown 
                                        size={14} 
                                        className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Toggle (Stop propagation to prevent expanding when clicking toggle) */}
                        <div onClick={(e) => e.stopPropagation()}>
                             <input 
                                type="checkbox" 
                                className="toggle-switch focus:ring-2 focus:ring-blue-500 scale-90" 
                                checked={device.isOn} 
                                onChange={() => toggleDevice(device.id)} 
                                role="switch"
                                aria-checked={device.isOn}
                                aria-label={`Toggle ${device.name}`}
                             />
                        </div>
                    </div>
                    
                    {/* Expandable Details Section */}
                    {device.isOn && isExpanded && (
                        <div className="px-5 pb-6 pt-0 animate-fade-up">
                             <div className="h-[1px] w-full bg-gray-100 dark:bg-white/5 mb-5"></div>
                             
                             <div className="flex justify-between items-end mb-6">
                                 <div>
                                     <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">Consumption</span>
                                     <div className="flex items-baseline gap-1">
                                         <span className="text-2xl font-extrabold text-black dark:text-white tracking-tight">{device.consumption}</span>
                                         <span className="text-sm font-bold text-[#6E6E73] dark:text-[#98989D]">kW</span>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73] dark:text-[#98989D]">Voltage</span>
                                     <div className="flex items-baseline gap-1 justify-end">
                                         <span className="text-lg font-bold text-black dark:text-white">{device.customVoltage}</span>
                                         <span className="text-sm font-medium text-[#6E6E73] dark:text-[#98989D]">V</span>
                                     </div>
                                 </div>
                             </div>
                             
                             {/* Voltage Slider */}
                             <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-4">
                                <label htmlFor={`voltage-${device.id}`} className="sr-only">Adjust Voltage for {device.name}</label>
                                <input 
                                    id={`voltage-${device.id}`}
                                    type="range" 
                                    min="110" 
                                    max={device.maxVoltage} 
                                    value={device.customVoltage || 220} 
                                    onChange={(e) => updateVoltage(device.id, parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-black dark:accent-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-valuemin={110}
                                    aria-valuemax={device.maxVoltage}
                                    aria-valuenow={device.customVoltage}
                                />
                                <div className="flex justify-between text-[10px] font-bold text-[#6E6E73] dark:text-[#98989D] mt-3 px-1">
                                    <span>110V</span>
                                    <span>Safe Limit: {device.maxVoltage}V</span>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            )
        })}
      </div>
    </div>
  );
}
