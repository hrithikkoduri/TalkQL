import { motion } from 'framer-motion';
import { ChartBarIcon, ChartPieIcon } from '@heroicons/react/24/outline';

interface ToggleSwitchProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const ToggleSwitch = ({ enabled, setEnabled }: ToggleSwitchProps) => {
  return (
    <div className="relative">
      <motion.div
        initial={false}
        className="relative bg-white rounded-2xl p-4 shadow-lg"
      >
        <div className="flex flex-col items-start gap-3 w-[200px]">
          <span className="text-sm font-medium text-gray-700">
            Visualization Mode
          </span>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`
              w-full p-3 rounded-xl relative overflow-hidden
              ${enabled ? 'bg-purple-50' : 'bg-gray-50'}
              transition-colors duration-300
            `}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <motion.div
                  initial={false}
                  animate={{
                    scale: enabled ? 1.1 : 1,
                    rotate: enabled ? 360 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className={`
                    p-2 rounded-lg
                    ${enabled ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'}
                  `}
                >
                  {enabled ? (
                    <ChartPieIcon className="h-4 w-4" />
                  ) : (
                    <ChartBarIcon className="h-4 w-4" />
                  )}
                </motion.div>
                <span className={`
                  text-sm font-medium
                  ${enabled ? 'text-purple-700' : 'text-gray-500'}
                `}>
                  {enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <motion.div
                animate={{
                  backgroundColor: enabled ? '#9333EA' : '#D1D5DB',
                }}
                className="w-9 h-5 rounded-full relative"
              >
                <motion.div
                  animate={{
                    x: enabled ? 16 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                  className="w-5 h-5 rounded-full bg-white shadow-sm absolute -top-0"
                />
              </motion.div>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};