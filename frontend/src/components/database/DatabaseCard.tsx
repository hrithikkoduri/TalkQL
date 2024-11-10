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
  <motion.button
    onClick={onClick}
    disabled={isConnecting}
    onHoverStart={() => onHover(true)}
    onHoverEnd={() => onHover(false)}
    whileHover={{ scale: isSelected ? 1 : 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`
      group w-full aspect-square rounded-2xl
      relative p-4
      transition-all duration-300
      bg-gradient-to-br from-white/95 via-white/90 to-white/80
      border-2
      backdrop-blur-xl
      ${isSelected 
        ? 'border-blue-500/50 shadow-[0_20px_50px_rgba(59,130,246,0.4),_0_15px_30px_rgba(147,51,234,0.3)]' 
        : 'border-white/30 hover:border-blue-200/50 hover:shadow-[0_15px_45px_rgba(59,130,246,0.25),_0_12px_25px_rgba(147,51,234,0.15)]'
      }
      shadow-[0_20px_35px_rgba(59,130,246,0.2)]
      ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      transform-gpu
    `}
  >
    <motion.div 
      className="relative w-full h-full flex items-center justify-center"
      animate={{ 
        scale: isSelected ? 2 : 1,
        rotate: isSelected ? 3 : 0,
        y: isSelected ? '-10%' : '0%',
      }}
      transition={{ 
        type: "spring",
        stiffness: 200,
        damping: 25
      }}
    >
      <Image
        src={logoSrc}
        alt={`${dbType} database`}
        width={100}
        height={100}
        className={`
          transition-all duration-300
          ${isSelected 
            ? 'drop-shadow-2xl filter saturate-125' 
            : 'group-hover:drop-shadow-xl group-hover:scale-105 group-hover:saturate-110'
          }
        `}
        priority
      />
    </motion.div>
  </motion.button>
);