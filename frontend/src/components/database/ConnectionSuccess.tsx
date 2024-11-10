import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface ConnectionSuccessProps {
  isExiting: boolean;
}

export const ConnectionSuccess = ({ isExiting }: ConnectionSuccessProps) => (
  <div className={`transition-all duration-500 transform ${
    isExiting ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
  }`}>
    <div className="bg-white/40 backdrop-blur-[4px] rounded-2xl 
      shadow-[0_10px_30px_-5px_rgba(0,0,0,0.15),_0_20px_40px_-10px_rgba(0,0,0,0.1)]
      hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.3),_0_25px_45px_-10px_rgba(0,0,0,0.2)]
      border border-gray-100/20 p-12 text-center relative
      transition-all duration-300">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />            
      <div className="inline-flex items-center justify-center p-4 bg-green-50/80 backdrop-blur-sm rounded-full mb-6 shadow-sm">
        <CheckCircleIcon className="h-8 w-8 text-green-500" />
      </div>
      <h2 className="text-2xl font-semibold text-green-700 mb-3">
        Connected Successfully!
      </h2>
      <p className="text-gray-600 mb-8">
        Your database is now connected and ready for queries
      </p>
      <div className="h-0.5 w-24 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto" />
    </div>
  </div>
);