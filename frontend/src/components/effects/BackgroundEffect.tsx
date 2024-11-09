import { motion } from 'framer-motion';

export const BackgroundEffect = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Top left blob */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] 
          bg-gradient-to-br from-blue-200/25 to-blue-300/25 
          rounded-full blur-[120px]"
        animate={{
          x: [0, 25, 0],
          y: [0, -25, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Bottom right blob */}
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 w-[800px] h-[800px] 
          bg-gradient-to-br from-purple-200/25 to-purple-300/25 
          rounded-full blur-[120px]"
        animate={{
          x: [0, -25, 0],
          y: [0, 25, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
          delay: 2
        }}
      />
    </div>
  );
}; 