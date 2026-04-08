import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SerendipityInsight } from "@/services/geminiService";
import { Sparkles, Quote, Trophy, Lightbulb } from "lucide-react";

interface SerendipityCardProps {
  insight: SerendipityInsight | null;
  isLoading: boolean;
}

const icons = {
  quote: Quote,
  challenge: Trophy,
  prompt: Sparkles,
  insight: Lightbulb,
};

export function SerendipityCard({ insight, isLoading }: SerendipityCardProps) {
  const Icon = insight ? icons[insight.type] : Sparkles;

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="mb-6"
            >
              <Sparkles className="w-12 h-12 text-orange-500 opacity-50" />
            </motion.div>
            <p className="text-white/40 font-serif italic text-xl">Weaving serendipity...</p>
          </motion.div>
        ) : insight ? (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="glass-card border-none overflow-hidden">
              <CardHeader className="pt-12 pb-6 px-12">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[10px] uppercase tracking-[0.2em] font-medium text-white/60">
                    <Icon className="w-3 h-3" />
                    {insight.type}
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
                    {insight.mood}
                  </span>
                </div>
                <CardTitle className="text-4xl md:text-5xl serif-text font-light leading-tight tracking-tight text-white/90">
                  {insight.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-12 pb-12">
                <Separator className="bg-white/10 mb-8" />
                <p className="text-xl md:text-2xl text-white/70 font-light leading-relaxed serif-text italic">
                  "{insight.content}"
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-white/30 font-serif italic text-2xl">
              Tap the spark to begin your journey.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
