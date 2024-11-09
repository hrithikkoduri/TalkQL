'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { DatabaseGrid } from '@/components/database/DatabaseGrid';
import { ConnectionForm } from '@/components/database/ConnectionForm';
import { LoadingOverlay } from '@/components/database/LoadingOverlay';
import { StartupLoader } from '@/components/ui/StartupLoader';
import { DBParams, DBType } from '@/types/database';
import { DisconnectButton } from '@/components/ui/DisconnectButton';
import { ServerIcon, CheckCircleIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { ConnectionSuccess } from '@/components/database/ConnectionSuccess';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/layout/Logo';  // Add this import
import { StartPage } from '@/components/landing/StartPage';
import { FeaturesList } from '@/components/features/FeaturesList';
import { BackgroundEffect } from '@/components/effects/BackgroundEffect';



const dbLogos = {
  sqlite: '/images/databases/sqlite.png',
  mysql: '/images/databases/mysql.png',
  postgresql: '/images/databases/postgresql.png',
  mssql: '/images/databases/mssql.png',
  snowflake: '/images/databases/snowflake.png',
  csv: '/images/databases/csv.png'
} as const;

export default function Home() {
  const router = useRouter();
  const [showStartPage, setShowStartPage] = useState(true);
  const [isStartPageExiting, setIsStartPageExiting] = useState(false);
  const [selectedDB, setSelectedDB] = useState<DBType | null>(null);
  const [dbParams, setDBParams] = useState<Record<string, string | File>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isExitingSuccess, setIsExitingSuccess] = useState(false);
  const [isHeaderExiting, setIsHeaderExiting] = useState(false);

  const handleChatTransition = () => {
    setIsExitingSuccess(true);
    setIsHeaderExiting(true);
    // Wait for animation to complete before navigation
    setTimeout(() => {
      router.push('/chat');
    }, 500);
  };

  const handleStart = () => {
    setIsStartPageExiting(true);
    setTimeout(() => {
      setShowStartPage(false);
    }, 700);
  };

  const [connectedDBInfo, setConnectedDBInfo] = useState<{
    type: DBType;
    name: string;
  } | null>(null);

  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const response = await fetch('http://localhost:8000/check-connection');
        if (!response.ok) {
          throw new Error('Failed to check connection');
        }
        
        const data = await response.json();
        
        if (data.is_connected && data.db_type) {
          setIsConnected(true);
          setConnectedDBInfo({
            type: data.db_type as DBType,
            name: data.database_name || 'Database'
          });
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      } finally {
        setTimeout(() => {
          setIsInitializing(false);
        }, 800);
      }
    };
  
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsInitializing(false);
    }, 5000); // 5 second timeout
  
    checkExistingConnection();
  
    return () => clearTimeout(timeoutId);
  }, []);

  const handleDisconnect = async () => {
    try {
      const response = await fetch('http://localhost:8000/disconnect-database', {
        method: 'POST'
      });

      if (response.ok) {
        setIsConnected(false);
        setConnectedDBInfo(null);
        setSelectedDB(null);
        setDBParams({});
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleDBSelect = (dbType: DBType | null) => {
    setSelectedDB(dbType);
    if (!dbType) {
      setDBParams({});
    }
  };

  const handleDBConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      if (selectedDB === 'csv') {
        const csvParams = dbParams as DBParams['csv'];
        if (csvParams.file) {
          formData.append('file', csvParams.file);
          formData.append('connection', JSON.stringify({
            db_type: selectedDB,
            connection_params: {}
          }));
        } else if (csvParams.url) {
          formData.append('connection', JSON.stringify({
            db_type: selectedDB,
            connection_params: {
              url: csvParams.url
            }
          }));
        }
      } else {
        formData.append('connection', JSON.stringify({
          db_type: selectedDB,
          connection_params: dbParams
        }));
      }

      const response = await fetch('http://localhost:8000/add-database', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to connect to database');
      }

      const data = await response.json();
      setIsConnected(true);
      setConnectedDBInfo({
        type: selectedDB!,
        name: selectedDB === 'csv' 
          ? ((dbParams as DBParams['csv']).file?.name || 'CSV Data') 
          : (dbParams as any).database || (dbParams as any).db_path || 'Database'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleParamChange = (field: string, value: string | File) => {
    setDBParams(prev => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-40 pb-12 px-4 relative">
      <div className="absolute inset-0 z-0">
        <BackgroundEffect />
      </div>
      <div className="relative z-10">
        {showStartPage && (
          <StartPage onStart={handleStart} isExiting={isStartPageExiting} />
        )}
        <FeaturesList />
        {isInitializing ? (
          <StartupLoader />
        ) : (
          <>
            {isConnected && connectedDBInfo && (
              <div className="fixed top-4 right-4 z-[100]">
                <DisconnectButton
                  dbType={connectedDBInfo.type}
                  dbName={connectedDBInfo.name}
                  onDisconnect={handleDisconnect}
                />
              </div>
            )}

            <div className={`transition-all duration-500 mx-auto ${
              selectedDB ? 'max-w-[90rem]' : 'max-w-3xl'
            }`}>
              <Logo isTransitioning={isHeaderExiting} />
              
              {isConnected ? (
                <div className="space-y-8 mt-16">
                  <ConnectionSuccess isExiting={isExitingSuccess} />
                  
                  <div className={`text-center transition-all duration-500 transform ${
                    isExitingSuccess ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'
                  }`}>
                    <button
                      onClick={handleChatTransition}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 
                        text-white rounded-xl font-medium shadow-lg hover:shadow-xl 
                        transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                      Talk to Your Database
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`bg-white/80 backdrop-blur-lg rounded-2xl shadow-card hover:shadow-card-hover border border-gray-100/50 p-8 relative overflow-hidden transition-all duration-300 ${
                  selectedDB ? 'min-h-[800px]' : 'min-h-[550px]'
                }`}>               
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
                  <div className="text-center space-y-4 mb-8">
                    <h2 className="text-3xl font-bold text-gray-500">
                      Database Connection Hub
                    </h2>
                    <p className="text-xl text-gray-400">
                      Unlock the power of natural conversations with your data
                    </p>
                    <p className="text-gray-400">
                      Select your database type and enter connection details
                    </p>
                  </div>
                  
                  {error && (
                    <div className="mb-8 p-4 rounded-xl flex items-center space-x-3 bg-red-50 text-red-700 border border-red-100 shadow-sm animate-shake">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-9 justify-center items-start h-full ">
                    <DatabaseGrid
                      selectedDB={selectedDB}
                      isConnecting={isConnecting}
                      onSelectDB={handleDBSelect}
                      dbLogos={dbLogos}
                    />

                    <div className={`transition-all duration-500 ease-in-out ${
                      selectedDB 
                        ? 'w-[700px] opacity-100 translate-x-0' 
                        : 'w-0 opacity-0 translate-x-full'
                    }`}>
                      {selectedDB && (
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 shadow-lg">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm">
                              <BeakerIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                              Connection Details
                            </h3>
                          </div>
                          <ConnectionForm
                            selectedDB={selectedDB}
                            dbParams={dbParams}
                            isConnecting={isConnecting}
                            onParamChange={handleParamChange}
                            onSubmit={handleDBConnect}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <LoadingOverlay isVisible={isConnecting} />
          </>
        )}
      </div>
    </main>
  );
}