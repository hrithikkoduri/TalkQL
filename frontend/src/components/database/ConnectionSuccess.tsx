import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface ConnectionSuccessProps {
  isExiting: boolean;
}

export const ConnectionSuccess = ({ isExiting }: ConnectionSuccessProps) => (
    <div className={`transition-all duration-500 transform ${
      isExiting ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
    }`}>
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/50 p-12 text-center relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />            
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
    </div>
  );