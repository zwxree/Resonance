
import React, { useState, useEffect, useMemo } from 'react';
import { Zap, Thermometer, Droplets, Sun } from 'lucide-react';

const EnergyVisualizer: React.FC<{ consumption: number; isAttunerOn: boolean }> = ({ consumption, isAttunerOn }) => {
    const particlesCount = Math.min(Math.floor(consumption * 10), 50); // Max 50 particles
    const baseSpeed = 8; // seconds for one rotation
    const speed = isAttunerOn ? Math.max(baseSpeed - consumption, 1.5) : baseSpeed;

    const particles = useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => {
            const angle = Math.random() * 360;
            const radius = 40 + Math.random() * 50; // Random radius between 40 and 90
            const size = 1 + Math.random() * 2.5;
            const delay = Math.random() * speed;
            return { id: i, angle, radius, size, delay };
        });
    }, [speed]);

    return (
        <div className="relative w-full h-56 flex items-center justify-center">
             <svg viewBox="0 0 200 200" className="absolute w-full h-full">
                {/* Connection Quality Pulse */}
                <circle cx="100" cy="100" r="40" fill="transparent" stroke="#00A9FF" strokeWidth="1" strokeOpacity="0.5">
                    <animate attributeName="r" from="40" to="80" dur="3s" repeatCount="indefinite" begin="0s" />
                    <animate attributeName="stroke-opacity" from="0.5" to="0" dur="3s" repeatCount="indefinite" begin="0s" />
                </circle>
                {/* Energy Particles */}
                {particles.map((p, index) => (
                     <g key={p.id} style={{ display: isAttunerOn && index < particlesCount ? 'block' : 'none' }}>
                        <circle cx="100" cy="100" r={p.size} fill="#00A9FF" opacity="0.8">
                            <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from={`0 100 100`}
                                to={`360 100 100`}
                                dur={`${speed}s`}
                                begin={`-${p.delay}s`}
                                repeatCount="indefinite"
                            />
                             <animateMotion
                                dur={`${speed}s`}
                                begin={`-${p.delay}s`}
                                repeatCount="indefinite"
                                path={`M${100+p.radius},100 A${p.radius},${p.radius} 0 1,1 ${100-p.radius},100 A${p.radius},${p.radius} 0 1,1 ${100+p.radius},100`}
                             />
                        </circle>
                    </g>
                ))}
            </svg>
            
            <div className="z-10 text-center">
                <span className="text-4xl font-bold text-electric-blue-400">{consumption.toFixed(1)}</span>
                <span className="text-xl font-medium text-resonance-gray-500 ml-2">kW</span>
                 <p className="text-sm text-resonance-gray-500">Real-time usage</p>
            </div>
        </div>
    );
};

const ToggleSwitch: React.FC<{ isOn: boolean; onToggle: () => void }> = ({ isOn, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex items-center h-20 w-40 rounded-full transition-colors duration-300 focus:outline-none ${isOn ? 'bg-electric-blue-500' : 'bg-resonance-gray-700'}`}
  >
    <span
      className={`absolute left-2 top-2 inline-block w-16 h-16 bg-white rounded-full transform transition-transform duration-300 ${isOn ? 'translate-x-20' : 'translate-x-0'} ${isOn ? 'pulse-blue-glow' : ''}`}
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
  const [consumption, setConsumption] = useState(2.3);

  useEffect(() => {
      if (!isAttunerOn) return;
      const interval = setInterval(() => {
          setConsumption(prev => {
              const change = (Math.random() - 0.5) * 0.4;
              const newConsumption = prev + change;
              return Math.max(0.5, Math.min(newConsumption, 5.0));
          });
      }, 2000);
      return () => clearInterval(interval);
  }, [isAttunerOn]);


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
        <div className="bg-resonance-gray-800 rounded-2xl">
            <EnergyVisualizer consumption={consumption} isAttunerOn={isAttunerOn} />
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
