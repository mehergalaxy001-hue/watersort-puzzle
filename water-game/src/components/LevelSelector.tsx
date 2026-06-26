/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trophy, HelpCircle, Flame, Star, Lock, Unlock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { audio } from '../utils/audio';

interface LevelSelectorProps {
  currentLevel: number;
  maxUnlockedLevel: number;
  onSelectLevel: (level: number) => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  currentLevel,
  maxUnlockedLevel,
  onSelectLevel,
}) => {
  // We show levels in groups of 1000 across 10 pages total (10,000 levels)
  const ITEMS_PER_PAGE = 1000;
  const totalLevels = 10000;

  // Initialize page to show the current level
  const [currentPage, setCurrentPage] = useState<number>(() => {
    return Math.floor((currentLevel - 1) / ITEMS_PER_PAGE);
  });

  // Track search input value
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchError, setSearchError] = useState<string>('');

  // Sync page when currentLevel changes
  useEffect(() => {
    setCurrentPage(Math.floor((currentLevel - 1) / ITEMS_PER_PAGE));
  }, [currentLevel]);

  const getDifficulty = (lvl: number): { name: string; color: string; icon: React.ReactNode } => {
    if (lvl <= 10) {
      return { name: 'Easy', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: <Star className="w-3 h-3 mr-0.5" /> };
    }
    if (lvl <= 50) {
      return { name: 'Medium', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: <HelpCircle className="w-3 h-3 mr-0.5" /> };
    }
    if (lvl <= 500) {
      return { name: 'Medium Hard', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: <HelpCircle className="w-3 h-3 mr-0.5" /> };
    }
    if (lvl <= 1500) {
      return { name: 'Hard', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: <Flame className="w-3 h-3 mr-0.5" /> };
    }
    if (lvl <= 3000) {
      return { name: 'Full Hard', color: 'bg-red-500/25 text-red-500 border-red-500/35', icon: <Flame className="w-3 h-3 mr-0.5" /> };
    }
    if (lvl <= 6500) {
      return { name: 'Expert', color: 'bg-purple-500/25 text-purple-400 border-purple-500/35', icon: <Flame className="w-3 h-3 mr-0.5" /> };
    }
    return { name: 'Heavy Heavy Hard', color: 'bg-fuchsia-500/25 text-fuchsia-400 border-fuchsia-500/35 animate-pulse', icon: <Flame className="w-3 h-3 mr-0.5 animate-bounce" /> };
  };

  const handleLevelClick = (lvl: number) => {
    if (lvl > maxUnlockedLevel) {
      audio.playInvalid();
      setSearchError(`Level ${lvl} is locked! Clear previous levels first!`);
      setTimeout(() => setSearchError(''), 3000);
      return;
    }
    audio.playClick();
    setSearchError('');
    onSelectLevel(lvl);
  };

  const startLevelNum = currentPage * ITEMS_PER_PAGE + 1;
  const pageLevels = Array.from(
    { length: Math.min(ITEMS_PER_PAGE, totalLevels - startLevelNum + 1) },
    (_, i) => startLevelNum + i
  );

  const totalPages = Math.ceil(totalLevels / ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    if (currentPage > 0) {
      audio.playClick();
      setCurrentPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    const highestPageWithUnlocked = Math.floor((maxUnlockedLevel - 1) / ITEMS_PER_PAGE);
    if (currentPage < highestPageWithUnlocked) {
      audio.playClick();
      setCurrentPage((p) => p + 1);
    } else {
      audio.playInvalid();
      setSearchError('Next levels are currently locked!');
      setTimeout(() => setSearchError(''), 3000);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(searchValue, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > totalLevels) {
      audio.playInvalid();
      setSearchError(`Please enter a valid level between 1 and ${totalLevels}.`);
      return;
    }

    if (parsed > maxUnlockedLevel) {
      audio.playInvalid();
      setSearchError(`Level ${parsed} is locked! Complete level ${maxUnlockedLevel - 1} first!`);
      return;
    }

    // Success! Find that level
    audio.playClick();
    setSearchError('');
    setSearchValue('');
    onSelectLevel(parsed);
  };

  // Quick milestones list
  const milestones = [1, 10, 50, 100, 500, 1000, 2000, 3000, 5000, 8000, 10000];

  return (
    <div className="w-full max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto bg-white/95 backdrop-blur-xl border-2 border-sky-100 rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden text-slate-800">
      
      {/* Visual background highlight decor */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Trophy className="w-4.5 h-4.5 text-amber-500" />
            Select Level (1 - 10000)
          </h2>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5 font-bold uppercase tracking-wide">
            🏆 Completed levels remain unlocked
          </p>
        </div>
        <div className="bg-slate-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-slate-200/40 font-mono text-[10px] font-black self-start sm:self-center shadow-xs">
          ⚡ {maxUnlockedLevel - 1} / {totalLevels} SOLVED
        </div>
      </div>

      {/* Level Search box */}
      <form onSubmit={handleSearchSubmit} className="mb-5 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={`Jump to level (e.g. ${Math.min(maxUnlockedLevel, 10000)})...`}
            className="w-full h-11 bg-slate-50 border-2 border-slate-100 rounded-xl px-3.5 pl-10 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition"
            min={1}
            max={totalLevels}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>
        <button
          type="submit"
          className="h-11 px-4 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border-b-2 border-amber-600 active:translate-y-0.5 shadow-sm"
        >
          GO
        </button>
      </form>

      {searchError && (
        <div className="mb-4 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg font-mono animate-shake">
          ⚠️ {searchError}
        </div>
      )}

      {/* Level pagination row */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all flex items-center gap-1 ${
            currentPage === 0
              ? 'bg-slate-100/50 text-slate-350 cursor-not-allowed'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/30 cursor-pointer shadow-2xs'
          }`}
        >
          <ChevronLeft className="w-3 h-3 stroke-[3]" />
          Prev
        </button>

        <span className="text-xs font-mono font-bold text-slate-600">
          Page {currentPage + 1} / {totalPages} (Lvl {startLevelNum} - {startLevelNum + pageLevels.length - 1})
        </span>

        <button
          onClick={handleNextPage}
          className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/30 rounded-lg text-[10px] font-extrabold uppercase transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
        >
          Next
          <ChevronRight className="w-3 h-3 stroke-[3]" />
        </button>
      </div>

      {/* Grid of levels */}
      <div className="max-h-[350px] sm:max-h-[440px] md:max-h-[500px] overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2.5 md:gap-3">
          {pageLevels.map((lvl) => {
            const isCurrent = lvl === currentLevel;
            const isLocked = lvl > maxUnlockedLevel;
            const diff = getDifficulty(lvl);

            return (
              <button
                onClick={() => handleLevelClick(lvl)}
                key={lvl}
                disabled={false} // Clickable to trigger lock alarm/warning
                className={`relative flex flex-col items-center justify-center h-16 sm:h-20 md:h-24 md:text-lg rounded-2xl border transition-all duration-300 focus:outline-none ${
                  isCurrent
                    ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 border-amber-300 font-bold scale-102 shadow-lg shadow-amber-400/25'
                    : isLocked
                    ? 'bg-slate-50/40 text-slate-400 border-slate-100 cursor-pointer hover:bg-slate-100/40'
                    : 'bg-slate-100/65 hover:bg-slate-250 text-slate-850 border-slate-200/60 hover:border-slate-300 cursor-pointer shadow-2xs'
                }`}
              >
                <div className="absolute top-1.5 right-1.5 opacity-80">
                  {isLocked ? (
                    <Lock className="w-2.5 h-2.5 text-slate-300" />
                  ) : isCurrent ? (
                    <Unlock className="w-2.5 h-2.5 text-slate-950" />
                  ) : null}
                </div>

                <div className={`text-[8px] md:text-[9.5px] font-mono font-bold uppercase tracking-wider ${isCurrent ? 'text-slate-900 opacity-85' : 'text-slate-450'} mb-0.5`}>
                  Lvl
                </div>
                <div className="text-sm sm:text-base md:text-xl font-black leading-none my-0.5">{lvl}</div>

                {!isLocked && (
                  <div
                    className={`mt-1 flex items-center text-[7.5px] md:text-[8.5px] uppercase font-black tracking-wider px-1 sm:px-1.5 py-0.5 rounded-md ${
                      isCurrent ? 'bg-slate-950/15 text-slate-900' : 'bg-slate-200/50 text-slate-700'
                    }`}
                  >
                    {diff.name}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick milestone jump section */}
      <div className="mt-5 pt-3 border-t border-slate-100">
        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1.5">
          ⭐ Quick Milestone Jumps:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {milestones.map((m) => {
            const isMilestoneLocked = m > maxUnlockedLevel;
            return (
              <button
                key={m}
                onClick={() => {
                  if (isMilestoneLocked) {
                    audio.playInvalid();
                    setSearchError(`Milestone Level ${m} is locked! Solve up to Level ${m} to jump here.`);
                    setTimeout(() => setSearchError(''), 3000);
                  } else {
                    audio.playClick();
                    onSelectLevel(m);
                  }
                }}
                className={`px-2 py-1 text-[9px] font-mono font-bold rounded-md transition-all ${
                  isMilestoneLocked
                    ? 'bg-slate-50/40 text-slate-400 border border-slate-100 cursor-pointer hover:bg-slate-100/40'
                    : m === currentLevel
                    ? 'bg-amber-400 text-slate-950 font-black border border-amber-400 shadow-3xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/50 cursor-pointer'
                }`}
              >
                Lvl {m} {isMilestoneLocked && '🔒'}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
