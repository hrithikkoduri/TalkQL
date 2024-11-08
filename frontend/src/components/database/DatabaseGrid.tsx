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
    <div className={`w-full grid grid-cols-3 relative max-w-[600px] min-h-[500px] transition-all duration-500 ${
      selectedDB ? 'gap-x-12 gap-y-16' : 'gap-x-4 gap-y-8'
    }`}>
      {databases.map((dbType, index) => (
        <motion.div
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
            damping: 30
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
    </div>
  );
};