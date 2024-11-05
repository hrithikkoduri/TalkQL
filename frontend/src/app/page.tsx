'use client';

import { useState, useEffect } from 'react';
import { 
  ServerIcon,
  CheckCircleIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

type DBType = 'sqlite' | 'mysql' | 'postgresql' | 'mssql';
const dbLogos = {
  sqlite: '/images/databases/sqlite.png',
  mysql: '/images/databases/mysql.png',
  postgresql: '/images/databases/postgresql.png',
  mssql: '/images/databases/mssql.png',
} as const;

interface DBParams {
  sqlite: {
    url?: string;
    db_path?: string;
  };
  mysql: {
    user: string;
    password: string;
    host: string;
    port: string;
    database: string;
  };
  postgresql: {
    user: string;
    password: string;
    host: string;
    port: string;
    database: string;
  };
  mssql: {
    user: string;
    password: string;
    host: string;
    port: string;
    database: string;
    driver: string;
  };
}



export default function Home() {
  // ... existing state ...
  const [selectedDB, setSelectedDB] = useState<DBType | null>(null);
  const [dbParams, setDBParams] = useState<Record<string, string>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);

  // Clear success message after 2 seconds
  useEffect(() => {
    if (connectionMessage && isConnected) {  // Only clear if it's a success message
      const timer = setTimeout(() => {
        setConnectionMessage(null);
        setIsConnected(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [connectionMessage, isConnected]);

  const handleDBConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setConnectionMessage(null); // Clear any existing messages
    
    try {
      const response = await fetch('http://localhost:8000/add-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          db_type: selectedDB,
          connection_params: dbParams,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsConnected(true);
        setConnectionMessage(data.message || 'Database connected successfully');
      } else {
        setIsConnected(false);
        setConnectionMessage(data.detail || 'Failed to connect to database');
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionMessage('Error connecting to database');
      console.error('Error connecting to database:', error);
    } finally {
      setIsConnecting(false);
    }
  };


  const renderDBParamsForm = () => {
    if (!selectedDB) return null;

    const paramFields = {
      sqlite: ['url', 'db_path'],
      mysql: ['user', 'password', 'host', 'port', 'database'],
      postgresql: ['user', 'password', 'host', 'port', 'database'],
      mssql: ['user', 'password', 'host', 'port', 'database', 'driver'],
    };


    return (
      <form onSubmit={handleDBConnect} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {paramFields[selectedDB].map((field) => (
            <div key={field} className="space-y-1">
              <label 
                htmlFor={field}
                className="block text-sm font-medium text-gray-700"
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field === 'password' ? 'password' : 'text'}
                id={field}
                value={dbParams[field] || ''}
                onChange={(e) => setDBParams(prev => ({
                  ...prev,
                  [field]: e.target.value
                }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder={`Enter ${field}`}
              />
            </div>
          ))}
        </div>
        <div className="pt-4">
          <button
            type="submit"
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Connect Database'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 py-1">
      <div className={`transition-all duration-500 mx-auto px-2 ${
        selectedDB ? 'max-w-5xl' : 'max-w-2xl'  // Changed from max-w-4xl to max-w-3xl
      }`}>
        {/* Header with Logo */}
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative w-40 h-40"> {/* Adjust size as needed */}
              <Image
                src="/images/logo/TalkQL_logo.png"
                alt="TalkQL Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Database Connection Hub
          </h1>
          <p className="text-gray-600 mb-4">
            Connect to your preferred database and start querying
          </p>
        </div>

        {!isConnected ? (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            {/* Centered heading */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center justify-center gap-2">
                <ServerIcon className="h-6 w-6 text-blue-500" />
                Connect to Database
              </h2>
            </div>
            
            {/* Connection message */}
            {connectionMessage && (
              <div 
                className={`mb-6 p-4 rounded-lg flex items-center justify-center space-x-2 ${
                  connectionMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
                role="alert"
              >
                {connectionMessage.includes('successfully') ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <p className="font-medium">{connectionMessage}</p>
              </div>
            )}

             {/* Flex container - Updated with conditional max-width */}
            <div className={`flex gap-8 transition-all duration-500 ease-in-out ${
              selectedDB ? 'max-w-5xl' : 'max-w-2xl mx-auto'  // Changed from max-w-4xl to max-w-3xl
            }`}>
              {/* Database Selection */}
              <div className={`transition-all duration-500 ${
                selectedDB ? 'w-1/2' : 'w-full'
              }`}>
                <div className="grid grid-cols-2 gap-6"> {/* Reduced gap from 8 to 6 */}
                  {(['sqlite', 'mysql', 'postgresql', 'mssql'] as const).map((dbType) => (
                    <button
                      key={dbType}
                      onClick={() => setSelectedDB(dbType)}
                      disabled={isConnecting}
                      className={`
                        p-8 rounded-lg transition-all duration-200 flex items-center justify-center
                        ${selectedDB === dbType 
                          ? 'bg-blue-50 border-2 border-blue-500 shadow-sm' 
                          : 'border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50'
                        }
                        ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        aspect-square
                      `}
                    >
                      <div className="relative w-40 h-40"> {/* Slightly reduced from w-48 h-48 */}
                        <Image
                          src={dbLogos[dbType]}
                          alt={`${dbType} database`}
                          fill
                          className="object-contain p-6"
                          priority
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Connection Form - Slides in from right */}
              <div className={`transition-all duration-500 ease-in-out ${
                selectedDB 
                  ? 'w-1/2 opacity-100 translate-x-0' 
                  : 'w-0 opacity-0 translate-x-full'
              }`}>
                {selectedDB && (
                  <div className="bg-gray-50 rounded-lg p-8 border border-gray-100 h-full">
                    <h3 className="text-lg font-medium text-gray-800 mb-6">
                      Connection Details
                    </h3>
                    {renderDBParamsForm()}
                  </div>
                )}
              </div>
            </div>
          

            {/* Loading Overlay */}
            {isConnecting && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full mx-4">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-lg text-gray-700">Connecting to database...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-800">
                Connected Successfully!
              </h2>
            </div>
            {/* Add your query form components here */}
          </div>
        )}
      </div>
    </main>
  );
}