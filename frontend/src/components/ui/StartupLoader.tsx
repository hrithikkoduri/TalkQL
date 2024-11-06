import { ServerIcon } from '@heroicons/react/24/outline';

interface StartupLoaderProps {
  error?: string;
}

export const StartupLoader = ({ error }: StartupLoaderProps) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center">
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-blue-100/50 animate-ping"></div>
      <div className="relative rounded-full p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <ServerIcon className="h-8 w-8 text-blue-600 animate-pulse" />
      </div>
    </div>
    <h2 className="mt-6 text-xl font-medium text-gray-700">Starting up TalkQL</h2>
    <p className="mt-2 text-sm text-gray-500">Checking for existing database connections...</p>
    {error && (
      <p className="mt-4 text-sm text-red-500">
        {error}
      </p>
    )}
  </div>
);