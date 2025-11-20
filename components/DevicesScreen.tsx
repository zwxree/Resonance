
import React, { useState } from 'react';
import { Lamp, Tv, Car, Speaker, Zap, Power, ChevronDown } from 'lucide-react';
import { Device } from '../types';

const initialDevices: Device[] = [
  { id: '1', name: 'Bedroom Lamp', room: 'Bedroom', isOn: true, consumption: 0.1, status: 'optimal', priority: false, customVoltage: 220, maxVoltage: 230 },
  { id: '2', name: 'Living Room TV', room: 'Living Room', isOn: true, consumption: 0.3, status: 'optimal', priority: true, customVoltage: 240, maxVoltage: 240 },
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
  const [devices, setDevices] = useState(initialDevices);
  
  const toggleDevice = (id: string) => {
      setDevices(prev => prev.map(d => d.id === id ? {...d, isOn: !d.isOn} : d));
  }

  return (
    <div className="px-4 pt-12 pb-6">
      <div className="flex justify-between items-center mb-8 px-2">
        <h1 className="text-3xl font-extrabold text-black dark:text-white">Connected</h1>
        <button onClick={() => setDevices(d => d.map(x => ({...x, isOn: false})))} className="bg-gray-100 dark:bg-white/10 p-3 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
            <Power size={20} className="text-black dark:text-white" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {devices.map(device => {
            const Icon = getIcon(device.name);
            return (
                <div key={device.id} className={`group relative overflow-hidden rounded-[28px] p-6 transition-all duration-300 ${device.isOn ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg scale-[1.01]' : 'bg-white dark:bg-[#1A1A1A] text-gray-400 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-4">
                         <div className={`p-3 rounded-full ${device.isOn ? 'bg-white/20 dark:bg-black/10' : 'bg-gray-100 dark:bg-white/5'}`}>
                             <Icon size={24} />
                         </div>
                         <div className="flex flex-col items-end">
                             <input type="checkbox" className="toggle-switch" checked={device.isOn} onChange={() => toggleDevice(device.id)} />
                             <span className="text-xs font-bold mt-2 opacity-80">{device.isOn ? 'ACTIVE' : 'OFFLINE'}</span>
                         </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-1">{device.name}</h3>
                        <p className={`text-sm ${device.isOn ? 'opacity-70' : 'opacity-50'}`}>{device.room}</p>
                    </div>
                    
                    {device.isOn && (
                        <div className="mt-6 pt-4 border-t border-white/10 dark:border-black/5 flex justify-between items-center">
                             <span className="text-sm font-medium">{device.consumption} kW</span>
                             <ChevronDown size={16} className="opacity-50" />
                        </div>
                    )}
                </div>
            )
        })}
      </div>
    </div>
  );
}
