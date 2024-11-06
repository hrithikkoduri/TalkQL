import { Logo } from './Logo';

interface HeaderProps {
  minimal?: boolean;
  isTransitioning?: boolean;
}

export const Header = ({ minimal = false, isTransitioning = false }: HeaderProps) => (
  <header className={`transition-all duration-500 relative z-[100] ${
    isTransitioning 
      ? 'absolute top-8 left-8' 
      : 'py-6'
  }`}>
    <Logo minimal={minimal} isTransitioning={isTransitioning} />
  </header>
);