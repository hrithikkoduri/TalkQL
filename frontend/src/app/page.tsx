'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon, ServerIcon } from '@heroicons/react/24/outline';

type DBType = 'sqlite' | 'mysql' | 'postgresql' | 'mssql';

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
        {paramFields[selectedDB].map((field) => (
          <div key={field}>
            <label 
              htmlFor={field}
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Connect Database
        </button>
      </form>
    );
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Connect to Database</h2>
            
            {/* Connection message - Updated styling */}
            {connectionMessage && (
              <div 
                className={`mb-4 p-4 rounded-md ${
                  isConnected 
                    ? 'bg-green-100 text-green-700 border border-green-400' 
                    : 'bg-red-100 text-red-700 border border-red-400'
                }`}
                role="alert"
              >
                <p className="font-medium">{connectionMessage}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              {(['sqlite', 'mysql', 'postgresql', 'mssql'] as const).map((dbType) => (
                <button
                  key={dbType}
                  onClick={() => setSelectedDB(dbType)}
                  disabled={isConnecting}
                  className={`p-4 border rounded-lg text-center ${
                    selectedDB === dbType ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  } ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'}`}
                >
                  {dbType.toUpperCase()}
                </button>
              ))}
            </div>

            {renderDBParamsForm()}

            {/* Loading overlay */}
            {isConnecting && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-lg">Connecting to database...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Query form will go here */}
            <h2 className="text-xl font-semibold mb-4">Connected Successfully!</h2>
            {/* Add your query form components here */}
          </div>
        )}
      </div>
    </main>
  );
}