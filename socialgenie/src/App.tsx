import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Send, 
  Loader2, 
  Image as ImageIcon, 
  Settings2,
  Copy,
  Check,
  RefreshCw,
  Download,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { generateSocialContent, generateImage, type SocialPost, type Tone, type ImageSize } from "@/lib/gemini";
import { cn } from "@/lib/utils";

// Extend window for AI Studio APIs
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [idea, setIdea] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [imageSize, setImageSize] = useState<ImageSize>("1K");
  const [globalAspectRatio, setGlobalAspectRatio] = useState<string>("auto");
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SocialPost[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  // API Key Selection State
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback for local dev or if API is missing
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true); // Assume success as per skill instructions
    }
  };

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    
    setLoading(true);
    setResults([]);
    setImages({});
    setGeneratingImages({});
    
    try {
      const posts = await generateSocialContent(idea, tone);
      setResults(posts);
      
      // Start generating images for each platform
      posts.forEach(async (post) => {
        setGeneratingImages(prev => ({ ...prev, [post.platform]: true }));
        const ar = globalAspectRatio === "auto" ? post.aspectRatio : globalAspectRatio;
        const img = await generateImage(post.imagePrompt, ar, imageSize);
        if (img) {
          setImages(prev => ({ ...prev, [post.platform]: img }));
        }
        setGeneratingImages(prev => ({ ...prev, [post.platform]: false }));
      });
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadImage = (base64: string, filename: string) => {
    const link = document.createElement("a");
    link.href = base64;
    link.download = filename;
    link.click();
  };

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl shadow-blue-100/50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">API Key Required</CardTitle>
            <CardDescription>
              To use studio-quality image generation (Gemini 3 Pro Image), you must select a paid API key.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              This application uses advanced models that require a billing-enabled Google Cloud project.
            </p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl"
              onClick={handleSelectKey}
            >
              Select API Key
            </Button>
            <p className="text-[10px] text-center text-gray-400">
              Learn more about <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline">Gemini API billing</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasKey === null) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">SocialGenie</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="font-medium bg-blue-50 text-blue-700 border-blue-100">
              v1.0 Beta
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden">
            <CardHeader className="bg-white border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-gray-500" />
                Configuration
              </CardTitle>
              <CardDescription>Define your content goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label htmlFor="idea" className="text-sm font-semibold text-gray-700">Your Idea</Label>
                <Textarea 
                  id="idea"
                  placeholder="e.g. A new sustainable coffee brand launching in Seattle..."
                  className="min-h-[120px] resize-none border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Tone of Voice</Label>
                <RadioGroup 
                  value={tone} 
                  onValueChange={(v) => setTone(v as Tone)}
                  className="grid grid-cols-1 gap-2"
                >
                  {[
                    { value: "professional", label: "Professional", desc: "Corporate & Trustworthy" },
                    { value: "witty", label: "Witty", desc: "Humorous & Engaging" },
                    { value: "urgent", label: "Urgent", desc: "Action-oriented & Fast" }
                  ].map((t) => (
                    <div key={t.value} className="relative">
                      <RadioGroupItem 
                        value={t.value} 
                        id={t.value} 
                        className="peer sr-only" 
                      />
                      <Label
                        htmlFor={t.value}
                        className={cn(
                          "flex flex-col p-3 border rounded-xl cursor-pointer transition-all hover:bg-gray-50",
                          "peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-blue-600",
                          "border-gray-200"
                        )}
                      >
                        <span className="font-bold text-sm">{t.label}</span>
                        <span className="text-xs text-gray-500">{t.desc}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Image Quality</Label>
                  <Select value={imageSize} onValueChange={(v) => setImageSize(v as ImageSize)}>
                    <SelectTrigger className="border-gray-200 rounded-lg">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1K">1K Resolution</SelectItem>
                      <SelectItem value="2K">2K Resolution</SelectItem>
                      <SelectItem value="4K">4K Resolution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Aspect Ratio Override</Label>
                  <Select value={globalAspectRatio} onValueChange={setGlobalAspectRatio}>
                    <SelectTrigger className="border-gray-200 rounded-lg">
                      <SelectValue placeholder="Platform Default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Platform Default</SelectItem>
                      <SelectItem value="1:1">1:1 Square</SelectItem>
                      <SelectItem value="4:3">4:3 Standard</SelectItem>
                      <SelectItem value="3:4">3:4 Portrait</SelectItem>
                      <SelectItem value="16:9">16:9 Widescreen</SelectItem>
                      <SelectItem value="9:16">9:16 Story</SelectItem>
                      <SelectItem value="3:2">3:2 Classic</SelectItem>
                      <SelectItem value="2:3">2:3 Tall</SelectItem>
                      <SelectItem value="21:9">21:9 Ultra-wide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t p-4">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                onClick={handleGenerate}
                disabled={loading || !idea.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Results Main Area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!loading && results.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to create?</h3>
                <p className="text-gray-500 max-w-md">
                  Enter your idea on the left and SocialGenie will craft platform-specific posts and studio-quality images for you.
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <Tabs defaultValue="linkedin" className="w-full">
                  <div className="flex items-center justify-between mb-6">
                    <TabsList className="bg-white border p-1 h-12 rounded-2xl shadow-sm">
                      <TabsTrigger value="linkedin" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </TabsTrigger>
                      <TabsTrigger value="twitter" className="rounded-xl px-6 data-[state=active]:bg-[#1DA1F2] data-[state=active]:text-white transition-all">
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter/X
                      </TabsTrigger>
                      <TabsTrigger value="instagram" className="rounded-xl px-6 data-[state=active]:bg-gradient-to-tr data-[state=active]:from-[#f9ce34] data-[state=active]:via-[#ee2a7b] data-[state=active]:to-[#6228d7] data-[state=active]:text-white transition-all">
                        <Instagram className="w-4 h-4 mr-2" />
                        Instagram
                      </TabsTrigger>
                    </TabsList>
                    
                    {loading && (
                      <div className="flex items-center gap-2 text-blue-600 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Crafting content...</span>
                      </div>
                    )}
                  </div>

                  {["linkedin", "twitter", "instagram"].map((platform) => {
                    const post = results.find(r => r.platform === platform);
                    const image = images[platform];
                    const isGeneratingImg = generatingImages[platform];

                    return (
                      <TabsContent key={platform} value={platform} className="mt-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Text Content */}
                          <Card className="border-none shadow-xl shadow-gray-200/50 flex flex-col h-full">
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Draft Content</CardTitle>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 rounded-lg hover:bg-gray-100"
                                  onClick={() => post && copyToClipboard(post.content, platform)}
                                >
                                  {copied === platform ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                  <span className="ml-2">{copied === platform ? "Copied" : "Copy"}</span>
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                              {loading ? (
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-[90%]" />
                                  <Skeleton className="h-4 w-[95%]" />
                                  <Skeleton className="h-4 w-[80%]" />
                                </div>
                              ) : (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[200px] whitespace-pre-wrap text-gray-800 leading-relaxed">
                                  {post?.content}
                                </div>
                              )}
                            </CardContent>
                            <CardFooter className="border-t pt-4 flex justify-between items-center">
                              <div className="flex gap-2">
                                {platform === "instagram" && (
                                  <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-100">Hashtags Included</Badge>
                                )}
                                {platform === "linkedin" && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">Long-form</Badge>
                                )}
                                {platform === "twitter" && (
                                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-100">Punchy</Badge>
                                )}
                              </div>
                            </CardFooter>
                          </Card>

                          {/* Image Content */}
                          <Card className="border-none shadow-xl shadow-gray-200/50 flex flex-col h-full overflow-hidden">
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <ImageIcon className="w-5 h-5 text-gray-400" />
                                  Visual Asset
                                </CardTitle>
                                {image && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 rounded-lg"
                                    onClick={() => downloadImage(image, `${platform}-post.png`)}
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Save
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="flex-grow flex items-center justify-center p-0 bg-gray-100 min-h-[300px] relative">
                              {isGeneratingImg ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                                  <div className="relative">
                                    <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <ImageIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                  </div>
                                  <p className="mt-4 text-sm font-semibold text-blue-700">Generating {imageSize} Image...</p>
                                  <p className="text-xs text-gray-500 mt-1">Studio quality rendering</p>
                                </div>
                              ) : null}

                              {image ? (
                                <motion.img 
                                  initial={{ opacity: 0, scale: 1.05 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  src={image} 
                                  alt={`${platform} visual`}
                                  className="w-full h-full object-contain max-h-[400px]"
                                  referrerPolicy="no-referrer"
                                />
                              ) : !isGeneratingImg && !loading ? (
                                <div className="text-center p-8">
                                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                  <p className="text-sm text-gray-400">No image generated yet</p>
                                </div>
                              ) : (
                                <Skeleton className="w-full h-full absolute inset-0" />
                              )}
                            </CardContent>
                            <CardFooter className="border-t pt-4 bg-white">
                              <div className="w-full">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Image Prompt</Label>
                                <p className="text-[11px] text-gray-500 line-clamp-2 italic">
                                  {post?.imagePrompt || "Waiting for generation..."}
                                </p>
                              </div>
                            </CardFooter>
                          </Card>
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-6xl mx-auto px-4 py-12 border-t mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-tight">SocialGenie AI</span>
          </div>
          <p className="text-xs text-gray-400 text-center md:text-right max-w-sm">
            Powered by Gemini 3.1 Pro for text and Gemini 3 Pro Image for studio-quality visuals. 
            All content is AI-generated and should be reviewed before posting.
          </p>
        </div>
      </footer>
    </div>
  );
}
