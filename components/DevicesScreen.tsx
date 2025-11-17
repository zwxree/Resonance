
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Lamp, Tv, Car, Speaker, Thermometer, Zap, Star, AlertTriangle, ChevronDown } from 'lucide-react';
import { Device } from '../types';

const initialDevices: Device[] = [
  { id: '1', name: 'Bedroom Lamp', room: 'Bedroom', isOn: true, consumption: 0.1, status: 'optimal', priority: false, customVoltage: 220, maxVoltage: 230 },
  { id: '2', name: 'Living Room TV', room: 'Living Room', isOn: true, consumption: 0.3, status: 'optimal', priority: true, customVoltage: 240, maxVoltage: 240 },
  { id: '3', name: 'Car Attuner', room: 'Garage', isOn: false, consumption: 7.2, status: 'optimal', priority: false, customVoltage: 240, maxVoltage: 250 },
  { id: '4', name: 'Kitchen Speaker', room: 'Kitchen', isOn: true, consumption: 0.05, status: 'disconnected', priority: false, customVoltage: 220, maxVoltage: 220 },
  { id: '5', name: 'Thermostat', room: 'Living Room', isOn: true, consumption: 0.8, status: 'optimal', priority: false, customVoltage: 230, maxVoltage: 240 },
  { id: '6', name: 'Office Lamp', room: 'Bedroom', isOn: false, consumption: 0.1, status: 'optimal', priority: false, customVoltage: 220, maxVoltage: 230 },
];

const deviceIcons: { [key: string]: React.ElementType } = {
  Lamp: Lamp, TV: Tv, Car: Car, Speaker: Speaker, Thermostat: Thermometer, default: Zap,
};

const getIconForDevice = (name: string) => {
  for (const key in deviceIcons) {
    if (name.toLowerCase().includes(key.toLowerCase())) return deviceIcons[key];
  }
  return deviceIcons.default;
};

const DeviceToggle: React.FC<{ isOn: boolean; onToggle: () => void }> = ({ isOn, onToggle }) => (
  <button onClick={onToggle} className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 ${isOn ? 'bg-electric-blue-500' : 'bg-resonance-gray-600'}`}>
    <span className={`inline-block w-6 h-6 bg-white rounded-full transform transition-transform duration-300 ${isOn ? 'translate-x-7' : 'translate-x-1'}`} />
  </button>
);

const CustomVoltageSlider: React.FC<{ device: Device; onVoltageChange: (id: string, voltage: number) => void }> = ({ device, onVoltageChange }) => {
    const isOverLimit = (device.customVoltage || 0) > device.maxVoltage;
    return (
        <div className="mt-4 pt-4 border-t border-resonance-gray-700">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-white">Custom Voltage</label>
                <span className={`font-semibold ${isOverLimit ? 'text-red-500' : 'text-electric-blue-400'}`}>
                    {device.customVoltage}V
                </span>
            </div>
            <input
                type="range"
                min="200"
                max="260"
                value={device.customVoltage || 220}
                onChange={(e) => onVoltageChange(device.id, parseInt(e.target.value, 10))}
                className="w-full h-2 bg-resonance-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            {isOverLimit && (
                 <p className="text-xs text-red-500 mt-2 flex items-center"><AlertTriangle size={12} className="mr-1"/>Exceeds safe limit of {device.maxVoltage}V</p>
            )}
        </div>
    );
};

const DeviceItem: React.FC<{ 
    device: Device; 
    onToggle: (id: string) => void;
    onVoltageChange: (id: string, voltage: number) => void;
    isExpanded: boolean;
    onExpand: (id: string) => void;
}> = ({ device, onToggle, onVoltageChange, isExpanded, onExpand }) => {
  const Icon = getIconForDevice(device.name);
  const itemRef = useRef<HTMLDivElement>(null);
  const isOverLimit = (device.customVoltage || 0) > device.maxVoltage;

  useEffect(() => {
    if (device.isOn) {
      itemRef.current?.classList.add('light-up-once');
      const timer = setTimeout(() => itemRef.current?.classList.remove('light-up-once'), 500);
      return () => clearTimeout(timer);
    }
  }, [device.isOn]);

  const statusClasses = device.status === 'disconnected' || isOverLimit ? 'pulse-red-border' : '';
  const priorityClasses = device.priority ? 'shadow-lg shadow-electric-blue-900/50' : '';

  return (
    <div ref={itemRef} className={`bg-resonance-gray-800 p-4 rounded-2xl transition-all duration-300 ${statusClasses} ${priorityClasses}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full relative ${device.isOn ? 'bg-electric-blue-500' : 'bg-resonance-gray-700'}`}>
            <Icon size={24} className="text-white" />
            {(device.status === 'disconnected' || isOverLimit) && (
              <AlertTriangle size={14} className="absolute -top-1 -right-1 text-red-500 bg-resonance-gray-800 rounded-full" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-white">{device.name}</p>
              {device.priority && <Star size={14} className="text-electric-blue-400 pulse-blue-subtle" />}
            </div>
            <p className="text-sm text-resonance-gray-500">{device.status === 'disconnected' ? 'Disconnected' : (device.isOn ? `${device.consumption} kW` : 'Off')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
            <DeviceToggle isOn={device.isOn} onToggle={() => onToggle(device.id)} />
            <button onClick={() => onExpand(device.id)} className="text-resonance-gray-500 hover:text-white">
                <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
        </div>
      </div>
      {isExpanded && <CustomVoltageSlider device={device} onVoltageChange={onVoltageChange} />}
    </div>
  );
};

export default function DevicesScreen() {
  const [devices, setDevices] = useState(initialDevices);
  const [expandedDeviceId, setExpandedDeviceId] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    setDevices(prevDevices =>
      prevDevices.map(d => (d.id === id ? { ...d, isOn: !d.isOn } : d))
    );
  }, []);

  const handleVoltageChange = useCallback((id: string, voltage: number) => {
    setDevices(prevDevices =>
      prevDevices.map(d => (d.id === id ? { ...d, customVoltage: voltage } : d))
    );
  }, []);

  const handleExpand = useCallback((id: string) => {
    setExpandedDeviceId(prevId => (prevId === id ? null : id));
  }, []);

  const groupedDevices = devices.reduce((acc, device) => {
    (acc[device.room] = acc[device.room] || []).push(device);
    return acc;
  }, {} as Record<string, Device[]>);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Devices</h1>
      <div className="space-y-6">
        {Object.keys(groupedDevices).map((room) => (
          <div key={room}>
            <h2 className="text-xl font-semibold text-resonance-gray-500 mb-4">{room}</h2>
            <div className="space-y-4">
              {groupedDevices[room].map(device => (
                <DeviceItem 
                    key={device.id} 
                    device={device} 
                    onToggle={handleToggle}
                    onVoltageChange={handleVoltageChange}
                    isExpanded={expandedDeviceId === device.id}
                    onExpand={handleExpand}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
