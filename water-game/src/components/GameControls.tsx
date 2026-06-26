/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RotateCcw, Undo2, PlusCircle, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { audio } from '../utils/audio';

interface GameControlsProps {
  onRestart: () => void;
  onUndo: () => void;
  onAddBottle: () => void;
  onToggleHint: () => void;
  canUndo: boolean;
  canAddBottle: boolean;
  isHintActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onRestart,
  onUndo,
  onAddBottle,
  onToggleHint,
  canUndo,
  canAddBottle,
  isHintActive,
  isMuted,
  onToggleMute,
}) => {
  const triggerButton = (callback: () => void) => {
    audio.playClick();
    callback();
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-xl mx-auto py-4 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 px-4">
      {/* Undo Button */}
      <button
        onClick={() => triggerButton(onUndo)}
        disabled={!canUndo}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all focus:outline-none ${
          canUndo
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 cursor-pointer shadow-md'
            : 'bg-slate-800/20 text-slate-600 cursor-not-allowed border border-slate-800/30'
        }`}
        title="Undo Last Move"
      >
        <Undo2 className="w-4 h-4" />
        <span>Undo</span>
      </button>

      {/* Restart Button */}
      <button
        onClick={() => triggerButton(onRestart)}
        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-705 text-slate-100 hover:bg-slate-700 font-bold text-sm tracking-wide cursor-pointer transition-all focus:outline-none shadow-md"
        title="Restart Current Level"
      >
        <RotateCcw className="w-4 h-4 text-rose-400" />
        <span>Reset</span>
      </button>

      {/* Add Bottle Modifier */}
      <button
        onClick={() => triggerButton(onAddBottle)}
        disabled={!canAddBottle}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all focus:outline-none ${
          canAddBottle
            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 cursor-pointer shadow-md'
            : 'bg-slate-800/20 text-slate-600 border border-slate-850 cursor-not-allowed'
        }`}
        title="Add one extra empty tube to assist sorting"
      >
        <PlusCircle className="w-4 h-4 text-amber-500" />
        <span>+ Tube</span>
      </button>

      {/* Hint Helper */}
      <button
        onClick={() => triggerButton(onToggleHint)}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all focus:outline-none cursor-pointer border ${
          isHintActive
            ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse font-extrabold shadow-lg shadow-emerald-500/20'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-750'
        }`}
        title="Get visual hint of a legal move"
      >
        <HelpCircle className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
        <span>{isHintActive ? 'Hide Hint' : 'Hint'}</span>
      </button>

      {/* Mute Button */}
      <button
        onClick={() => triggerButton(onToggleMute)}
        className="flex items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer transition-all border border-slate-750 focus:outline-none"
        title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-rose-400" />
        ) : (
          <Volume2 className="w-4 h-4 text-emerald-400" />
        )}
      </button>
    </div>
  );
};
