import React, { useState, useEffect, useMemo } from 'react';
import { Zap, Thermometer, Droplets, Sun, Star, Award } from 'lucide-react';
import { Plan } from '../types';

const EnergyVisualizer: React.FC<{ consumption: number; isHubOn: boolean; onToggle: () => void }> = ({ consumption, isHubOn, onToggle }) => {
    const particlesCount = Math.min(Math.floor(consumption * 15), 70);
    const baseSpeed = 10;
    const speed = isHubOn ? Math.max(baseSpeed - consumption * 1.5, 2) : baseSpeed;

    const particles = useMemo(() => {
        return Array.from({ length: 70 }).map((_, i) => ({
            id: i,
            angle: Math.random() * 360,
            radius: 60 + Math.random() * 50,
            size: 1 + Math.random() * 2,
            delay: Math.random() * speed,
        }));
    }, [speed]);

    return (
        <div 
            className="relative w-full h-72 flex items-center justify-center cursor-pointer group"
            onClick={onToggle}
            aria-label={isHubOn ? "Turn Hub Off" : "Turn Hub On"}
            role="button"
        >
            <div className={`absolute w-64 h-64 rounded-full transition-all duration-700 blur-2xl ${isHubOn ? 'bg-electric-blue-500/20' : 'bg-apple-gray-500/10'}`}></div>
            <div className={`absolute w-56 h-56 rounded-full transition-all duration-700 blur-lg ${isHubOn ? 'bg-electric-blue-500/20' : 'bg-apple-gray-500/20'}`}></div>
            <svg viewBox="0 0 200 200" className="absolute w-full h-full opacity-80">
                {isHubOn && <circle cx="100" cy="100" r="60" fill="transparent" stroke="#00A9FF" strokeWidth="0.5" strokeOpacity="0.5" className="pulse-blue-subtle" />}
                {particles.map((p, index) => (
                     <g key={p.id} style={{ display: isHubOn && index < particlesCount ? 'block' : 'none' }}>
                        <circle cx="100" cy="100" r={p.size} fill="#00A9FF" opacity="0.9">
                            <animateTransform attributeName="transform" type="rotate" from={`0 100 100`} to={`360 100 100`} dur={`${speed}s`} begin={`-${p.delay}s`} repeatCount="indefinite" />
                             <animateMotion dur={`${speed}s`} begin={`-${p.delay}s`} repeatCount="indefinite" path={`M${100+p.radius},100 A${p.radius},${p.radius} 0 1,1 ${100-p.radius},100 A${p.radius},${p.radius} 0 1,1 ${100+p.radius},100`} />
                        </circle>
                    </g>
                ))}
            </svg>
            
            <div className="z-10 text-center">
                 <p className={`text-lg font-medium transition-colors mb-2 ${isHubOn ? 'text-electric-blue-500' : 'text-apple-gray-200'}`}>
                  {isHubOn ? 'Hub Active' : 'Hub Off'}
                </p>
                <span className="text-6xl font-bold text-white tracking-tighter group-hover:text-apple-gray-100 transition-colors">{consumption.toFixed(1)}</span>
                <span className="text-2xl font-medium text-apple-gray-300 ml-1">kW</span>
            </div>
        </div>
    );
};

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div className="px-1">
        <h2 className="text-3xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-apple-gray-300">{subtitle}</p>}
    </div>
);

const Widget: React.FC<{ icon: React.ElementType, title: string, value: string }> = ({ icon: Icon, title, value }) => (
    <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between border border-white/10">
        <div className="flex items-center space-x-4">
            <div className="bg-black/20 p-3 rounded-full">
                <Icon className="text-electric-blue-500" size={24} />
            </div>
            <div>
                <p className="text-apple-gray-200 text-sm font-medium">{title}</p>
                <p className="text-white font-semibold text-lg">{value}</p>
            </div>
        </div>
    </div>
);

const ProductCard: React.FC<{ imageUrl: string; name: string; price: string; description: string; }> = ({ imageUrl, name, price, description }) => (
    <div className="bg-apple-gray-600 rounded-3xl overflow-hidden border border-white/10">
        <div className="relative h-56">
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 p-6 w-full">
                <h3 className="text-2xl font-bold">{name}</h3>
                <p className="text-lg font-semibold text-electric-blue-500">{price}</p>
            </div>
        </div>
        <div className="p-6 pt-4">
            <p className="text-apple-gray-200 mb-6">{description}</p>
            <button className="w-full bg-white/10 text-white font-bold py-3.5 rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                Learn More
            </button>
        </div>
    </div>
);

