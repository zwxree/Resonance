
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ArrowUp, MapPin, Globe } from 'lucide-react';
import { sendMessageToChat, startChat } from '../services/geminiService';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  groundingChunks?: any[];
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
    { text: "Hello! I'm Aetherkraft AI, your personal energy assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                startChat({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            () => {
                startChat(); // Permission denied or error
            }
        );
    } else {
        startChat();
    }
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
    
    const groundingChunks = response.groundingMetadata?.groundingChunks;
    
    const botMessage: Message = { 
        text: response.text, 
        sender: 'bot',
        groundingChunks
    };
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
     setTimeout(() => inputRef.current?.focus(), 10);
  };

  const renderGroundingSources = (chunks: any[]) => {
      if (!chunks || chunks.length === 0) return null;

      const sources = chunks.reduce((acc: any[], chunk: any) => {
          if (chunk.web) {
              acc.push({ type: 'web', ...chunk.web });
          } else if (chunk.maps) {
             acc.push({ type: 'maps', ...chunk.maps });
          }
          return acc;
      }, []);

      if (sources.length === 0) return null;

      return (
          <div className="mt-3 pt-3 border-t border-white/10 text-xs">
              <p className="text-apple-gray-300 mb-1.5 font-semibold">Sources:</p>
              <div className="flex flex-wrap gap-2">
                  {sources.map((source: any, i: number) => (
                      <a 
                        key={i} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center bg-black/20 hover:bg-black/40 text-electric-blue-500 px-2 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-electric-blue-500"
                        aria-label={`Source: ${source.title || 'Link'}`}
                      >
                          {source.type === 'maps' ? <MapPin size={10} className="mr-1"/> : <Globe size={10} className="mr-1"/>}
                          <span className="truncate max-w-[150px]">{source.title || 'Link'}</span>
                      </a>
                  ))}
              </div>
          </div>
      )
  }

  return (
    <div className="px-5 pt-12 pb-6 h-[calc(100vh-8rem)] flex flex-col">
        <header className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold">Aetherkraft AI</h1>
             <p className="text-apple-gray-300">Your personal energy assistant.</p>
        </header>

        <div className="flex-1 overflow-y-auto space-y-6 -mr-4 pr-4" aria-live="polite">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-apple-gray-500 flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-electric-blue-500" /></div>}
              <div className={`px-4 py-3 rounded-2xl max-w-xs md:max-w-sm text-lg ${msg.sender === 'user' ? 'bg-electric-blue-500 text-white' : 'bg-apple-gray-500 text-white'}`}>
                {msg.text}
                {msg.groundingChunks && renderGroundingSources(msg.groundingChunks)}
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
          <div className="flex items-center bg-black/30 backdrop-blur-lg rounded-full border border-white/10 p-1.5 shadow-lg focus-within:ring-2 focus-within:ring-electric-blue-500">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Aetherkraft..."
              aria-label="Chat Input"
              className="w-full bg-transparent p-3 text-white placeholder-apple-gray-300 focus:outline-none"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              aria-label="Send Message"
              className="w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 disabled:bg-apple-gray-500 bg-electric-blue-500 text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-electric-blue-500" 
              disabled={isLoading || !input.trim()}
            >
              <ArrowUp size={24} />
            </button>
          </div>
        </form>
    </div>
  );
}
