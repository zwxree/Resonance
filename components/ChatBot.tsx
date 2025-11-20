import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
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

export default function ChatBot({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm the Aetherkraft assistant. How can I help you manage your energy today?", sender: 'bot' }
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
    // ChatBot currently doesn't support grounding UI, just text.
    const botMessage: Message = { text: response.text, sender: 'bot' };
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
      <div className="bg-apple-gray-600 w-full max-w-md h-[80vh] flex flex-col rounded-2xl shadow-2xl m-4 border border-white/10">
        <header className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Bot className="text-electric-blue-500" />
            <h2 className="text-lg font-bold">Aetherkraft AI</h2>
          </div>
          <button onClick={onClose} className="text-apple-gray-300 hover:text-white">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-apple-gray-500 flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-electric-blue-500" /></div>}
              <div className={`p-3 rounded-lg max-w-xs md:max-w-sm ${msg.sender === 'user' ? 'bg-electric-blue-500 text-white' : 'bg-apple-gray-500 text-white'}`}>
                {msg.text}
              </div>
              {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-apple-gray-400 flex items-center justify-center flex-shrink-0"><User size={20} className="text-white" /></div>}
            </div>
          ))}
           {isLoading && (
              <div className="flex items-start space-x-3">
                 <div className="w-8 h-8 rounded-full bg-apple-gray-500 flex items-center justify-center flex-shrink-0"><Bot size={20} className="text-electric-blue-500" /></div>
                 <div className="p-3 rounded-lg bg-apple-gray-500 flex items-center justify-center">
                     <ResonanceLoader />
                 </div>
              </div>
           )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSend} className="p-4 border-t border-white/10">
          <div className="flex items-center bg-apple-gray-500 rounded-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full bg-transparent p-3 text-white placeholder-apple-gray-300 focus:outline-none"
              disabled={isLoading}
            />
            <button type="submit" className="p-3 text-electric-blue-500 disabled:text-apple-gray-400" disabled={isLoading || !input.trim()}>
              <Send size={24} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}