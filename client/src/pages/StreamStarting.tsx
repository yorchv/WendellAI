
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function StreamStarting() {
  const [dots, setDots] = useState("...");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "." : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

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
          scale: [1, 1.05, 1],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Stream Starting Soon{dots}
      </motion.h1>
      
      <motion.div 
        className="w-64 h-2 bg-muted rounded-full overflow-hidden"
      >
        <motion.div
          className="h-full bg-primary"
          animate={{
            x: [-256, 256],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>
    </motion.div>
  );
}
