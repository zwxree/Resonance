
import React from 'react';
import { Zap, Users, Star } from 'lucide-react';
import { Plan } from '../types';

const ProductCard: React.FC<{ imageUrl: string; name: string; price: string; description: string; }> = ({ imageUrl, name, price, description }) => (
    <div className="bg-resonance-gray-800 rounded-3xl overflow-hidden">
        <img src={imageUrl} alt={name} className="w-full h-48 object-cover" />
        <div className="p-6">
            <div className="flex justify-between items-baseline">
                <h3 className="text-xl font-bold">{name}</h3>
                <p className="text-lg font-semibold text-electric-blue-400">{price}</p>
            </div>
            <p className="text-resonance-gray-500 mt-2 mb-4">{description}</p>
            <button className="w-full bg-electric-blue-500 text-white font-bold py-3 rounded-lg hover:bg-electric-blue-600 transition-colors">
                Add to Cart
            </button>
        </div>
    </div>
);

const plans: Plan[] = [
    { id: '1', name: 'Starter', price: '₹999/mo', kwhLimit: 300, features: ['Basic device support', 'Standard speed', 'Email support'], tier: 'basic' },
    { id: '2', name: 'Family', price: '₹1,999/mo', kwhLimit: 800, features: ['Priority device support', 'Enhanced speed', '24/7 chat support'], tier: 'standard' },
    { id: '3', name: 'Power User', price: '₹3,499/mo', kwhLimit: 2000, features: ['All devices priority', 'Maximum speed', 'Dedicated support line'], tier: 'premium' },
];

const PlanCard: React.FC<{ plan: Plan }> = ({ plan }) => {
    const tierColors = {
        basic: 'border-resonance-gray-700',
        standard: 'border-electric-blue-500',
        premium: 'border-yellow-400',
    };
    const tierIcons = { basic: Zap, standard: Users, premium: Star };
    const Icon = tierIcons[plan.tier];

    return (
        <div className={`bg-resonance-gray-800 p-6 rounded-3xl border-2 ${tierColors[plan.tier]} flex flex-col`}>
             <div className="flex items-center space-x-3 mb-4">
                <Icon className={`w-8 h-8 ${plan.tier === 'standard' ? 'text-electric-blue-400' : plan.tier === 'premium' ? 'text-yellow-400' : 'text-resonance-gray-500'}`} />
                <div>
                     <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                     <p className="text-xl font-semibold text-electric-blue-400">{plan.price}</p>
                </div>
            </div>
            <p className="text-resonance-gray-500 mb-6">{plan.kwhLimit} kWh included monthly</p>
            <ul className="space-y-3 text-white flex-grow">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                        <Star size={16} className="text-electric-blue-400 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button className={`w-full mt-8 font-bold py-3 rounded-lg transition-colors ${plan.tier === 'standard' ? 'bg-electric-blue-500 hover:bg-electric-blue-600 text-white' : 'bg-resonance-gray-700 hover:bg-resonance-gray-600 text-white'}`}>
                Choose Plan
            </button>
        </div>
    );
}

export default function StoreScreen() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-8">Store</h1>
            <div className="space-y-10">
                <section>
                    <h2 className="text-2xl font-bold mb-4">Hardware</h2>
                    <div className="space-y-8">
                        <ProductCard 
                            imageUrl="https://picsum.photos/seed/attuner/800/600"
                            name="The Attuner"
                            price="₹41,999"
                            description="The central hub of your home's energy. Seamlessly power everything with unparalleled efficiency."
                        />
                        <ProductCard 
                            imageUrl="https://picsum.photos/seed/chip/800/600"
                            name="Resonance Chip"
                            price="₹3,999"
                            description="Retrofit any device to work with The Attuner. Smart, compact, and powerful short-range energy receivers."
                        />
                        <ProductCard 
                            imageUrl="https://picsum.photos/seed/portable/800/600"
                            name="Portable Attuner"
                            price="₹66,999"
                            description="Your personal energy source on the go. Perfect for remote work, camping, and emergencies."
                        />
                    </div>
                </section>
                
                <section>
                    <h2 className="text-2xl font-bold mb-4">Electricity Plans</h2>
                    <div className="space-y-6">
                        {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
                    </div>
                </section>
            </div>
        </div>
    );
}
