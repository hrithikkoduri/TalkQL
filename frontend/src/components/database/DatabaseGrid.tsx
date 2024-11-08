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

  const handleDBSelect = (dbType: DBType) => {
    if (selectedDB === dbType) {
      onSelectDB(null);
    } else {
      onSelectDB(dbType);
    }
  };

  return (
    <div className={`transition-all duration-500 perspective-3d ${
      selectedDB ? 'w-1/2' : 'w-full'
    }`}>
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 gap-12 relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {databases.map((dbType, index) => (
          <motion.div
            key={dbType}
            className="relative"
            initial={{ opacity: 0, rotateY: -30, z: -100 }}
            animate={{ 
              opacity: 1,
              rotateY: hoveredDB === dbType ? 0 : -15,
              z: hoveredDB === dbType ? 50 : 0,
              scale: selectedDB === dbType ? 1.1 : 1
            }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 30,
              delay: index * 0.1 
            }}
          >
            <DatabaseCard
              dbType={dbType}
              isSelected={selectedDB === dbType}
              isConnecting={isConnecting}
              onClick={() => handleDBSelect(dbType)}
              logoSrc={dbLogos[dbType]}
              onHover={(isHovered) => setHoveredDB(isHovered ? dbType : null)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};