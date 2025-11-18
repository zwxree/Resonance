import React, { useState, useEffect, useRef } from 'react';
import { Power, Cpu, ShieldCheck, Wifi, Shield } from 'lucide-react';

const useAnimatedCounter = (targetValue: number) => {
    const [displayValue, setDisplayValue] = useState(targetValue);
    const valueRef = useRef(targetValue);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const startValue = valueRef.current;
        const duration = 400; // ms
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

            const currentValue = startValue + (targetValue - startValue) * easedProgress;
            setDisplayValue(currentValue);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                 valueRef.current = targetValue;
            }
        };

        if (targetValue !== valueRef.current) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [targetValue]);

    return displayValue;
};


const ControlSlider: React.FC<{
    title: string;
    description: string;
    unit: string;
    min: number;
    max: number;
    initialValue: number;
}> = ({ title, description, unit, min, max, initialValue }) => {
    const [value, setValue] = useState(initialValue);
    const animatedValue = useAnimatedCounter(value);
    
    const sliderProgress = (value - min) / (max - min) * 100;
    const sliderBackground = `linear-gradient(to right, #00A9FF ${sliderProgress}%, #3A3A3C ${sliderProgress}%)`;

    return (
        <div className="bg-apple-gray-600 p-6 rounded-2xl border border-white/10">
            <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <div className="text-right">
                    <span className="text-4xl font-bold text-electric-blue-500 transition-colors tracking-tighter">{animatedValue.toFixed(0)}</span>
                    <span className="text-xl font-medium text-apple-gray-300 ml-1">{unit}</span>
                </div>
            </div>
            <p className="text-sm text-apple-gray-300 mb-6 h-10">{description}</p>
            <div className="relative">
                 <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => setValue(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-apple-gray-400 rounded-lg appearance-none cursor-pointer range-slider"
                    style={{background: sliderBackground}}
                />
            </div>
             <div className="flex justify-between text-xs text-apple-gray-300 mt-2">
                <span>{min}{unit}</span>
                <span>{max}{unit}</span>
            </div>
        </div>
    );
};

const SafetySwitch: React.FC = () => {
    const [isSafe, setIsSafe] = useState(true);
    return (
        <div className="bg-apple-gray-600 p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                     <Shield size={28} className={`transition-colors ${isSafe ? "text-electric-blue-500" : "text-apple-gray-300"}`} />
                    <div>
                        <h3 className="text-lg font-semibold">Safety Override</h3>
                        <p className="text-sm text-apple-gray-300">Auto-shutdown on overload</p>
                    </div>
                </div>
                <input type="checkbox" className="toggle-switch" checked={isSafe} onChange={() => setIsSafe(!isSafe)} />
            </div>
        </div>
    )
};

const InfoCard: React.FC<{ icon: React.ElementType, title: string, value: string, buttonText?: string }> = ({ icon: Icon, title, value, buttonText }) => (
    <div className="bg-apple-gray-600 p-4 rounded-2xl flex items-center justify-between border border-white/10">
        <div className="flex items-center space-x-4">
             <div className="bg-black/20 p-3 rounded-full">
                <Icon className="text-electric-blue-500" size={24} />
            </div>
            <div>
                <p className="text-apple-gray-300 text-sm">{title}</p>
                <p className="text-white font-semibold">{value}</p>
            </div>
        </div>
        {buttonText && <button className="text-sm font-semibold text-white bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors border border-white/20">{buttonText}</button>}
    </div>
);

export default function HubScreen() {
    return (
        <div className="px-5 pt-12 pb-6">
            <h1 className="text-4xl font-extrabold mb-2">Hub Control</h1>
            <p className="text-apple-gray-300 mb-10">Fine-tune your home's energy core.</p>
            <div className="space-y-6">
                <ControlSlider 
                    title="Power Level"
                    description="Set the overall energy output for your home."
                    unit="V"
                    min={180}
                    max={250}
                    initialValue={220}
                />
                 <ControlSlider 
                    title="Coverage Range"
                    description="Define how far the wireless energy field reaches."
                    unit="m"
                    min={5}
                    max={50}
                    initialValue={25}
                />
                <SafetySwitch />
                <div className="space-y-4 pt-4">
                    <InfoCard icon={Cpu} title="Firmware" value="v2.1.8" buttonText="Update" />
                    <InfoCard icon={ShieldCheck} title="System Health" value="Optimal" />
                </div>
            </div>
        </div>
    );
}