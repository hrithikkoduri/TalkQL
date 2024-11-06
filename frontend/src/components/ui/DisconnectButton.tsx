import { XMarkIcon } from '@heroicons/react/24/outline';

interface DisconnectButtonProps {
  dbType: string;
  dbName: string;
  onDisconnect: () => void;
}

export const DisconnectButton = ({ dbType, dbName, onDisconnect }: DisconnectButtonProps) => (
  <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
      <div className="text-right">
        <p className="text-sm font-medium text-gray-700">Connected to</p>
        <p className="text-xs font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          {dbType} - {dbName}
        </p>
      </div>
    </div>
    <div className="h-8 w-[1px] bg-gray-200" />
    <button
      onClick={onDisconnect}
      className="group flex items-center gap-2 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
    >
      <span className="text-xs font-medium text-gray-600 group-hover:text-red-600 transition-colors">
        Disconnect
      </span>
      <XMarkIcon className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
    </button>
  </div>
);