import { DatabaseCard } from './DatabaseCard';
import { DBType } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface DatabaseGridProps {
  selectedDB: DBType | null;
  isConnecting: boolean;
  onSelectDB: (dbType: DBType | null) => void;
  dbLogos: Record<DBType, string>;
}

export const DatabaseGrid = ({
  selectedDB,
  isConnecting,
  onSelectDB,
  dbLogos,
}: DatabaseGridProps) => {
  const databases = ['sqlite', 'mysql', 'postgresql', 'mssql', 'snowflake', 'csv'] as const;
  const [hoveredDB, setHoveredDB] = useState<DBType | null>(null);

  return (
    <motion.div
      layout
      className="w-full grid grid-cols-3 relative max-w-[700px] gap-16 min-h-[500px]"
      initial={false}
      animate={{
        gap: selectedDB ? "3rem" : "2rem",
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
    >
      {databases.map((dbType, index) => (
        <motion.div
          layout
          key={dbType}
          className="relative"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: 1,
            opacity: 1,
            zIndex: selectedDB === dbType ? 10 : 1,
            x: selectedDB && selectedDB !== dbType ? (index % 3 - 1) * 20 : 0,
            y: selectedDB && selectedDB !== dbType ? (Math.floor(index / 3) - 1) * 20 : 0
          }}
          transition={{ 
            type: "spring",
            stiffness: 400,
            damping: 30,
            layout: {
              duration: 0.5,
              ease: "easeInOut"
            }
          }}
        >
          <DatabaseCard
            dbType={dbType}
            isSelected={selectedDB === dbType}
            isConnecting={isConnecting}
            onClick={() => onSelectDB(dbType === selectedDB ? null : dbType)}
            logoSrc={dbLogos[dbType]}
            onHover={(isHovered) => setHoveredDB(isHovered ? dbType : null)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};