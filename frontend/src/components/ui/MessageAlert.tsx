import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface MessageAlertProps {
  message: string;
  isSuccess: boolean;
}

export const MessageAlert = ({ message, isSuccess }: MessageAlertProps) => (
  <div 
    className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
      isSuccess 
        ? 'bg-green-50 text-green-700 border border-green-200' 
        : 'bg-red-50 text-red-700 border border-red-200'
    }`}
    role="alert"
  >
    {isSuccess ? (
      <CheckCircleIcon className="h-5 w-5" />
    ) : (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )}
    <p className="font-medium">{message}</p>
  </div>
);