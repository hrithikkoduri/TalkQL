import { DBType, DBParams } from '@/types/database';
import { ArrowRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface ConnectionFormProps {
  selectedDB: DBType;
  dbParams: Record<string, string>;
  isConnecting: boolean;
  onParamChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ConnectionForm = ({
  selectedDB,
  dbParams,
  isConnecting,
  onParamChange,
  onSubmit,
}: ConnectionFormProps) => {
  const paramFields = {
    sqlite: ['url', 'db_path'],
    mysql: ['user', 'password', 'host', 'port', 'database'],
    postgresql: ['user', 'password', 'host', 'port', 'database'],
    mssql: ['user', 'password', 'host', 'port', 'database', 'driver'],
  };

  const getPlaceholder = (field: string) => {
    switch (field) {
      case 'host':
        return 'e.g., localhost or 127.0.0.1';
      case 'port':
        return selectedDB === 'mysql' ? '3306' : selectedDB === 'postgresql' ? '5432' : '1433';
      case 'database':
        return 'Enter database name';
      case 'user':
        return 'Enter username';
      case 'password':
        return '••••••••';
      case 'url':
        return 'e.g., sqlite:///path/to/db.sqlite';
      case 'db_path':
        return 'Path to your SQLite file';
      default:
        return `Enter ${field}`;
    }
  };

  const isFieldRequired = (field: string) => {
    if (selectedDB === 'sqlite') {
      // For SQLite, either URL or db_path is required, but not both
      if (field === 'url') {
        return !dbParams['db_path'];
      }
      if (field === 'db_path') {
        return !dbParams['url'];
      }
    }
    return true; // All other fields are required
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {selectedDB === 'sqlite' && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex gap-2">
            <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Provide either a URL <span className="font-medium">or</span> a DB Path to connect to your SQLite database.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {paramFields[selectedDB].map((field) => (
          <div key={field} className="space-y-1.5">
            <label 
              htmlFor={field}
              className="block text-sm font-medium text-gray-700"
            >
              {field.charAt(0).toUpperCase() + field.slice(1)}
              {selectedDB === 'sqlite' && (
                <span className="text-gray-400 text-xs ml-1">(optional)</span>
              )}
            </label>
            <input
              type={field === 'password' ? 'password' : 'text'}
              id={field}
              value={dbParams[field] || ''}
              onChange={(e) => onParamChange(field, e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                bg-white/70 backdrop-blur-sm
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                hover:border-gray-300
                transition-all duration-200
                placeholder:text-gray-400 text-gray-600"
              placeholder={getPlaceholder(field)}
              required={isFieldRequired(field)}
              autoComplete={field === 'password' ? 'current-password' : 'off'}
              spellCheck="false"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isConnecting || (
          selectedDB === 'sqlite' && !dbParams['url'] && !dbParams['db_path']
        )}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 
          hover:from-blue-700 hover:to-purple-700 
          text-white py-3 px-4 rounded-lg font-medium 
          transition-all duration-200 
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-sm hover:shadow
          transform hover:-translate-y-0.5
          flex items-center justify-center gap-2"
      >
        <span>{isConnecting ? 'Connecting...' : 'Connect Database'}</span>
        {!isConnecting && (
          <ArrowRightIcon className="h-4 w-4 animate-pulse" />
        )}
      </button>

      {/* Helper text for different database types */}
      <div className="text-xs text-gray-500">
        {selectedDB === 'mysql' && (
          <p>Default MySQL port: 3306</p>
        )}
        {selectedDB === 'postgresql' && (
          <p>Default PostgreSQL port: 5432</p>
        )}
        {selectedDB === 'mssql' && (
          <p>Default SQL Server port: 1433</p>
        )}
      </div>
    </form>
  );
};