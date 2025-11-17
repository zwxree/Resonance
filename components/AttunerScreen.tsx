
import React, { useState, useEffect, useRef } from 'react';
import { Power, Cpu, ShieldCheck, Wifi, Shield } from 'lucide-react';

// Fix: The original implementation of this hook had a logic error with stale closures
// in useEffect, and the useRef call might have caused the reported error.
// This new implementation is more robust and correct.
const useAnimatedCounter = (targetValue: number) => {
    const [displayValue, setDisplayValue] = useState(targetValue);
    const requestRef = useRef<number | null>(null);
    const prevValueRef = useRef(targetValue);

    useEffect(() => {
        const animate = () => {
            const difference = targetValue - displayValue;
            // If the difference is negligible, snap to the target and stop animating.
            if (Math.abs(difference) < 0.1) {
                setDisplayValue(targetValue);
                if (requestRef.current) {
                    cancelAnimationFrame(requestRef.current);
                    requestRef.current = null;
                }
                return;
            }
            // Animate towards the target value with a smoothing factor.
            setDisplayValue(prev => prev + difference * 0.1);
            requestRef.current = requestAnimationFrame(animate);
        };
        
        // Start animation only if the target has changed
        if(targetValue !== prevValueRef.current) {
             if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            requestRef.current = requestAnimationFrame(animate);
            prevValueRef.current = targetValue;
        }

        // Cleanup function to cancel animation frame on component unmount.
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [targetValue, displayValue]);

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

    const backgroundIntensity = (value - min) / (max - min);

    return (
        <div 
            className="bg-resonance-gray-800 p-6 rounded-3xl transition-shadow duration-300"
            style={{ 
                boxShadow: `0 0 30px rgba(0, 169, 255, ${backgroundIntensity * 0.2})`
            }}
        >
            <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <div className="text-right">
                    <span className="text-4xl font-bold text-electric-blue-400 transition-colors">{animatedValue.toFixed(0)}</span>
                    <span className="text-xl font-medium text-resonance-gray-500 ml-1">{unit}</span>
                </div>
            </div>
            <p className="text-sm text-resonance-gray-500 mb-6">{description}</p>
            <div className="relative">
                 <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => setValue(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-resonance-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
                />
            </div>
             <div className="flex justify-between text-xs text-resonance-gray-500 mt-2">
                <span>{min}{unit}</span>
                <span>{max}{unit}</span>
            </div>
        </div>
    );
};

const SafetySwitch: React.FC = () => {
    const [isSafe, setIsSafe] = useState(true);
    return (
        <div className="bg-resonance-gray-800 p-6 rounded-3xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                     <Shield size={28} className={isSafe ? "text-electric-blue-400" : "text-resonance-gray-500"} />
                    <div>
                        <h3 className="text-lg font-semibold">Safety Override</h3>
                        <p className="text-sm text-resonance-gray-500">Auto-shutdown on overload</p>
                    </div>
                </div>
                <button onClick={() => setIsSafe(!isSafe)} className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 ${isSafe ? 'bg-electric-blue-500' : 'bg-resonance-gray-600'}`}>
                    <span className={`inline-block w-6 h-6 bg-white rounded-full transform transition-transform duration-300 ${isSafe ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
            </div>
        </div>
    )
};

const InfoCard: React.FC<{ icon: React.ElementType, title: string, value: string, buttonText?: string }> = ({ icon: Icon, title, value, buttonText }) => (
    <div className="bg-resonance-gray-800 p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <Icon className="text-electric-blue-400" size={24} />
            <div>
                <p className="text-resonance-gray-500 text-sm">{title}</p>
                <p className="text-white font-semibold">{value}</p>
            </div>
        </div>
        {buttonText && <button className="text-sm font-semibold text-electric-blue-500 bg-resonance-gray-700 px-3 py-1 rounded-full hover:bg-resonance-gray-600">{buttonText}</button>}
    </div>
);

export default function AttunerScreen() {
    return (
        <div className="p-6">
            <style>{`
                .range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none; appearance: none;
                    width: 24px; height: 24px;
                    background: #fff; border-radius: 50%;
                    cursor: pointer; margin-top: -10px;
                    border: 4px solid #00A9FF;
                }
                .range-slider::-moz-range-thumb {
                    width: 24px; height: 24px;
                    background: #fff; border-radius: 50%;
                    cursor: pointer; border: 4px solid #00A9FF;
                }
            `}</style>
            <h1 className="text-3xl font-bold mb-8">Attuner Management</h1>
            <div className="space-y-6">
                <ControlSlider 
                    title="Voltage Limit"
                    description="Adjust the maximum voltage draw for your entire system."
                    unit="V"
                    min={180}
                    max={250}
                    initialValue={220}
                />
                 <ControlSlider 
                    title="Attuner Range"
                    description="Set the effective wireless energy range from the central hub."
                    unit="m"
                    min={5}
                    max={50}
                    initialValue={25}
                />
                <SafetySwitch />
                <div className="space-y-4">
                    <InfoCard icon={Cpu} title="Firmware" value="v2.1.8" buttonText="Update" />
                    <InfoCard icon={ShieldCheck} title="System Health" value="Optimal" />
                </div>
            </div>
        </div>
    );
}
