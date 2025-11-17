
import React, { useState, useCallback } from 'react';
// Fix: Imported the missing 'Zap' icon.
import { Lamp, Tv, Car, Speaker, Thermometer, Zap } from 'lucide-react';
import { Device } from '../types';

const initialDevices: Device[] = [
  { id: '1', name: 'Bedroom Lamp', room: 'Bedroom', isOn: true, consumption: 0.1 },
  { id: '2', name: 'Living Room TV', room: 'Living Room', isOn: true, consumption: 0.3 },
  { id: '3', name: 'Car Attuner', room: 'Garage', isOn: false, consumption: 7.2 },
  { id: '4', name: 'Kitchen Speaker', room: 'Kitchen', isOn: true, consumption: 0.05 },
  { id: '5', name: 'Thermostat', room: 'Living Room', isOn: true, consumption: 0.8 },
  { id: '6', name: 'Office Lamp', room: 'Bedroom', isOn: false, consumption: 0.1 },
];

const deviceIcons: { [key: string]: React.ElementType } = {
  Lamp: Lamp,
  TV: Tv,
  Car: Car,
  Speaker: Speaker,
  Thermostat: Thermometer,
  default: Zap,
};

const getIconForDevice = (name: string) => {
  for (const key in deviceIcons) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return deviceIcons[key];
    }
  }
  return deviceIcons.default;
};

const DeviceToggle: React.FC<{ isOn: boolean; onToggle: () => void }> = ({ isOn, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 ${isOn ? 'bg-electric-blue-500' : 'bg-resonance-gray-600'}`}
  >
    <span
      className={`inline-block w-6 h-6 bg-white rounded-full transform transition-transform duration-300 ${isOn ? 'translate-x-7' : 'translate-x-1'}`}
    />
  </button>
);

const DeviceItem: React.FC<{ device: Device; onToggle: (id: string) => void }> = ({ device, onToggle }) => {
  const Icon = getIconForDevice(device.name);
  return (
    <div className="bg-resonance-gray-800 p-4 rounded-2xl flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${device.isOn ? 'bg-electric-blue-500' : 'bg-resonance-gray-700'}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-white">{device.name}</p>
          <p className="text-sm text-resonance-gray-500">{device.isOn ? `${device.consumption} kW` : 'Off'}</p>
        </div>
      </div>
      <DeviceToggle isOn={device.isOn} onToggle={() => onToggle(device.id)} />
    </div>
  );
};

export default function DevicesScreen() {
  const [devices, setDevices] = useState(initialDevices);

  const handleToggle = useCallback((id: string) => {
    setDevices(prevDevices =>
      prevDevices.map(d => (d.id === id ? { ...d, isOn: !d.isOn } : d))
    );
  }, []);

  const groupedDevices = devices.reduce((acc, device) => {
    (acc[device.room] = acc[device.room] || []).push(device);
    return acc;
  }, {} as Record<string, Device[]>);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Devices</h1>
      <div className="space-y-6">
        {/* Fix: Replaced Object.entries with Object.keys to avoid type inference issues. */}
        {Object.keys(groupedDevices).map((room) => (
          <div key={room}>
            <h2 className="text-xl font-semibold text-resonance-gray-500 mb-4">{room}</h2>
            <div className="space-y-4">
              {groupedDevices[room].map(device => (
                <DeviceItem key={device.id} device={device} onToggle={handleToggle} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
