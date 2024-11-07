'use client';

import { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
  }

  export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
    const [message, setMessage] = useState('');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage(message);
        setMessage('');
      }
    };
  
    return (
        <div className="fixed bottom-6 left-0 right-0 px-24">
        <form onSubmit={handleSubmit} className="max-w-[75rem] mx-auto">
        <div className={`relative flex gap-3 backdrop-blur-lg rounded-full shadow-xl 
            border p-3 hover:shadow-2xl transition-all duration-300
            ${isLoading ? 'border-transparent' : 'border-gray-100/50'}
            ${isLoading ? 'bg-white/70' : 'bg-white/80'}`}>

            
            {/* Animated glowing gradient */}
            {isLoading && (
              <>
                {/* Base glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-blue-400/30 
                  blur-md animate-[gradient-glow_3s_ease-in-out_infinite]
                  [background-size:200%_200%]" />
                
                {/* Sharper inner glow */}
                <div className="absolute inset-[1px] rounded-full bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-blue-400/10 
                  animate-[gradient-glow_3s_ease-in-out_infinite] [background-size:200%_200%]" />
              </>
            )}
  
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question about your data..."
              className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 
                placeholder-gray-400 rounded-full px-8 py-3 text-base"
            />
            <button
                type="submit"
                disabled={isLoading}
                className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white
                  shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    );
  };