import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, RefreshCw, Image as ImageIcon, Type as TypeIcon, Palette as PaletteIcon, MessageSquare, ChevronRight, Sparkles } from 'lucide-react';
import { BrandIdentity, generateLogo } from '../services/geminiService';
import { cn } from '../lib/utils';

interface LogoCardProps {
  prompt: string;
  title: string;
  isPrimary?: boolean;
}

export const LogoCard: React.FC<LogoCardProps> = ({ prompt, title, isPrimary }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const url = await generateLogo(prompt, size);
      setImageUrl(url);
    } catch (error) {
      console.error("Logo generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, [prompt]);

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:shadow-xl",
      isPrimary ? "col-span-full lg:col-span-2" : "col-span-1"
    )}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">{title}</h3>
        <div className="flex items-center gap-2">
          <select 
            value={size} 
            onChange={(e) => setSize(e.target.value as any)}
            className="text-xs border-none bg-zinc-100 rounded px-2 py-1 focus:ring-0"
          >
            <option value="1K">1K</option>
            <option value="2K">2K</option>
            <option value="4K">4K</option>
          </select>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className={cn(
        "relative flex items-center justify-center rounded-xl bg-zinc-50 transition-all",
        isPrimary ? "aspect-video" : "aspect-square"
      )}>
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200" />
            <span className="text-xs text-zinc-400">Forging mark...</span>
          </div>
        ) : imageUrl ? (
          <motion.img 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={imageUrl} 
            alt={title}
            className="h-full w-full object-contain p-8"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-zinc-300">
            <ImageIcon className="h-12 w-12" />
          </div>
        )}
      </div>

      {imageUrl && (
        <div className="mt-4 flex justify-end">
          <a 
            href={imageUrl} 
            download={`${title.toLowerCase().replace(/\s+/g, '-')}.png`}
            className="flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            <Download className="h-3 w-3" />
            Download Asset
          </a>
        </div>
      )}
    </div>
  );
};

export const PaletteCard: React.FC<{ palette: BrandIdentity['palette'] }> = ({ palette }) => {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="mb-6 flex items-center gap-2">
        <PaletteIcon className="h-5 w-5 text-zinc-400" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Color Palette</h3>
      </div>
      <div className="grid gap-4">
        {palette.map((color, i) => (
          <motion.div 
            key={color.hex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4"
          >
            <div 
              className="h-12 w-12 shrink-0 rounded-lg shadow-inner"
              style={{ backgroundColor: color.hex }}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold uppercase">{color.hex}</span>
                <span className="text-xs font-medium text-zinc-400">{color.name}</span>
              </div>
              <p className="text-xs text-zinc-500">{color.usage}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const TypographyCard: React.FC<{ typography: BrandIdentity['typography'] }> = ({ typography }) => {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="mb-6 flex items-center gap-2">
        <TypeIcon className="h-5 w-5 text-zinc-400" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Typography</h3>
      </div>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Header Font</span>
            <span className="text-xs font-bold text-zinc-900">{typography.headerFont}</span>
          </div>
          <p className="text-3xl tracking-tight text-zinc-900" style={{ fontFamily: typography.headerFont }}>
            The quick brown fox jumps over the lazy dog.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Body Font</span>
            <span className="text-xs font-bold text-zinc-900">{typography.bodyFont}</span>
          </div>
          <p className="text-sm leading-relaxed text-zinc-600" style={{ fontFamily: typography.bodyFont }}>
            Design is not just what it looks like and feels like. Design is how it works. 
            Great design is a multi-layered relationship between human life and its environment.
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-4">
          <p className="text-xs italic text-zinc-500 leading-relaxed">
            {typography.reasoning}
          </p>
        </div>
      </div>
    </div>
  );
};
