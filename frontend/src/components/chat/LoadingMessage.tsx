export const LoadingMessage = () => (
    <div className="flex justify-start animate-fade-in pl-8">
<div className="max-w-[90%] rounded-2xl bg-white/90 backdrop-blur-lg border border-gray-100/50 overflow-hidden shadow-lg">        <div className="h-1 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
        <div className="h-1 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
        <div className="p-5 flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-bounce [animation-delay:-0.3s]" />
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-bounce [animation-delay:-0.15s]" />
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-bounce" />
          </div>
          <span className="text-gray-500">Generating response...</span>
        </div>
      </div>
    </div>
  );