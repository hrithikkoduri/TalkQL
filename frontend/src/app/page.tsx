'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DatabaseGrid } from '@/components/database/DatabaseGrid';
import { ConnectionForm } from '@/components/database/ConnectionForm';
import { LoadingOverlay } from '@/components/database/LoadingOverlay';
import { DBType } from '@/types/database';
import { ServerIcon, CheckCircleIcon, BeakerIcon } from '@heroicons/react/24/outline';

const dbLogos = {
  sqlite: '/images/databases/sqlite.png',
  mysql: '/images/databases/mysql.png',
  postgresql: '/images/databases/postgresql.png',
  mssql: '/images/databases/mssql.png',
} as const;

export default function Home() {
  const [selectedDB, setSelectedDB] = useState<DBType | null>(null);
  const [dbParams, setDBParams] = useState<Record<string, string>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDBSelect = (dbType: DBType) => {
    if (selectedDB === dbType) {
      // If clicking the same database again, close the form
      setSelectedDB(null);
      setDBParams({}); // Clear form data when closing
      setError(null); // Clear any errors
    } else {
      // If clicking a different database, show its form
      setSelectedDB(dbType);
      setDBParams({}); // Clear previous form data
      setError(null); // Clear any errors
    }
  };

  const handleDBConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setError(null);
    
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
      } else {
        setError(data.detail || 'Failed to connect to database');
      }
    } catch (error) {
      setError('Error connecting to database');
      console.error('Error connecting to database:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-8 pb-12 px-4">
      <div className={`transition-all duration-500 mx-auto ${
        selectedDB ? 'max-w-6xl' : 'max-w-2xl'
      }`}>
        <Header />
        
        {!isConnected ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/50 p-8">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl font-bold text-gray-900">
                Database Connection Hub
              </h2>
              <p className="text-lg text-gray-600">
                Connect to your preferred database and start querying
              </p>
              <p className="text-gray-500">
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

            <div className="flex gap-8">
              <DatabaseGrid
                selectedDB={selectedDB}
                isConnecting={isConnecting}
                onSelectDB={handleDBSelect}
                dbLogos={dbLogos}
              />

              <div className={`transition-all duration-500 ease-in-out ${
                selectedDB 
                  ? 'w-1/2 opacity-100 translate-x-0' 
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
                      onParamChange={(field, value) => 
                        setDBParams(prev => ({ ...prev, [field]: value }))
                      }
                      onSubmit={handleDBConnect}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/50 p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
            <div className="inline-flex items-center justify-center p-4 bg-green-50 rounded-full mb-6 shadow-sm">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-green-700 mb-3">
              Connected Successfully!
            </h2>
            <p className="text-gray-600 mb-8">
              Your database is now connected and ready for queries
            </p>
            <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full" />
          </div>
        )}
      </div>
      <LoadingOverlay isVisible={isConnecting} />
    </main>
  );
}