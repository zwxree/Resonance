
import React from 'react';

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


export default function StoreScreen() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-8">Store</h1>
            <div className="space-y-8">
                <ProductCard 
                    imageUrl="https://picsum.photos/seed/attuner/800/600"
                    name="The Attuner"
                    price="$499"
                    description="The central hub of your home's energy. Seamlessly power everything with unparalleled efficiency."
                />
                <ProductCard 
                    imageUrl="https://picsum.photos/seed/chip/800/600"
                    name="Resonance Chip"
                    price="$49"
                    description="Retrofit any device to work with The Attuner. Smart, compact, and powerful short-range energy receivers."
                />
                <ProductCard 
                    imageUrl="https://picsum.photos/seed/portable/800/600"
                    name="Portable Attuner"
                    price="$799"
                    description="Your personal energy source on the go. Perfect for remote work, camping, and emergencies."
                />
            </div>
        </div>
    );
}
