
import React, { useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyzeWithThinkingMode, generateSpeech } from '../services/geminiService';
import { Bot, Loader2, Volume2, X } from 'lucide-react';
import { decode, decodeAudioData } from '../utils/audioUtils';

const dailyData = [
  { name: 'Mon', consumption: 15 }, { name: 'Tue', consumption: 18 }, { name: 'Wed', consumption: 22 },
  { name: 'Thu', consumption: 20 }, { name: 'Fri', consumption: 25 }, { name: 'Sat', consumption: 30 },
  { name: 'Sun', consumption: 28 },
];

const weeklyData = [
    { name: 'Week 1', consumption: 158 }, { name: 'Week 2', consumption: 165 },
    { name: 'Week 3', consumption: 172 }, { name: 'Week 4', consumption: 160 },
];

const monthlyData = [
  { name: 'Jan', consumption: 650 }, { name: 'Feb', consumption: 620 }, { name: 'Mar', consumption: 680 },
  { name: 'Apr', consumption: 710 }, { name: 'May', consumption: 750 }, { name: 'Jun', consumption: 800 },
];

type Period = 'Day' | 'Week' | 'Month';

const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = React.useRef<AudioContext | null>(null);

  const playAudio = async (base64Audio: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const audioContext = audioContextRef.current;
    
    try {
      const decodedData = decode(base64Audio);
      const audioBuffer = await decodeAudioData(decodedData, audioContext, 24000, 1);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      source.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  };

  return { playAudio, isPlaying };
};

export default function UsageScreen() {
  const [activePeriod, setActivePeriod] = useState<Period>('Day');
  const [activeIndex, setActiveIndex] = useState(dailyData.length - 1);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const { playAudio, isPlaying } = useAudioPlayer();

  const dataMap = { 'Day': dailyData, 'Week': weeklyData, 'Month': monthlyData };
  const currentData = dataMap[activePeriod];
  
  const handleBarClick = (data: any, index: number) => setActiveIndex(index);
  const selectedData = currentData[activeIndex];
  
  const handleAnalyze = async () => {
    setIsLoadingAnalysis(true);
    setIsAnalysisModalOpen(true);
    setAnalysisResult('');
    const prompt = `Analyze my ${activePeriod.toLowerCase()}ly energy consumption data and provide actionable insights to reduce my bill. My data is: ${JSON.stringify(currentData)}. Focus on trends, peaks, and suggest 3 concrete tips. Format the output as clean markdown.`;
    const result = await analyzeWithThinkingMode(prompt);
    setAnalysisResult(result);
    setIsLoadingAnalysis(false);
  };

  const handleReadSummary = async () => {
    if(isPlaying) return;
    const summaryText = `Your estimated bill this month is $128.50. Your current consumption is ${selectedData.consumption} kilowatt hours.`;
    const audioData = await generateSpeech(summaryText);
    if (audioData) {
      playAudio(audioData);
    }
  };


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Consumption</h1>
      <p className="text-resonance-gray-500 mb-8">Track your usage and billing.</p>

      <div className="bg-resonance-gray-800 p-4 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-resonance-gray-500">{selectedData.name} Consumption</p>
            <p className="text-3xl font-bold text-white">{selectedData.consumption} <span className="text-xl">kWh</span></p>
          </div>
          <div className="bg-resonance-gray-700 p-1 rounded-full flex items-center">
            {(['Day', 'Week', 'Month'] as Period[]).map(period => (
              <button key={period} onClick={() => { setActivePeriod(period); setActiveIndex(dataMap[period].length - 1)}} className={`px-3 py-1 text-sm font-semibold rounded-full ${activePeriod === period ? 'bg-electric-blue-500 text-white' : 'text-resonance-gray-500'}`}>
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentData} onClick={handleBarClick}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#48484A' }} />
              <Tooltip cursor={{fill: '#2C2C2E'}} contentStyle={{ backgroundColor: '#1C1C1E', border: 'none', borderRadius: '10px' }}/>
              <Bar dataKey="consumption" radius={[10, 10, 10, 10]}>
                {currentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === activeIndex ? '#00A9FF' : '#3A3A3C'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-resonance-gray-800 p-4 rounded-2xl">
          <p className="text-resonance-gray-500">Estimated Bill</p>
          <div className="flex justify-between items-baseline">
            <p className="text-3xl font-bold text-white">$128.50</p>
            <button onClick={handleReadSummary} disabled={isPlaying} className="text-electric-blue-500 hover:text-electric-blue-400 disabled:opacity-50">
                <Volume2 size={24} />
            </button>
          </div>
        </div>
        <button onClick={handleAnalyze} className="bg-resonance-gray-700 p-4 rounded-2xl flex flex-col justify-center items-center text-center hover:bg-resonance-gray-600 transition">
          <Bot size={28} className="text-electric-blue-400 mb-2"/>
          <p className="font-semibold text-white">AI Analysis</p>
          <p className="text-xs text-resonance-gray-500">with Thinking Mode</p>
        </button>
      </div>

      {isAnalysisModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-resonance-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Consumption Analysis</h2>
              <button onClick={() => setIsAnalysisModalOpen(false)} className="text-resonance-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            {isLoadingAnalysis ? (
              <div className="flex flex-col items-center justify-center min-h-[200px]">
                <Loader2 className="animate-spin text-electric-blue-500" size={48} />
                <p className="mt-4 text-resonance-gray-500">Gemini is thinking...</p>
              </div>
            ) : (
              <div className="prose prose-invert prose-p:text-resonance-gray-500 prose-headings:text-white prose-strong:text-electric-blue-400">
                <div dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
