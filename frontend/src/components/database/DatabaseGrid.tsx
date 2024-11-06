import { DatabaseCard } from './DatabaseCard';
import { DBType } from '@/types/database';

interface DatabaseGridProps {
  selectedDB: DBType | null;
  isConnecting: boolean;
  onSelectDB: (dbType: DBType) => void;
  dbLogos: Record<DBType, string>;
}

export const DatabaseGrid = ({
  selectedDB,
  isConnecting,
  onSelectDB,
  dbLogos,
}: DatabaseGridProps) => (
    <div className={`transition-all duration-500 ${
        selectedDB ? 'w-1/2' : 'w-full'
      }`}>
        <div className="grid grid-cols-2 gap-4"> 
      {(['sqlite', 'mysql', 'postgresql', 'mssql'] as const).map((dbType) => (
        <DatabaseCard
          key={dbType}
          dbType={dbType}
          isSelected={selectedDB === dbType}
          isConnecting={isConnecting}
          onClick={() => onSelectDB(dbType)}
          logoSrc={dbLogos[dbType]}
        />
      ))}
    </div>
  </div>
);