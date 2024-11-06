'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/layout/Logo';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { DisconnectButton } from '@/components/ui/DisconnectButton';
import { Header } from '@/components/layout/Header';
import { ToggleSwitch } from '@/components/common/ToggleSwitch';
import { Message } from '@/types/chat';

export default function DatabaseChat() {
    const [vizEnabled, setVizEnabled] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showInitialText, setShowInitialText] = useState(true);
    const [isEntering, setIsEntering] = useState(false);
    const [connectedDBInfo, setConnectedDBInfo] = useState<{
      type: string;
      name: string;
    } | null>(null);
  
    useEffect(() => {
      const checkConnection = async () => {
        try {
          const response = await fetch('http://localhost:8000/check-connection');
          const data = await response.json();
          if (data.is_connected) {
            setConnectedDBInfo({
              type: data.db_type,
              name: data.database_name || 'Database'
            });
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      };
  
      checkConnection();
      setTimeout(() => setIsEntering(true), 100);
    }, []);
  
    const handleSendMessage = async (message: string) => {
        try {
          setIsLoading(true);
          setShowInitialText(false);
          setMessages(prev => [...prev, { 
            role: 'user', 
            content: message 
          }]);
      
          const response = await fetch('http://localhost:8000/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              query: message,
              vizEnabled: vizEnabled 
            }),
          });
        
      
          if (!response.ok) {
            throw new Error('Failed to get response');
          }
      
          const data = await response.json();
          
          const formatTableName = (text: string) => {
            return text.replace(/\*\*(.*?)\*\*/g, '__$1__');  // Using underscores for bold
          };
          
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `SQL Query Used:\n\`\`\`sql\n${data.query_used || 'Query not available'}\n\`\`\`\n\nResult:\n${formatTableName(data.query_result)}`,
            viz_result: data.viz_result,
            vizEnabledState: vizEnabled  // Store current visualization state
          }]);
        } catch (error) {
            console.error('Error querying database:', error);
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: 'Sorry, I encountered an error processing your query.' 
            }]);
          }  finally {
            setIsLoading(false);
          }
        };
    const handleDisconnect = async () => {
      try {
        const response = await fetch('http://localhost:8000/disconnect-database', {
          method: 'POST'
        });
        if (response.ok) {
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
    };
  
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Logo minimal isTransitioning />

          <div className="fixed top-24 left-6 z-[100] animate-fade-in">
        <ToggleSwitch enabled={vizEnabled} setEnabled={setVizEnabled} />
        </div>
          
          {connectedDBInfo && (
            <div className="fixed top-4 right-4 z-[100]">
              <DisconnectButton
                dbType={connectedDBInfo.type}
                dbName={connectedDBInfo.name}
                onDisconnect={handleDisconnect}
              />
            </div>
          )}
          
          <div className="flex flex-col h-[calc(100vh-5rem)] pt-20">
            {showInitialText && (
              <div className="text-center text-gray-500 mt-12 animate-fade-in">
                Start a conversation with your database
              </div>
            )}

            <div className="relative flex-1 overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto">
            <div className="max-w-[85rem] mx-auto">
              <ChatMessages 
                messages={messages} 
                isLoading={isLoading} 
                vizEnabled={vizEnabled}
              />
            </div>
          </div>
        </div>
            
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      );
    }