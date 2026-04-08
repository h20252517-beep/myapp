import { motion } from "motion/react";

export function Atmosphere() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      transition={{ duration: 2 }}
      className="atmosphere" 
    />
  );
}
