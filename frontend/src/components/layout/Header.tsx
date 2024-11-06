import { Logo } from './Logo';

export const Header = () => (
  <div className="text-center mb-8"> {/* Increased bottom margin */}
    <Logo />
    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mt-3">
      Data Answers, Simplified.
    </h2>
  </div>
);