import Image from 'next/image';
import { DBType } from '@/types/database';

interface DatabaseCardProps {
  dbType: DBType;
  isSelected: boolean;
  isConnecting: boolean;
  onClick: () => void;
  logoSrc: string;
}

export const DatabaseCard = ({
  dbType,
  isSelected,
  isConnecting,
  onClick,
  logoSrc,
}: DatabaseCardProps) => (
    <button
  onClick={onClick}
  disabled={isConnecting}
  className={`
    group p-6 rounded-xl transition-all duration-300 flex items-center justify-center
    ${isSelected 
      ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-500 shadow-lg scale-[1.02]' 
      : 'bg-white/50 border-2 border-gray-100 hover:border-blue-200 hover:bg-gradient-to-br hover:from-blue-50/30 hover:to-purple-50/30 hover:shadow-md hover:scale-[1.02]'
    }
    ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    backdrop-blur-sm
    aspect-square
  `}
>
  <div className="relative w-44 h-44 transition-transform duration-300 group-hover:scale-105">
    <Image
      src={logoSrc}
      alt={`${dbType} database`}
      fill
      className="object-contain p-4"
      priority
    />
  </div>
</button>
);