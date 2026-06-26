/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Footprints } from 'lucide-react';

interface StatsProps {
  currentLevel: number;
  movesCount: number;
  status: 'playing' | 'won' | 'menu' | 'home' | 'level-select';
}

export const Stats: React.FC<StatsProps> = ({
  currentLevel,
  movesCount,
}) => {
  return (
    <div className="flex items-center justify-between w-full max-w-xl mx-auto px-6 py-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl select-none">
      {/* Current Level */}
      <div className="flex items-center gap-3">
        <div className="bg-amber-400 text-slate-950 px-2.5 py-1 rounded-xl font-black text-xs leading-none">
          LVL
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Level</span>
          <span className="text-sm font-black text-slate-200 mt-1">{currentLevel}</span>
        </div>
      </div>

      {/* Moves Count called STEPS */}
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-xl border border-emerald-500/30">
          <Footprints className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">STEPS</span>
          <span className="text-sm font-mono font-black text-slate-200 mt-1">{movesCount}</span>
        </div>
      </div>
    </div>
  );
};

