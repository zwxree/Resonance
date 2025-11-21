
import React, { useState, useContext, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyzeWithThinkingMode } from '../services/geminiService';
import { Bot, Download, CheckCircle, ChevronDown } from 'lucide-react';
import { AppContext } from '../App';

type TimeRange = 'Day' | 'Week' | 'Month' | '6 Months' | 'Year' | 'Overall';

const mockData: Record<TimeRange, { name: string; consumption: number }[]> = {
    'Day': [
        { name: '12am', consumption: 0.5 }, { name: '4am', consumption: 0.4 }, { name: '8am', consumption: 1.2 },
        { name: '12pm', consumption: 1.8 }, { name: '4pm', consumption: 2.1 }, { name: '8pm', consumption: 2.5 },
        { name: '11pm', consumption: 1.0 },
    ],
    'Week': [
        { name: 'M', consumption: 15 }, { name: 'T', consumption: 18 }, { name: 'W', consumption: 22 },
        { name: 'T', consumption: 20 }, { name: 'F', consumption: 25 }, { name: 'S', consumption: 30 },
        { name: 'S', consumption: 28 },
    ],
    'Month': [
        { name: 'W1', consumption: 90 }, { name: 'W2', consumption: 110 }, { name: 'W3', consumption: 105 },
        { name: 'W4', consumption: 120 },
    ],
    '6 Months': [
        { name: 'May', consumption: 320 }, { name: 'Jun', consumption: 350 }, { name: 'Jul', consumption: 450 },
        { name: 'Aug', consumption: 480 }, { name: 'Sep', consumption: 400 }, { name: 'Oct', consumption: 380 },
    ],
    'Year': [
        { name: 'J', consumption: 350 }, { name: 'F', consumption: 340 }, { name: 'M', consumption: 320 },
        { name: 'A', consumption: 300 }, { name: 'M', consumption: 320 }, { name: 'J', consumption: 350 },
        { name: 'J', consumption: 450 }, { name: 'A', consumption: 480 }, { name: 'S', consumption: 400 },
        { name: 'O', consumption: 380 }, { name: 'N', consumption: 360 }, { name: 'D', consumption: 400 },
    ],
    'Overall': [
        { name: '2021', consumption: 3800 }, { name: '2022', consumption: 4100 }, { name: '2023', consumption: 4050 },
        { name: '2024', consumption: 4200 },
    ]
};

