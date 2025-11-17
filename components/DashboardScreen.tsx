
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Zap, Thermometer, Droplets, Sun } from 'lucide-react';

const mockConsumptionData = [
  { time: '1m ago', kW: 1.2 }, { time: '55s ago', kW: 1.3 }, { time: '50s ago', kW: 1.5 },
  { time: '45s ago', kW: 1.4 }, { time: '40s ago', kW: 1.6 }, { time: '35s ago', kW: 1.8 },
  { time: '30s ago', kW: 1.7 }, { time: '25s ago', kW: 2.1 }, { time: '20s ago', kW: 2.0 },
  { time: '15s ago', kW: 1.9 }, { time: '10s ago', kW: 2.2 }, { time: '5s ago', kW: 2.4 },
  { time: 'Now', kW: 2.3 },
];

const ToggleSwitch: React.FC<{ isOn: boolean; onToggle: () => void }> = ({ isOn, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex items-center h-20 w-40 rounded-full transition-colors duration-300 focus:outline-none ${isOn ? 'bg-electric-blue-500' : 'bg-resonance-gray-700'}`}
  >
    <span
      className={`absolute left-2 top-2 inline-block w-16 h-16 bg-white rounded-full transform transition-transform duration-300 ${isOn ? 'translate-x-20' : 'translate-x-0'}`}
    />
  </button>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
);

const Widget: React.FC<{ icon: React.ElementType, title: string, value: string }> = ({ icon: Icon, title, value }) => (
    <div className="bg-resonance-gray-800 p-4 rounded-2xl flex flex-col justify-between aspect-square">
        <Icon className="text-electric-blue-400" size={28} />
        <div>
            <p className="text-resonance-gray-500 text-sm">{title}</p>
            <p className="text-white font-semibold text-lg">{value}</p>
        </div>
    </div>
);


export default function DashboardScreen() {
  const [isAttunerOn, setIsAttunerOn] = useState(true);

  return (
    <div className="p-6 space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold">Resonance Control</h1>
        <p className="text-resonance-gray-500">Welcome back</p>
      </header>

      <section className="flex flex-col items-center p-6 bg-resonance-gray-800 rounded-3xl">
        <p className="mb-4 text-lg font-medium">Attuner Status</p>
        <ToggleSwitch isOn={isAttunerOn} onToggle={() => setIsAttunerOn(!isAttunerOn)} />
        <p className={`mt-4 text-lg font-semibold transition-colors ${isAttunerOn ? 'text-electric-blue-400' : 'text-resonance-gray-500'}`}>
          {isAttunerOn ? 'Active' : 'Inactive'}
        </p>
      </section>
      
      <section>
        <SectionHeader title="Live Consumption" />
        <div className="bg-resonance-gray-800 p-4 rounded-2xl h-56 flex flex-col">
            <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-electric-blue-400">2.3</span>
                <span className="text-xl font-medium text-resonance-gray-500">kW</span>
            </div>
             <p className="text-sm text-resonance-gray-500">Real-time usage</p>
            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockConsumptionData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00A9FF" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#00A9FF" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Tooltip contentStyle={{ backgroundColor: '#2C2C2E', border: 'none', borderRadius: '10px' }} labelStyle={{ color: '#48484A' }} itemStyle={{ color: 'white' }}/>
                    <Area type="monotone" dataKey="kW" stroke="#00A9FF" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
                </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </section>

       <section>
        <SectionHeader title="Quick Access" />
        <div className="grid grid-cols-2 gap-4">
            <Widget icon={Zap} title="Voltage Limit" value="240V" />
            <Widget icon={Thermometer} title="Temperature" value="21°C" />
            <Widget icon={Droplets} title="Attuner Health" value="Optimal" />
            <Widget icon={Sun} title="Solar Input" value="0.8 kW" />
        </div>
      </section>
    </div>
  );
}
