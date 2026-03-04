import React from 'react';
import { motion } from 'motion/react';

interface GaugeProps {
  score: number;
  label: string;
}

export const Gauge: React.FC<GaugeProps> = ({ score, label }) => {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s < 30) return '#10b981'; // Green
    if (s < 70) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          {/* Outer Glow Ring */}
          <circle
            cx="80"
            cy="80"
            r={radius + 4}
            stroke="currentColor"
            strokeWidth="0.5"
            fill="transparent"
            className="text-white/5"
          />
          {/* Background Ring */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="1"
            fill="transparent"
            className="text-white/10"
          />
          {/* Progress Ring */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke={getColor(score)}
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${getColor(score)}44)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-serif italic tracking-tighter leading-none">{Math.round(score)}%</span>
          <span className="text-[8px] uppercase tracking-[0.4em] text-zinc-600 font-bold mt-2">Index</span>
        </div>
      </div>
      <div className="mt-6 flex flex-col items-center gap-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500">{label}</p>
        <div className="w-8 h-[1px] bg-white/10" />
      </div>
    </div>
  );
};
