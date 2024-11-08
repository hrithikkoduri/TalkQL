import { motion } from 'framer-motion';
import { ChartBarIcon, ChartPieIcon } from '@heroicons/react/24/outline';

interface ToggleSwitchProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const ToggleSwitch = ({ enabled, setEnabled }: ToggleSwitchProps) => {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
      <motion.div
        initial={false}
        className="relative bg-white/90 backdrop-blur-sm border border-gray-100/50 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        <div className="flex flex-col items-start gap-3 w-[200px]">
          <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Visualization Mode
          </span>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`
              w-full p-3 rounded-xl relative overflow-hidden group/button
              ${enabled ? 'bg-gradient-to-r from-purple-50 to-blue-50' : 'bg-gray-50'}
              transition-all duration-500
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover/button:opacity-10 transition-opacity duration-300" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <motion.div
                  initial={false}
                  animate={{
                    scale: enabled ? 1.1 : 1,
                    rotate: enabled ? 360 : 0
                  }}
                  transition={{ 
                    duration: 0.5,
                    type: "spring",
                    stiffness: 200
                  }}
                  className={`
                    p-2 rounded-lg relative overflow-hidden
                    ${enabled ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' : 'bg-gray-200 text-gray-500'}
                  `}
                >
                  <motion.div
                    animate={{
                      opacity: enabled ? 1 : 0
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0"
                  />
                  <div className="relative z-10">
                    {enabled ? (
                      <ChartPieIcon className="h-4 w-4" />
                    ) : (
                      <ChartBarIcon className="h-4 w-4" />
                    )}
                  </div>
                </motion.div>
                <span className={`
                  text-sm font-medium transition-all duration-300
                  ${enabled ? 'bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent' : 'text-gray-500'}
                `}>
                  {enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <motion.div
                animate={{
                  background: enabled 
                    ? 'linear-gradient(to right, #9333EA, #3B82F6)' 
                    : '#E5E7EB',
                }}
                initial={{ background: '#E5E7EB' }}
                className="w-12 h-6 rounded-full relative p-0.5"
              >
                <motion.div
                  animate={{
                    x: enabled ? 24 : 0,
                    background: enabled 
                      ? 'linear-gradient(to right, #F5F3FF, #EFF6FF)' 
                      : '#FFFFFF'
                  }}
                  initial={{ x: 0, background: '#FFFFFF' }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                  className="w-5 h-5 rounded-full shadow-md"
                />
              </motion.div>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};