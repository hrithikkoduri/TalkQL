import { motion, AnimatePresence } from 'framer-motion';
import { 
  CircleStackIcon,
  ChatBubbleBottomCenterTextIcon,
  TableCellsIcon,
  ChartPieIcon,
  SparklesIcon,
  CommandLineIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface Feature {
  icon: React.ComponentType<any>;
  text: string;
  gradient: string;
}

const features: Feature[] = [
  { 
    icon: CircleStackIcon, 
    text: 'Connect to Multiple Databases',
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    icon: ChatBubbleBottomCenterTextIcon, 
    text: 'Natural Language Querying',
    gradient: 'from-purple-500 to-pink-500'
  },
  { 
    icon: TableCellsIcon, 
    text: 'Flexible Result Display',
    gradient: 'from-green-500 to-emerald-500'
  },
  { 
    icon: ChartPieIcon, 
    text: 'Data Visualization',
    gradient: 'from-orange-500 to-yellow-500'
  },
  { 
    icon: CommandLineIcon, 
    text: 'View Generated SQL',
    gradient: 'from-blue-500 to-purple-500'
  },
  { 
    icon: SparklesIcon, 
    text: 'Intuitive Interface',
    gradient: 'from-pink-500 to-rose-500'
  }
];

export const FeaturesList = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 280,
    y: Math.random() * 400,
  }));

  return (
    <div 
      className="fixed left-6 top-[25%] z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsOpen(false);
      }}
    >
      {/* Features Icon Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="p-3.5 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-100/50
          shadow-lg hover:shadow-xl transition-all duration-300 relative z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isHovered ? [0, -10, 10, -10, 0] : 0,
        }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
      >
        <Squares2X2Icon className="h-6 w-6 text-gray-600" />
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.button>

      {/* Features Panel */}
      <AnimatePresence>
        {(isOpen || isHovered) && (
          <motion.div
            initial={{ opacity: 0, x: -20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            exit={{ opacity: 0, x: -20, width: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute left-20 top-0 bg-white/80 backdrop-blur-xl rounded-3xl 
              border border-gray-100/50 shadow-lg p-6 min-w-[280px]"
          >
            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                  animate={{
                    x: [particle.x, particle.x + 20, particle.x],
                    y: [particle.y, particle.y - 20, particle.y],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}
            </div>

            <h3 className="text-sm font-medium text-gray-400 mb-6 tracking-wider uppercase relative z-10">
              Features
            </h3>
            <div className="flex flex-col gap-5 relative z-10">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="group relative flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div
                    className={`p-3.5 rounded-xl bg-gradient-to-br from-white to-gray-50
                      shadow-sm relative overflow-hidden cursor-pointer`}
                    whileHover={{ 
                      scale: 1.05,
                      rotate: 5,
                      transition: { type: "spring", stiffness: 400, damping: 25 }
                    }}
                  >
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />
                    <feature.icon className={`h-5 w-5 relative z-10 transition-all duration-300
                      text-gray-600 group-hover:text-white`} />
                  </motion.div>
                  
                  <span className={`ml-3 text-sm font-medium bg-gradient-to-r 
                    ${feature.gradient} bg-clip-text text-transparent`}>
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 