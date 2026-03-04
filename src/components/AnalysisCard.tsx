import React from 'react';
import { AnalysisResult } from '../types';
import { Gauge } from './Gauge';
import { AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../utils';

interface AnalysisCardProps {
  result: AnalysisResult;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ result }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full glass rounded-[2rem] overflow-hidden shadow-2xl"
    >
      {/* Forensic Header */}
      <div className="bg-white/5 p-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Forensic Dossier</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 tracking-widest">HASH: {result.metadata?.forensicHash || 'N/A'}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-white/10">
        <div className="p-10 flex items-center justify-center bg-white/[0.02] border-r border-white/10">
          <Gauge score={result.confidenceScore} label="Neural Match Index" />
        </div>
        <div className="col-span-2 p-10 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-6">
            <div className={cn(
              "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border",
              result.isAI ? "border-red-500/30 text-red-400 bg-red-500/10" : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
            )}>
              {result.isAI ? "Synthetic" : "Authentic"}
            </div>
            <h3 className="text-3xl font-serif italic tracking-tight">
              {result.isAI ? "AI Generated" : "Human Authentic"}
            </h3>
          </div>
          <p className="text-zinc-400 text-lg leading-relaxed font-serif italic opacity-80">
            "{result.summary}"
          </p>
        </div>
      </div>

      <div className="p-10">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2">
            <ShieldAlert className="w-3 h-3" />
            Artifact Detection Log
          </h4>
          <div className="h-[1px] flex-1 mx-6 bg-white/5" />
        </div>
        
        <div className="space-y-4">
          {result.indicators.map((indicator, idx) => (
            <div 
              key={idx} 
              className="flex items-start gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group"
            >
              <div className="flex flex-col items-center gap-2 min-w-[70px] pt-1">
                <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">Severity</span>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: indicator.severity === 'high' ? '100%' : indicator.severity === 'medium' ? '60%' : '30%' }}
                    className={cn(
                      "h-full",
                      indicator.severity === 'high' ? 'bg-red-500' : 
                      indicator.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    )}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif italic text-lg text-zinc-200 group-hover:text-white transition-colors">
                    {indicator.label}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-600">TRC_0{idx + 1}</span>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {indicator.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-black/40 p-6 flex items-center justify-between border-t border-white/5">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Engine</span>
            <span className="text-[10px] text-zinc-400 font-mono tracking-widest">{result.metadata?.modelVersion || 'G3-FORENSIC'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Latency</span>
            <span className="text-[10px] text-zinc-400 font-mono tracking-widest">{result.metadata?.analysisLatency || 0}ms</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Timestamp</span>
            <span className="text-[10px] text-zinc-400 font-mono tracking-widest">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
          <div className="w-1 h-1 rounded-full bg-emerald-500/30" />
          <div className="w-1 h-1 rounded-full bg-emerald-500/10" />
        </div>
      </div>
    </motion.div>
  );
};
