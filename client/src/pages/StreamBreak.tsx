
import { motion } from "framer-motion";

export default function StreamBreak() {
  return (
    <motion.div 
      className="h-screen w-screen bg-background flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.h1 
        className="text-4xl md:text-6xl font-bold text-primary mb-8"
        animate={{ 
          y: [0, -20, 0],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Taking a Short Break
      </motion.h1>
      
      <motion.p
        className="text-xl text-muted-foreground"
        animate={{ 
          opacity: [1, 0.5, 1],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Will be right back!
      </motion.p>

      <motion.div 
        className="absolute w-full h-full"
        style={{
          background: "radial-gradient(circle, transparent 0%, rgba(0,0,0,0.1) 100%)"
        }}
        animate={{
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
}
