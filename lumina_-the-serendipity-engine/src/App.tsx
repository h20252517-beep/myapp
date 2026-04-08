import { useState, useCallback } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Atmosphere } from "@/components/Atmosphere";
import { SerendipityCard } from "@/components/SerendipityCard";
import { generateLuckyInsight, SerendipityInsight } from "@/services/geminiService";

export default function App() {
  const [insight, setInsight] = useState<SerendipityInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFeelingLucky = useCallback(async () => {
    setIsLoading(true);
    try {
      const newInsight = await generateLuckyInsight();
      setInsight(newInsight);
      
      // Celebrate the serendipity
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4e00', '#4e00ff', '#ffffff', '#ffd700'],
        disableForReducedMotion: true
      });
    } catch (error) {
      console.error("Failed to find serendipity:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <Atmosphere />
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-12 left-0 w-full px-8 flex justify-between items-center z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          </div>
          <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-white/60">
            Lumina Engine
          </span>
        </div>
        <div className="text-[11px] uppercase tracking-[0.3em] font-medium text-white/40">
          v1.0.0
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-12">
        <SerendipityCard insight={insight} isLoading={isLoading} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={handleFeelingLucky}
            disabled={isLoading}
            className="group relative h-16 px-10 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-500 overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <div className="relative flex items-center gap-3">
              <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
              <span className="text-sm font-semibold uppercase tracking-widest">
                I'm Feeling Lucky
              </span>
            </div>
          </Button>
        </motion.div>
      </div>

      {/* Footer Decoration */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-12 text-[10px] uppercase tracking-[0.5em] text-white/50"
      >
        Discover the unexpected
      </motion.footer>
    </main>
  );
}
