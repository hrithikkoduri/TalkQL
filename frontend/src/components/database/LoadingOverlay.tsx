interface LoadingOverlayProps {
    isVisible: boolean;
  }
  
  export const LoadingOverlay = ({ isVisible }: LoadingOverlayProps) => {
    if (!isVisible) return null;
  
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping"></div>
              <div className="relative rounded-full p-4 bg-blue-50">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>              </div>
            </div>
            <p className="text-lg font-medium text-gray-800 mt-6">
              Connecting to database...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This may take a few moments
            </p>
          </div>
        </div>
      </div>
    );
  };