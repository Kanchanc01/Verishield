import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  FileText, 
  Image as ImageIcon, 
  Mic, 
  Video, 
  Upload, 
  Search, 
  Loader2, 
  AlertCircle,
  X
} from 'lucide-react';
import { analyzeContent } from './services/gemini';
import { AnalysisCard } from './components/AnalysisCard';
import { AnalysisState, MediaType, AnalysisResult } from './types';
import { cn } from './utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<MediaType>('text');
  const [textInput, setTextInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<string>('');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (tab: MediaType) => {
    setActiveTab(tab);
    setAnalysis({ isAnalyzing: false, result: null, error: null });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFileMetadata(`File: ${file.name}, Type: ${file.type}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }
  };

  const startAnalysis = async () => {
    setAnalysis({ isAnalyzing: true, result: null, error: null });
    try {
      let content = '';
      let mimeType = '';

      if (activeTab === 'text') {
        if (!textInput.trim()) throw new Error("Please enter text to analyze.");
        content = textInput;
      } else if (activeTab === 'image') {
        if (!imagePreview) throw new Error("Please upload an image.");
        content = imagePreview;
        mimeType = imagePreview.split(';')[0].split(':')[1];
      } else {
        if (!fileMetadata) throw new Error(`Please upload a ${activeTab} file.`);
        content = fileMetadata;
      }

      const result = await analyzeContent(activeTab, content, mimeType);
      setAnalysis({ isAnalyzing: false, result, error: null });
      setHistory(prev => [result, ...prev].slice(0, 5));
    } catch (err: any) {
      setAnalysis({ isAnalyzing: false, result: null, error: err.message });
    }
  };

  const reset = () => {
    setTextInput('');
    setImagePreview(null);
    setFileMetadata('');
    setAnalysis({ isAnalyzing: false, result: null, error: null });
  };

  return (
    <div className="min-h-screen selection:bg-emerald-500/30">
      {/* Immersive Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="w-10 h-10 glass rounded-full flex items-center justify-center">
            <Shield className="text-emerald-400 w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-serif italic text-2xl tracking-tight leading-none">VeriShield</h1>
            <span className="text-[8px] uppercase tracking-[0.4em] text-emerald-500/60 font-bold">Forensic Intelligence</span>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Archive</a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">Ethics</a>
          </nav>
          <div className="h-8 w-[1px] bg-white/10" />
          <span className="text-[10px] font-mono text-zinc-500">{new Date().toLocaleDateString()}</span>
        </div>
      </header>

      <main className="pt-32 pb-24 px-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          
          {/* Left: Interaction Pane */}
          <div className="space-y-12">
            <section>
              <h2 className="font-serif text-7xl md:text-8xl leading-[0.85] tracking-tighter mb-8">
                The <span className="italic text-emerald-400">Truth</span> <br />
                Behind Media.
              </h2>
              <p className="text-zinc-500 text-lg max-w-md leading-relaxed">
                Advanced forensic analysis for the age of synthetic media. 
                Upload content to reveal AI-generated patterns.
              </p>
            </section>

            {/* Tabs & Input */}
            <div className="space-y-6">
              <div className="flex gap-6 border-b border-white/10 pb-4">
                {(['text', 'image', 'audio', 'video'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative pb-4",
                      activeTab === tab 
                        ? "text-white" 
                        : "text-zinc-600 hover:text-zinc-400"
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="glass rounded-3xl p-8 min-h-[400px] flex flex-col relative group">
                <AnimatePresence mode="wait">
                  {activeTab === 'text' ? (
                    <motion.textarea
                      key="text-input"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      placeholder="Enter text for linguistic analysis..."
                      className="flex-1 w-full bg-transparent border-none focus:ring-0 resize-none text-lg leading-relaxed placeholder:text-zinc-800 font-serif italic"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                    />
                  ) : (
                    <motion.div
                      key="file-input"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-emerald-500/50 transition-colors cursor-pointer relative overflow-hidden"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept={activeTab === 'image' ? 'image/*' : activeTab === 'audio' ? 'audio/*' : 'video/*'}
                      />
                      
                      {imagePreview && activeTab === 'image' ? (
                        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          {analysis.isAnalyzing && (
                            <div className="absolute inset-0 bg-emerald-500/20">
                              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.8)] scan-line" />
                            </div>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setImagePreview(null); }}
                            className="absolute top-4 right-4 p-2 glass rounded-full hover:bg-white/10 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : fileMetadata ? (
                        <div className="flex flex-col items-center gap-6">
                          <div className="w-20 h-20 glass rounded-full flex items-center justify-center">
                            {activeTab === 'audio' ? <Mic className="w-8 h-8 text-emerald-400" /> : <Video className="w-8 h-8 text-emerald-400" />}
                          </div>
                          <p className="text-sm font-mono text-zinc-400 tracking-widest">{fileMetadata}</p>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setFileMetadata(''); }}
                            className="text-[10px] font-bold text-red-400 uppercase tracking-[0.3em]"
                          >
                            Discard
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 glass rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Upload className="text-zinc-600 w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold uppercase tracking-[0.2em] mb-2">Upload {activeTab}</p>
                          <p className="text-xs text-zinc-600">Drag and drop or click to browse</p>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-8 flex items-center justify-between">
                  <button 
                    onClick={reset}
                    className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={startAnalysis}
                    disabled={analysis.isAnalyzing}
                    className="glass px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-white/10 disabled:opacity-50 transition-all group"
                  >
                    {analysis.isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                        Analyzing
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 group-hover:text-emerald-400 transition-colors" />
                        Initiate Scan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <motion.section 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600">Recent Scans</h3>
                <div className="grid grid-cols-1 gap-4">
                  {history.map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setAnalysis({ isAnalyzing: false, result: item, error: null })}
                      className="glass p-4 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          item.isAI ? "bg-red-500" : "bg-emerald-500"
                        )} />
                        <span className="text-xs font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors">
                          {item.metadata?.forensicHash}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                        {Math.round(item.confidenceScore)}% Confidence
                      </span>
                    </button>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* Right: Results Pane */}
          <div className="lg:sticky lg:top-32">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600">Forensic Output</h3>
              {analysis.result && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-mono text-emerald-500 uppercase">Live Data</span>
                </div>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {!analysis.result && !analysis.isAnalyzing ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-3xl p-20 text-center flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 glass rounded-full flex items-center justify-center mb-8 opacity-20">
                    <Shield className="w-8 h-8" />
                  </div>
                  <p className="font-serif italic text-2xl text-zinc-600 mb-2">Awaiting Data</p>
                  <p className="text-[10px] text-zinc-700 uppercase tracking-[0.3em]">System Standby</p>
                </motion.div>
              ) : analysis.isAnalyzing ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="h-[300px] glass rounded-3xl flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 border border-emerald-500/20 rounded-full animate-ping absolute inset-0" />
                      <div className="w-24 h-24 glass rounded-full flex items-center justify-center relative">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-emerald-400 mb-2">Scanning Neural Patterns</p>
                      <p className="text-[9px] font-mono text-zinc-600">DECODING ARTIFACTS...</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-1/3 h-full bg-emerald-500/50"
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-zinc-700 uppercase tracking-widest">
                      <span>Layer Analysis</span>
                      <span>84% Complete</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                analysis.result && <AnalysisCard result={analysis.result} />
              )}
            </AnimatePresence>

            {analysis.error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 p-6 glass border-red-500/20 rounded-2xl flex items-start gap-4"
              >
                <AlertCircle className="text-red-500 w-5 h-5 shrink-0" />
                <p className="text-sm text-red-400 font-medium leading-relaxed">{analysis.error}</p>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <footer className="px-8 py-12 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">© 2026 VeriShield Intelligence</p>
            <div className="h-4 w-[1px] bg-white/10" />
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Neural Forensic Engine v4.2</p>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-colors">Legal</a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
