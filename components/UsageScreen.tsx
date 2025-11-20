
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyzeWithThinkingMode } from '../services/geminiService';
import { Bot, Download, CheckCircle } from 'lucide-react';

const dailyData = [
  { name: 'M', consumption: 15 }, { name: 'T', consumption: 18 }, { name: 'W', consumption: 22 },
  { name: 'T', consumption: 20 }, { name: 'F', consumption: 25 }, { name: 'S', consumption: 30 },
  { name: 'S', consumption: 28 },
];

export default function StatsScreen() {
  const [activeIndex, setActiveIndex] = useState(6);
  const [isThinking, setIsThinking] = useState(false);
  const [insight, setInsight] = useState('');

  const handleAnalyze = async () => {
      setIsThinking(true);
      const res = await analyzeWithThinkingMode(`Review this energy data: ${JSON.stringify(dailyData)}. Brief 2 sentence summary.`);
      setInsight(res);
      setIsThinking(false);
  }

  return (
    <div className="px-4 pt-12 pb-6">
      <h1 className="text-3xl font-extrabold mb-6 px-2 text-black dark:text-white">Usage & Billing</h1>

      {/* Chart Card */}
      <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-[32px] shadow-sm mb-6">
         <div className="flex justify-between items-end mb-6">
             <div>
                 <p className="text-gray-400 text-sm font-medium uppercase">This Week</p>
                 <p className="text-4xl font-bold text-black dark:text-white mt-1">158 <span className="text-xl text-gray-400">kWh</span></p>
             </div>
             <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                 -12% vs last week
             </div>
         </div>
         <div className="h-48">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} onClick={(data, index) => setActiveIndex(index)}>
                    <Tooltip 
                        cursor={{fill: 'transparent'}} 
                        contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#000', color: '#fff' }}
                    />
                    <Bar dataKey="consumption" radius={[6, 6, 6, 6]}>
                        {dailyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === activeIndex ? "#000" : "#E5E5E5"} className="dark:fill-[index === activeIndex ? '#FFF' : '#333'] transition-all duration-300" />
                        ))}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
         </div>
      </div>

      {/* Insight Button */}
      <div className="mb-8">
          {!insight ? (
            <button onClick={handleAnalyze} disabled={isThinking} className="w-full bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-center justify-center gap-3 text-blue-600 dark:text-blue-400 font-bold transition-all hover:bg-blue-100 dark:hover:bg-blue-900/30">
                <Bot size={20} className={isThinking ? "animate-bounce" : ""} />
                {isThinking ? "Thinking..." : "Generate AI Report"}
            </button>
          ) : (
              <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-white/5 p-5 rounded-3xl animate-fade-up">
                  <div className="flex gap-3 mb-2">
                      <Bot size={20} className="text-blue-500"/>
                      <h4 className="font-bold text-black dark:text-white">Analysis</h4>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{insight}</p>
              </div>
          )}
      </div>

      {/* Billing History */}
      <h2 className="text-lg font-bold mb-4 px-2 text-black dark:text-white">Recent Invoices</h2>
      <div className="space-y-3">
          {[
              { month: 'October', amount: '$124.50', status: 'Unpaid' },
              { month: 'September', amount: '$112.20', status: 'Paid' },
              { month: 'August', amount: '$145.00', status: 'Paid' }
          ].map((bill, i) => (
              <div key={i} className="bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl flex items-center justify-between shadow-sm">
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
                          <button className="text-xs font-bold text-white bg-black dark:bg-white dark:text-black px-3 py-1 rounded-full mt-1">Pay</button>
                      ) : (
                          <button className="text-gray-400 hover:text-black dark:hover:text-white"><Download size={16}/></button>
                      )}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}
