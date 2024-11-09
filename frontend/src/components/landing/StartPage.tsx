import { AnimatePresence, motion } from 'framer-motion';

interface StartPageProps {
  onStart: () => void;
  isExiting: boolean;
}

export const StartPage = ({ onStart, isExiting }: StartPageProps) => (
  <motion.div
    className={`fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 z-[100]
      flex flex-col items-center justify-center -mt-[10vh]
      transition-opacity duration-700 overflow-hidden
      ${isExiting ? 'pointer-events-none' : ''}
    `}
    animate={{
      opacity: isExiting ? 0 : 1,
      y: isExiting ? -100 : 0,
    }}
    transition={{
      duration: 0.7,
      ease: [0.4, 0, 0.2, 1],
    }}
  >
    {/* Background decorative elements */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-1/4 -left-12 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-12 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
    </div>

    <AnimatePresence>
      {!isExiting && (
        <>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -100 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
            className="text-center space-y-8 relative"
          >
            <div className="relative">
              <h1 className="text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600
                [text-shadow:_0_4px_20px_rgb(37_99_235_/_40%),_0_8px_40px_rgb(147_51_234_/_30%)]
                drop-shadow-sm relative z-10">
                TalkQL
              </h1>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-3xl transform scale-150" />
            </div>
            
            <p className="text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500
              [text-shadow:_0_2px_10px_rgb(37_99_235_/_20%)] relative z-10">
              Data Answers, Simplified.
            </p>
          </motion.div>

          <motion.button
            onClick={onStart}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 100 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(37, 99, 235, 0.25), 0 10px 20px rgba(147, 51, 234, 0.2)",
            }}
            whileTap={{ scale: 0.95 }}
            className="mt-16 px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 
              text-white rounded-2xl font-medium text-xl
              shadow-[0_10px_30px_rgba(37,99,235,0.2),_0_15px_25px_rgba(147,51,234,0.15)]
              transform transition-all duration-300
              border border-white/30 backdrop-blur-sm
              hover:border-white/50
              relative overflow-hidden group z-10"
          >
            <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 
              transition-opacity duration-300" />
            <span className="relative text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
              Get Started!
            </span>
          </motion.button>
        </>
      )}
    </AnimatePresence>
  </motion.div>
);