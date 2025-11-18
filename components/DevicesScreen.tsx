import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Lamp, Tv, Car, Speaker, Thermometer, Zap, Star, AlertTriangle, ChevronDown, Power } from 'lucide-react';
import { Device } from '../types';

const initialDevices: Device[] = [
  { id: '1', name: 'Bedroom Lamp', room: 'Bedroom', isOn: true, consumption: 0.1, status: 'optimal', priority: false, customVoltage: 220, maxVoltage: 230 },
  { id: '2', name: 'Living Room TV', room: 'Living Room', isOn: true, consumption: 0.3, status: 'optimal', priority: true, customVoltage: 240, maxVoltage: 240 },
  { id: '3', name: 'Car Charger', room: 'Garage', isOn: false, consumption: 7.2, status: 'optimal', priority: false, customVoltage: 240, maxVoltage: 250 },
  { id: '4', name: 'Kitchen Speaker', room: 'Kitchen', isOn: true, consumption: 0.05, status: 'disconnected', priority: false, customVoltage: 220, maxVoltage: 220 },
  { id: '5', name: 'Thermostat', room: 'Living Room', isOn: true, consumption: 0.8, status: 'optimal', priority: false, customVoltage: 230, maxVoltage: 240 },
  { id: '6', name: 'Office Lamp', room: 'Bedroom', isOn: false, consumption: 0.1, status: 'optimal', priority: false, customVoltage: 220, maxVoltage: 230 },
];

const deviceIcons: { [key: string]: React.ElementType } = {
  Lamp: Lamp, TV: Tv, Car: Car, Speaker: Speaker, Thermometer: Thermometer, default: Zap,
};

const getIconForDevice = (name: string) => {
  for (const key in deviceIcons) {
    if (name.toLowerCase().includes(key.toLowerCase())) return deviceIcons[key];
  }
  return deviceIcons.default;
};

const CustomVoltageSlider: React.FC<{ device: Device; onVoltageChange: (id: string, voltage: number) => void }> = ({ device, onVoltageChange }) => {
    const isOverLimit = (device.customVoltage || 0) > device.maxVoltage;
    const sliderProgress = ((device.customVoltage || 200) - 200) / (260 - 200) * 100;
    const sliderBackground = isOverLimit 
        ? `linear-gradient(to right, #ef4444 ${sliderProgress}%, #3A3A3C ${sliderProgress}%)`
        : `linear-gradient(to right, #00A9FF ${sliderProgress}%, #3A3A3C ${sliderProgress}%)`;

    return (
        <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-white">Power Output</label>
                <span className={`font-semibold text-lg ${isOverLimit ? 'text-red-500' : 'text-electric-blue-500'}`}>
                    {device.customVoltage}V
                </span>
            </div>
            <input
                type="range"
                min="200"
                max="260"
                value={device.customVoltage || 220}
                onChange={(e) => onVoltageChange(device.id, parseInt(e.target.value, 10))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer range-slider"
                style={{ background: sliderBackground }}
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
}> = React.memo(({ device, onToggle, onVoltageChange, isExpanded, onExpand }) => {
  const Icon = getIconForDevice(device.name);
  const isOverLimit = (device.customVoltage || 0) > device.maxVoltage;
  const hasWarning = device.status === 'disconnected' || isOverLimit;

  return (
    <div className={`bg-apple-gray-600/80 backdrop-blur-md p-4 rounded-2xl transition-all duration-300 border ${hasWarning ? 'pulse-red-border border-red-500/50' : 'border-white/10'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full relative transition-all duration-300 ${device.isOn ? 'bg-black/20' : 'bg-apple-gray-500'}`}>
            <Icon size={24} className={`transition-all duration-300 ${device.isOn ? 'text-electric-blue-500 light-up-once' : 'text-white'}`} />
            {hasWarning && (
              <AlertTriangle size={14} className={`absolute -top-1 -right-1 text-red-500 bg-apple-gray-600 rounded-full ${device.status === 'disconnected' ? 'animate-blink' : ''}`} />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-white text-lg">{device.name}</p>
              {device.priority && <Star size={14} className="text-electric-blue-500 pulse-blue-subtle" />}
            </div>
            <p className="text-sm text-apple-gray-300">{device.status === 'disconnected' ? 'Disconnected' : (device.isOn ? `${device.consumption} kW` : 'Off')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
            <input type="checkbox" className="toggle-switch" checked={device.isOn} onChange={() => onToggle(device.id)} />
            <button onClick={() => onExpand(device.id)} className="text-apple-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10">
                <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
        </div>
      </div>
      {isExpanded && <CustomVoltageSlider device={device} onVoltageChange={onVoltageChange} />}
    </div>
  );
});

export default function DevicesScreen() {
  const [devices, setDevices] = useState(initialDevices);
  const [expandedDeviceId, setExpandedDeviceId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const activeDevicesCount = useMemo(() => devices.filter(d => d.isOn).length, [devices]);

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

  const handleTurnAllOff = () => {
    setDevices(prevDevices => prevDevices.map(d => ({ ...d, isOn: false })));
    setShowConfirm(false);
  }

  const groupedDevices = useMemo(() => devices.reduce((acc, device) => {
    (acc[device.room] = acc[device.room] || []).push(device);
    return acc;
  }, {} as Record<string, Device[]>), [devices]);

  return (
    <div className="px-5 pt-12 pb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
            <h1 className="text-4xl font-extrabold">Devices</h1>
            <p className="text-apple-gray-300">{activeDevicesCount} of {devices.length} devices active</p>
        </div>
        <button onClick={() => setShowConfirm(true)} className="bg-apple-gray-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 hover:bg-apple-gray-400 transition-colors">
            <Power size={16} />
            <span>All Off</span>
        </button>
      </div>

      <div className="space-y-8 mt-10">
        {Object.keys(groupedDevices).map((room) => (
          <div key={room}>
            <h2 className="text-sm font-bold text-apple-gray-300 uppercase tracking-widest mb-4 px-2">{room}</h2>
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

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-screen-fade-in">
            <div className="bg-apple-gray-600 rounded-2xl p-6 m-4 max-w-sm text-center border border-white/10">
                <h2 className="text-lg font-bold text-white mb-2">Turn off all devices?</h2>
                <p className="text-apple-gray-200 mb-6">Are you sure you want to power down all connected devices?</p>
                <div className="flex space-x-4">
                    <button onClick={() => setShowConfirm(false)} className="flex-1 bg-apple-gray-400 text-white font-bold py-3 rounded-xl hover:bg-apple-gray-300 transition-colors">Cancel</button>
                    <button onClick={handleTurnAllOff} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors">Confirm</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}