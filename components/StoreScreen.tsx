import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ArrowUp } from 'lucide-react';
import { sendMessageToChat, startChat } from '../services/geminiService';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const ResonanceLoader = () => (
    <div className="flex space-x-1">
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
    </div>
);

export default function AiScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm Joule, your personal energy assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startChat();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await sendMessageToChat(input);
    const botMessage: Message = { text: response, sender: 'bot' };
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
     setTimeout(() => inputRef.current?.focus(), 10);
  };

  return (
    <div className="px-5 pt-12 pb-6 h-[calc(100vh-8rem)] flex flex-col">
        <header className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold">Joule AI</h1>
             <p className="text-apple-gray-300">Your personal energy assistant.</p>
        </header>

        <div className="flex-1 overflow-y-auto space-y-6 -mr-4 pr-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-apple-gray-500 flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-electric-blue-500" /></div>}
              <div className={`px-4 py-3 rounded-2xl max-w-xs md:max-w-sm text-lg ${msg.sender === 'user' ? 'bg-electric-blue-500 text-white' : 'bg-apple-gray-500 text-white'}`}>
                {msg.text}
              </div>
            </div>
          ))}
           {isLoading && (
              <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-apple-gray-500 flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-electric-blue-500" /></div>
                 <div className="px-4 py-3 rounded-2xl bg-apple-gray-500 flex items-center justify-center">
                     <ResonanceLoader />
                 </div>
              </div>
           )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSend} className="mt-6">
          <div className="flex items-center bg-black/30 backdrop-blur-lg rounded-full border border-white/10 p-1.5 shadow-lg">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Joule..."
              className="w-full bg-transparent p-3 text-white placeholder-apple-gray-300 focus:outline-none"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 disabled:bg-apple-gray-500 bg-electric-blue-500 text-white" 
              disabled={isLoading || !input.trim()}
            >
              <ArrowUp size={24} />
            </button>
          </div>
        </form>
    </div>
  );
}