export default function StatsScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('Week');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [insight, setInsight] = useState('');
  const { theme } = useContext(AppContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Determine tick color based on theme for maximum visibility
  const tickColor = theme === 'dark' ? '#E5E5EA' : '#8E8E93';

  const currentData = useMemo(() => mockData[timeRange], [timeRange]);
  const totalConsumption = useMemo(() => currentData.reduce((acc, curr) => acc + curr.consumption, 0), [currentData]);

  const handleAnalyze = async () => {
      setIsThinking(true);
      const res = await analyzeWithThinkingMode(`Review this energy data for the ${timeRange}: ${JSON.stringify(currentData)}. Brief 2 sentence summary.`);
      setInsight(res);
      setIsThinking(false);
  }

  const handleRangeChange = (range: TimeRange) => {
      setTimeRange(range);
      setIsDropdownOpen(false);
      setActiveIndex(null); // Reset active bar
  };

  return (
    <div className="px-4 pt-12 pb-6">
      <h1 className="text-3xl font-extrabold mb-6 px-2 text-black dark:text-white">Usage & Billing</h1>

      {/* Chart Card */}
      <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[32px] shadow-sm mb-6 relative z-10">
         <div className="flex justify-between items-start mb-6">
             <div>
                 <div className="relative">
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-1 text-[#8E8E93] text-sm font-bold uppercase tracking-wide hover:text-black dark:hover:text-white transition-colors focus:outline-none"
                    >
                        {timeRange} View <ChevronDown size={14} />
                    </button>
                    
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-[#2C2C2E] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden z-20 animate-fade-up">
                            {Object.keys(mockData).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => handleRangeChange(range as TimeRange)}
                                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${timeRange === range ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    )}
                 </div>
                 <p className="text-4xl font-bold text-black dark:text-white mt-1 transition-all duration-500">
                    {totalConsumption.toLocaleString()} <span className="text-xl text-[#8E8E93] font-medium">kWh</span>
                 </p>
             </div>
             <div className="bg-[#34C759]/10 text-[#34C759] px-3 py-1 rounded-full text-xs font-bold">
                 -12% vs last {timeRange.toLowerCase()}
             </div>
         </div>
         <div className="h-48">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                    data={currentData} 
                    onClick={(data: any) => {
                        if (data && typeof data.activeTooltipIndex === 'number') {
                            setActiveIndex(data.activeTooltipIndex);
                        }
                    }}
                >
                    <Tooltip 
                        cursor={{fill: 'transparent'}} 
                        contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#2C2C2E', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#fff' }}
                    />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: tickColor, fontSize: 12, fontWeight: 600 }} 
                        dy={10}
                        interval={0}
                    />
                    <Bar dataKey="consumption" radius={[6, 6, 6, 6]}>
                        {currentData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={index === activeIndex ? "#007AFF" : (theme === 'dark' ? '#3A3A3C' : '#E5E5EA')} 
                                className="transition-all duration-300" 
                            />
                        ))}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
         </div>
      </div>

      {/* Insight Button */}
      <div className="mb-8">
          {!insight ? (
            <button onClick={handleAnalyze} disabled={isThinking} className="w-full bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-center justify-center gap-3 text-blue-600 dark:text-blue-400 font-bold transition-all hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Bot size={20} className={isThinking ? "animate-bounce" : ""} />
                {isThinking ? "Thinking..." : "Generate AI Report"}
            </button>
          ) : (
              <div className="bg-gray-50 dark:bg-[#2C2C2E] border border-gray-100 dark:border-white/5 p-5 rounded-3xl animate-fade-up">
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-3">
                          <Bot size={20} className="text-blue-500"/>
                          <h4 className="font-bold text-black dark:text-white">Analysis</h4>
                      </div>
                      <button onClick={() => setInsight('')} className="text-xs text-gray-400 hover:text-black dark:hover:text-white">Clear</button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{insight}</p>
              </div>
          )}
      </div>

      {/* Billing History */}
      <h2 className="text-lg font-bold mb-4 px-2 text-black dark:text-white">Recent Invoices</h2>
      <div className="space-y-3 pb-24">
          {[
              { month: 'October', amount: '$124.50', status: 'Unpaid' },
              { month: 'September', amount: '$112.20', status: 'Paid' },
              { month: 'August', amount: '$145.00', status: 'Paid' }
          ].map((bill, i) => (
              <div key={i} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl flex items-center justify-between shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-white/5 transition-all">
                  <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bill.status === 'Paid' ? 'bg-gray-100 dark:bg-white/10 text-gray-400' : 'bg-red-100 dark:bg-red-900/20 text-red-500'}`}>
                          {bill.status === 'Paid' ? <CheckCircle size={20} /> : <span className="font-bold text-xs">!</span>}
                      </div>
                      <div>
                          <p className="font-bold text-black dark:text-white">{bill.month}</p>
                          <p className="text-xs text-gray-400">Invoice #00{8932 + i}</p>
                      </div>
                  </div>
                  <div className="text-right">
                      <p className="font-bold text-black dark:text-white">{bill.amount}</p>
                      {bill.status === 'Unpaid' ? (
                          <button className="text-xs font-bold text-white bg-black dark:bg-white dark:text-black px-3 py-1 rounded-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500">Pay</button>
                      ) : (
                          <button className="text-gray-400 hover:text-black dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"><Download size={16}/></button>
                      )}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}
