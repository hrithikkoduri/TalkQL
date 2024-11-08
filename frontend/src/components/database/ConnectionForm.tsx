import { DBType, DBParams } from '@/types/database';
import { ArrowRightIcon, InformationCircleIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface ConnectionFormProps {
  selectedDB: DBType;
  dbParams: Partial<DBParams[DBType]>;
  isConnecting: boolean;
  onParamChange: (field: string, value: string | File) => void;
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
    sqlite: [],
    mysql: ['user', 'password', 'host', 'port', 'database'],
    postgresql: ['user', 'password', 'host', 'port', 'database'],
    mssql: ['user', 'password', 'host', 'port', 'database', 'driver'],
    snowflake: ['account', 'user', 'password', 'warehouse', 'database', 'schema'],
    csv: []
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
        return selectedDB === 'csv' ? 'https://example.com/data.csv' : 'sqlite:///path/to/db.sqlite';
      case 'db_path':
        return 'Path to your SQLite file';
      case 'account':
        return 'xy12345.us-east-1';
      case 'warehouse':
        return 'Enter warehouse name';
      case 'schema':
        return 'Enter schema name';
      case 'file_path':
        return '/path/to/your/file.csv';
      case 'delimiter':
        return ',';
      default:
        return `Enter ${field}`;
    }
  };

  const isFieldRequired = (field: string) => {
    if (selectedDB === 'sqlite') {
      const sqliteParams = dbParams as Partial<DBParams['sqlite']>;
      if (field === 'url') return !sqliteParams.file;
      if (field === 'file') return !sqliteParams.url;
    }
    if (selectedDB === 'csv') {
      const csvParams = dbParams as Partial<DBParams['csv']>;
      if (field === 'url') return !csvParams.file;
      if (field === 'file') return !csvParams.url;
    }
    return true;
  };

  const getHelperText = () => {
    switch (selectedDB) {
      case 'snowflake':
        return 'Account format: orgname-accountname or account locator';
      default:
        return null;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onParamChange('file', file);
    }
  };

  const handleURLChange = (url: string) => {
    // Basic URL validation
    if (url && !url.match(/^https?:\/\/.+\.csv$/i)) {
      onParamChange('url', '');
      alert('Please provide a direct link to a CSV file (ending with .csv)');
      return;
    }
    onParamChange('url', url);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {selectedDB === 'sqlite' && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex gap-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Upload a SQLite database file or provide a URL.
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-colors">
            <label className="flex flex-col items-center cursor-pointer">
              <ArrowUpTrayIcon className="h-8 w-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">
                {(dbParams as DBParams['sqlite']).file
                  ? (dbParams as DBParams['sqlite']).file?.name
                  : 'Click to upload SQLite DB'
                }
              </span>
              <input
                type="file"
                accept=".db,.sqlite,.sqlite3"
                onChange={handleFileChange}
                className="hidden"
                disabled={isConnecting || !!(dbParams as DBParams['sqlite']).url}
              />
            </label>
          </div>

          <div className="text-center text-sm text-gray-500 font-medium">
            or
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Database URL
            </label>
            <input
              type="text"
              placeholder="sqlite:///path/to/db.sqlite"
              value={(dbParams as DBParams['sqlite']).url || ''}
              onChange={(e) => onParamChange('url', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isConnecting || !!(dbParams as DBParams['sqlite']).file}
            />
          </div>
        </div>
      )}

      {getHelperText() && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex gap-2">
            <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              {getHelperText()}
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
            </label>
            <input
              type={field === 'password' ? 'password' : 'text'}
              id={field}
              value={dbParams[field as keyof DBParams[typeof selectedDB]] || ''}
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

      {selectedDB === 'csv' && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex gap-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Upload a CSV file or provide a URL.
              </p>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-colors">
            <label className="flex flex-col items-center cursor-pointer">
              <ArrowUpTrayIcon className="h-8 w-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">
                {(dbParams as DBParams['csv']).file
                  ? (dbParams as DBParams['csv']).file?.name
                  : 'Click to upload CSV'
                }
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={isConnecting || !!(dbParams as DBParams['csv']).url}
              />
            </label>
          </div>

          <div className="text-center text-sm text-gray-500 font-medium">
            or
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CSV URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/data.csv"
              value={(dbParams as DBParams['csv']).url || ''}
              onChange={(e) => handleURLChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isConnecting || !!(dbParams as DBParams['csv']).file}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isConnecting}
        className={`
          w-full py-4 px-6 rounded-xl
          font-medium text-white
          flex items-center justify-center gap-2
          transition-all duration-300
          bg-gradient-to-r from-blue-600 to-purple-600
          hover:from-blue-500 hover:to-purple-500
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg hover:shadow-xl
          hover:-translate-y-0.5 active:translate-y-0
          ${isConnecting ? 'animate-pulse' : ''}
        `}
      >
        {isConnecting ? (
          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Connect Database
            <ArrowRightIcon className="h-5 w-5" />
          </>
        )}
      </button>

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