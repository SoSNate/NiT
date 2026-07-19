import React, { useState } from 'react';
import { ChevronRight, Smartphone, Zap } from 'lucide-react';

interface DualPaneLayoutProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  onCompanionSync?: () => void;
  companionActive?: boolean;
}

export default function DualPaneLayout({
  title,
  subtitle,
  onBack,
  leftContent,
  rightContent,
  onCompanionSync,
  companionActive
}: DualPaneLayoutProps) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Top Header */}
      <header className="border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-xl px-6 py-4 sticky top-0 z-30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-white">{title}</h1>
            <p className="text-slate-400 text-xs">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onCompanionSync && (
            <button
              onClick={onCompanionSync}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
                companionActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Smartphone size={16} />
              <span>{companionActive ? 'סנכרון מובייל פעיל' : 'חבר טלפון'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Split panes */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Content / Formula / Theory (40%) */}
        <div className="w-full md:w-[42%] border-l border-white/5 bg-[#0b1329] overflow-y-auto p-6 space-y-6">
          {leftContent}
        </div>

        {/* Right Side: Interactive Sandbox / Visual Simulator (58%) */}
        <div className="w-full md:w-[58%] bg-[#020617] p-6 overflow-y-auto flex flex-col justify-center">
          {rightContent}
        </div>
      </div>
    </div>
  );
}
