import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, MessageSquare, ArrowRight, Download, Share2, Info, RefreshCw } from 'lucide-react';
import { BrandIdentity, generateBrandIdentity } from '../services/geminiService';
import { LogoCard, PaletteCard, TypographyCard } from './BrandComponents';
import { ChatInterface } from './ChatInterface';
import { cn } from '../lib/utils';

export default function BrandBible() {
  const [mission, setMission] = useState('');
  const [brand, setBrand] = useState<BrandIdentity | null>(null);
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (brand) {
      const headerFont = brand.typography.headerFont.replace(/\s+/g, '+');
      const bodyFont = brand.typography.bodyFont.replace(/\s+/g, '+');
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${headerFont}:wght@400;700&family=${bodyFont}:wght@400;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [brand]);

  const handleGenerate = async () => {
    if (!mission.trim()) return;
    setLoading(true);
    try {
      const result = await generateBrandIdentity(mission);
      setBrand(result);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!brand) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl text-center"
        >
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-xl">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
          <h1 className="mb-4 text-5xl font-black tracking-tight text-zinc-900">BrandForge</h1>
          <p className="mb-12 text-lg text-zinc-500">
            Describe your company's mission and values. We'll forge a complete brand identity from the fire of AI.
          </p>
          
          <div className="relative">
            <textarea 
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              placeholder="e.g. A sustainable coffee brand that empowers local farmers and brings premium organic beans to urban dwellers..."
              className="h-40 w-full rounded-3xl border-zinc-200 bg-white p-8 text-lg shadow-sm focus:border-zinc-900 focus:ring-0"
            />
            <button 
              onClick={handleGenerate}
              disabled={loading || !mission.trim()}
              className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Forging...
                </>
              ) : (
                <>
                  Generate Brand
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">{brand.companyName}</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Brand Bible 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-900 hover:bg-zinc-50"
            >
              <MessageSquare className="h-4 w-4" />
              Refine with AI
            </button>
            <button className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Mission Section */}
          <section className="col-span-full mb-8">
            <div className="max-w-3xl">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Mission Statement</h2>
              <p className="text-4xl font-light leading-tight text-zinc-900">
                {brand.missionStatement}
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
                <Info className="h-4 w-4" />
                <span>Voice: <span className="font-bold text-zinc-900">{brand.brandVoice}</span></span>
              </div>
            </div>
          </section>

          {/* Logo Section */}
          <div className="col-span-full grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <LogoCard title="Primary Logo" prompt={brand.logoPrompts.primary} isPrimary />
            {brand.logoPrompts.secondary.map((prompt, i) => (
              <LogoCard key={i} title={`Secondary Mark ${i + 1}`} prompt={prompt} />
            ))}
          </div>

          {/* Visual Identity Section */}
          <div className="col-span-1">
            <PaletteCard palette={brand.palette} />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <TypographyCard typography={brand.typography} />
          </div>
        </div>
      </main>

      <ChatInterface 
        brand={brand} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      {/* Floating Action Button for Chat on Mobile */}
      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-2xl lg:hidden"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
