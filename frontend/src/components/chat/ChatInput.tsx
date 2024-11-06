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
        <div className="fixed bottom-6 left-0 right-0 px-12">
        <form onSubmit={handleSubmit} className="max-w-[85rem] mx-auto">
        <div className={`relative flex gap-3 backdrop-blur-lg rounded-3xl shadow-xl 
            border p-2 hover:shadow-2xl transition-all duration-300
            ${isLoading ? 'border-transparent' : 'border-gray-100/50'}
            ${isLoading ? 'bg-white/70' : 'bg-white/80'}`}>

            
            {/* Animated glowing gradient */}
            {isLoading && (
              <>
                {/* Base glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-blue-400/30 
                  blur-md animate-[gradient-glow_3s_ease-in-out_infinite]
                  [background-size:200%_200%]" />
                
                {/* Sharper inner glow */}
                <div className="absolute inset-[1px] rounded-xl bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-blue-400/10 
                  animate-[gradient-glow_3s_ease-in-out_infinite] [background-size:200%_200%]" />
              </>
            )}
  
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question about your data..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-gray-700 
                text-lg placeholder:text-gray-400 disabled:cursor-wait relative z-10"
            />
            <button
                type="submit"
                disabled={isLoading}
                className={`p-3 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                    hover:from-blue-700 hover:to-purple-700 transition-all duration-200 
                    shadow-md hover:shadow-lg hover:-translate-y-0.5 relative z-10
                    ${isLoading ? 'opacity-50 cursor-wait animate-pulse' : ''}`}
                >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    );
  };