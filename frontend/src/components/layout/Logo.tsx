interface LogoProps {
    minimal?: boolean;
    className?: string;
    isTransitioning?: boolean;
  }
  
  export const Logo = ({ minimal = false, className = '', isTransitioning = false }: LogoProps) => (
    <div className={`fixed transition-all duration-500 z-[50] ${
      isTransitioning 
        ? 'top-4 left-8' 
        : 'top-8 left-1/2 -translate-x-1/2'
    } ${className}`}>
      <div className={`transition-all duration-500 ${
        isTransitioning ? 'text-left' : 'text-center'
      }`}>
        <h1 className={`font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 
          ${minimal || isTransitioning ? 'text-2xl' : 'text-6xl'} 
          transition-all duration-500
          [text-shadow:_0_4px_20px_rgb(37_99_235_/_30%),_0_8px_40px_rgb(147_51_234_/_20%)]
          drop-shadow-xl`}
        >
          TalkQL
        </h1>
        {!minimal && !isTransitioning && (
          <p className="mt-2 font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500
            [text-shadow:_0_2px_10px_rgb(37_99_235_/_20%)]">
            Data Answers, Simplified.
          </p>
        )}
      </div>
    </div>
  );