const plans: Plan[] = [
    { id: '1', name: 'Starter', price: '₹799/mo', kwhLimit: 300, features: ['Basic device support', 'Standard speed', 'Email support'], tier: 'basic' },
    { id: '2', name: 'Family', price: '₹1,499/mo', kwhLimit: 800, features: ['Priority device support', 'Enhanced speed', '24/7 chat support'], tier: 'standard' },
    { id: '3', name: 'Power User', price: '₹2,999/mo', kwhLimit: 2000, features: ['All devices priority', 'Maximum speed', 'Dedicated support line'], tier: 'premium' },
];

const PlanCard: React.FC<{ plan: Plan }> = ({ plan }) => {
    const isStandard = plan.tier === 'standard';

    return (
        <div className={`relative bg-apple-gray-600 p-6 rounded-3xl border ${isStandard ? 'border-electric-blue-500/70' : 'border-white/10'} flex flex-col`}>
             {isStandard && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-electric-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                    <Award size={12} className="mr-1.5"/>
                    Most Popular
                </div>
             )}
             <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="text-xl font-semibold text-electric-blue-500">{plan.price}</p>
            </div>
            <p className="text-apple-gray-300 mb-6">{plan.kwhLimit} kWh included monthly</p>
            <ul className="space-y-3 text-apple-gray-100 flex-grow">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                        <Star size={16} className="text-electric-blue-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button className={`w-full mt-8 font-bold py-3.5 rounded-xl transition-colors ${isStandard ? 'bg-electric-blue-500 text-white hover:bg-electric-blue-600' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`}>
                Choose Plan
            </button>
        </div>
    );
}

export default function HomeScreen() {
  const [isHubOn, setIsHubOn] = useState(true);
  const [consumption, setConsumption] = useState(2.3);

  useEffect(() => {
      if (!isHubOn) {
        setConsumption(0);
        return;
      };
      const interval = setInterval(() => {
          setConsumption(prev => {
              const change = (Math.random() - 0.5) * 0.4;
              const newConsumption = prev + change;
              return Math.max(0.5, Math.min(newConsumption, 5.0));
          });
      }, 2000);
      return () => clearInterval(interval);
  }, [isHubOn]);


  return (
    <div className="px-5 pt-12 pb-6 space-y-12">
      <header className="text-center px-1">
        <h1 className="text-4xl font-extrabold text-white">Welcome Home</h1>
        <p className="text-apple-gray-300">Your energy at a glance.</p>
      </header>

      <section>
        <div className="bg-apple-gray-600 rounded-3xl border border-white/10">
            <EnergyVisualizer consumption={consumption} isHubOn={isHubOn} onToggle={() => setIsHubOn(!isHubOn)} />
        </div>
      </section>

       <section className="space-y-6">
        <SectionHeader title="Quick Stats" />
        <div className="space-y-3">
            <Widget icon={Zap} title="Power Level" value="220V" />
            <Widget icon={Thermometer} title="Avg. Temp" value="21°C" />
            <Widget icon={Droplets} title="Hub Health" value="Optimal" />
            <Widget icon={Sun} title="Solar Input" value="0.8 kW" />
        </div>
      </section>

      <section className="space-y-6">
          <SectionHeader title="Shop Hardware" />
          <div className="space-y-6">
              <ProductCard 
                  imageUrl="https://picsum.photos/seed/attuner/800/600"
                  name="Joule Hub"
                  price="₹39,999"
                  description="The central hub of your home's energy. Seamlessly power everything with unparalleled efficiency."
              />
              <ProductCard 
                  imageUrl="https://picsum.photos/seed/chip/800/600"
                  name="Joule Puck"
                  price="₹2,499"
                  description="Retrofit any device to work with the Joule Hub. Smart, compact, and powerful short-range energy receivers."
              />
          </div>
      </section>
      
      <section className="space-y-6">
          <SectionHeader title="Upgrade Your Plan" />
          <div className="space-y-6">
              {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
          </div>
      </section>

    </div>
  );
}