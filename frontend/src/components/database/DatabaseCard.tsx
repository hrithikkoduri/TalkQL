import Image from 'next/image';
import { DBType } from '@/types/database';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface DatabaseCardProps {
  dbType: DBType;
  isSelected: boolean;
  isConnecting: boolean;
  onClick: () => void;
  logoSrc: string;
  onHover: (isHovered: boolean) => void;
}

export const DatabaseCard = ({
  dbType,
  isSelected,
  isConnecting,
  onClick,
  logoSrc,
  onHover,
}: DatabaseCardProps) => (
  <div className="relative">
    <motion.button
      onClick={onClick}
      disabled={isConnecting}
      onHoverStart={() => onHover(true)}
      onHoverEnd={() => onHover(false)}
      whileHover={{ scale: 1.02, rotateY: 0, z: 50 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group w-full aspect-square p-8 rounded-3xl
        relative
        transition-all duration-300
        bg-gradient-to-br from-white/95 via-white/90 to-white/80
        border-2
        backdrop-blur-xl
        ${isSelected 
          ? 'border-blue-500/50 shadow-[0_8px_32px_rgba(59,130,246,0.2)]' 
          : 'border-white/30 hover:border-blue-200/50 hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)]'
        }
        ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transform-gpu
      `}
    >
      <AnimatePresence>
        {isSelected ? (
          <motion.div
            className="absolute inset-0 rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(147,51,234,0.12))'
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <motion.div
            className="absolute inset-0 rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <motion.div 
        className="relative w-full h-full flex items-center justify-center"
        animate={{ 
          scale: isSelected ? 1.1 : 1,
          rotate: isSelected ? 3 : 0
        }}
        initial={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
      >
        <Image
          src={logoSrc}
          alt={`${dbType} database`}
          width={160}
          height={160}
          className={`
            transition-all duration-300
            ${isSelected 
              ? 'drop-shadow-2xl filter saturate-125 scale-110' 
              : 'group-hover:drop-shadow-xl group-hover:scale-105 group-hover:saturate-110'
            }
          `}
          priority
        />
      </motion.div>
    </motion.button>

    <AnimatePresence>
      {isSelected && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute -top-3 -right-3 z-50"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <div className="
            bg-white rounded-full p-2.5
            shadow-lg
            border border-gray-200
            transition-all duration-300
            hover:bg-red-50
            hover:scale-110
            hover:border-red-200
            cursor-pointer
          ">
            <XMarkIcon 
              className="h-5 w-5 text-gray-500 hover:text-red-500 transition-colors" 
              strokeWidth={2}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);