
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { sendMessageToChat, startChat } from '../services/geminiService';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatBot({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm the Resonance assistant. How can I help you manage your energy today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startChat();
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
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-resonance-gray-800 w-full max-w-md h-[80vh] flex flex-col rounded-2xl shadow-2xl m-4">
        <header className="flex items-center justify-between p-4 border-b border-resonance-gray-700">
          <div className="flex items-center space-x-2">
            <Bot className="text-electric-blue-500" />
            <h2 className="text-lg font-bold">Resonance AI</h2>
          </div>
          <button onClick={onClose} className="text-resonance-gray-500 hover:text-white">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-resonance-gray-700 flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-electric-blue-500" /></div>}
              <div className={`p-3 rounded-lg max-w-xs md:max-w-sm ${msg.sender === 'user' ? 'bg-electric-blue-500 text-white rounded-br-none' : 'bg-resonance-gray-700 text-white rounded-bl-none'}`}>
                {msg.text}
              </div>
              {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-resonance-gray-600 flex items-center justify-center flex-shrink-0"><User size={20} className="text-white" /></div>}
            </div>
          ))}
           {isLoading && (
              <div className="flex items-start space-x-3">
                 <div className="w-8 h-8 rounded-full bg-resonance-gray-700 flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-electric-blue-500" /></div>
                 <div className="p-3 rounded-lg bg-resonance-gray-700 rounded-bl-none">
                     <Loader2 className="animate-spin text-white" size={20} />
                 </div>
              </div>
           )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSend} className="p-4 border-t border-resonance-gray-700">
          <div className="flex items-center bg-resonance-gray-700 rounded-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full bg-transparent p-3 text-white placeholder-resonance-gray-500 focus:outline-none"
              disabled={isLoading}
            />
            <button type="submit" className="p-3 text-electric-blue-500 disabled:text-resonance-gray-600" disabled={isLoading || !input.trim()}>
              <Send size={24} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
