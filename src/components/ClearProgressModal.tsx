import React from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { useTheme } from '../context/ThemeContext';

interface ClearProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => void;
  summary: {
    reviewedCardsCount: number;
    customCardsCount: number;
    totalReviews: number;
    streakDays: number;
  };
}

export const ClearProgressModal: React.FC<ClearProgressModalProps> = ({
  isOpen,
  onClose,
  onConfirmClear,
  summary,
}) => {
  const {
    isSkeuomorphic,
    isCyberpunk,
    isMaterial,
    isEditorial,
    isSlate,
    isClay,
    isSaas,
    isNordic,
    isGlass,
    isBrutal,
    isObsidian,
  } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isSkeuomorphic
          ? 'bg-[#120804]/75 backdrop-blur-xs font-sans'
          : isCyberpunk
          ? 'bg-[#04050E]/80 backdrop-blur-md font-sans'
          : isMaterial
          ? 'bg-slate-900/40 backdrop-blur-xs font-material'
          : isEditorial
          ? 'bg-[#1D1814]/45 backdrop-blur-xs font-editorial-body'
          : isSlate
          ? 'bg-slate-950/75 backdrop-blur-xs font-sans'
          : isClay
          ? 'bg-[#1E2547]/30 backdrop-blur-sm font-sans'
          : isSaas
          ? 'bg-slate-900/35 backdrop-blur-sm font-sans'
          : isNordic
          ? 'bg-[#242E28]/35 backdrop-blur-sm font-sans'
          : `bg-slate-950/70 backdrop-blur-md ${isBrutal || isObsidian || isGlass ? 'font-sans' : 'font-mono'}`
      }`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-progress-title"
        className={
          isSkeuomorphic
            ? 'skeuo-paper-elevated border-2 border-[#6B4A2B] border-t-4 border-t-[#8C1D18] rounded-lg max-w-md w-full p-6 text-[#1F140E]'
            : isCyberpunk
            ? 'cyber-card-elevated border border-[#FF2A85]/55 border-t-2 border-t-[#FF2A85] rounded-sm max-w-md w-full p-6'
            : isMaterial
            ? 'material-card-elevated border-t-4 border-t-[#D32F2F] rounded-xl max-w-md w-full p-6'
            : isEditorial
            ? 'editorial-card-elevated border-2 border-[#1D1814] rounded-none max-w-md w-full p-6'
            : isSlate
            ? 'slate-card-elevated border border-rose-500/45 rounded-lg max-w-md w-full p-6'
            : isClay
            ? 'clay-card-elevated border border-white/95 rounded-3xl max-w-md w-full p-6'
            : isSaas
            ? 'saas-card-elevated border border-slate-200 rounded-xl max-w-md w-full p-6'
            : isNordic
            ? 'nordic-card-elevated border border-[#DDD7C8] rounded-2xl max-w-md w-full p-6'
            : isBrutal
            ? 'bg-[#FFFDF5] border-2 border-black max-w-md w-full p-6 brutal-shadow-lg'
            : isObsidian
            ? 'obsidian-surface border border-[#D4AF37]/35 max-w-md w-full p-6'
            : isGlass
            ? 'glass-panel-elevated border border-white/25 rounded-2xl max-w-md w-full p-6'
            : 'bg-zinc-950 border border-zinc-750 rounded-lg max-w-md w-full p-6 shadow-2xl'
        }
      >
        <div
          className={`flex items-center justify-between mb-4 pb-3 ${
            isSkeuomorphic
              ? 'border-b-2 border-[#C8B896]'
              : isCyberpunk
              ? 'border-b border-cyan-400/25'
              : isMaterial
              ? 'border-b border-[#E2E8F0]'
              : isEditorial
              ? 'border-b-2 border-double border-[#1D1814]/70'
              : isSlate
              ? 'border-b border-slate-700/80'
              : isClay
              ? 'border-b border-[#DCE2F7]'
              : isSaas
              ? 'border-b border-slate-200'
              : isNordic
              ? 'border-b border-[#E4DFD4]'
              : isBrutal
              ? 'border-b-2 border-black'
              : isObsidian
              ? 'border-b border-[#2A241A]'
              : isGlass
              ? 'border-b border-white/15'
              : 'border-b border-zinc-800'
          }`}
        >
          <div
            id="clear-progress-title"
            className={
              isSkeuomorphic
                ? 'flex items-center gap-2 font-editorial-display text-lg font-bold tracking-tight text-[#8C1D18]'
                : isCyberpunk
                ? 'flex items-center gap-2 font-cyber text-base font-bold tracking-[0.1em] uppercase text-[#FF4DA6]'
                : isMaterial
                ? 'flex items-center gap-2 text-base font-bold tracking-tight text-[#C62828]'
                : isEditorial
                ? 'flex items-center gap-2 font-editorial-display text-lg font-bold tracking-tight text-[#9B2226]'
                : isSlate
                ? 'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-rose-300'
                : isClay
                ? 'flex items-center gap-2 text-sm font-bold tracking-wide uppercase text-[#9F1239]'
                : isSaas
                ? 'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-rose-700'
                : isNordic
                ? 'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-[#964B36]'
                : isBrutal
                ? 'flex items-center gap-2 text-sm font-black text-black tracking-tight'
                : isObsidian
                ? 'flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-[#E8A5A5]'
                : isGlass
                ? 'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-rose-200'
                : 'flex items-center gap-2 text-sm font-bold text-rose-400 tracking-wider'
            }
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>CLEAR SAVED BROWSER PROGRESS</span>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEffects.playKeyClick();
              onClose();
            }}
            className={
              isSkeuomorphic
                ? 'text-[#5C412E] hover:text-[#1F140E] cursor-pointer p-1'
                : isMaterial
                ? 'text-[#64748B] hover:text-[#111827] cursor-pointer p-1'
                : isEditorial
                ? 'text-[#574D42] hover:text-[#1D1814] cursor-pointer p-1'
                : isClay
                ? 'text-[#647094] hover:text-[#1E2547] cursor-pointer p-1'
                : isSaas
                ? 'text-slate-400 hover:text-slate-700 cursor-pointer p-1'
                : isNordic
                ? 'text-[#5C6962] hover:text-[#242E28] cursor-pointer p-1'
                : isBrutal
                ? 'text-black hover:bg-zinc-200 border border-black p-0.5 cursor-pointer'
                : 'text-slate-400 hover:text-white cursor-pointer p-1'
            }
            aria-label="Close confirmation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p
          className={
            isSkeuomorphic
              ? 'text-sm text-[#362217] leading-relaxed mb-4'
              : isMaterial
              ? 'text-sm text-[#334155] leading-relaxed mb-4'
              : isEditorial
              ? 'text-sm text-[#433A31] leading-relaxed mb-4'
              : isClay
              ? 'text-sm text-[#4B5478] leading-relaxed mb-4'
              : isSaas
              ? 'text-sm text-slate-600 leading-relaxed mb-4'
              : isNordic
              ? 'text-sm text-[#4E5A53] leading-relaxed mb-4'
              : isBrutal
              ? 'text-xs text-zinc-900 font-medium leading-relaxed mb-4'
              : 'text-sm text-slate-300 leading-relaxed mb-4'
          }
        >
          This clears all user training progress stored in your browser&apos;s local storage and resets the deck to its fresh starting state. Your selected UI theme will be preserved.
        </p>

        <div
          className={`space-y-2 mb-5 p-3.5 text-xs ${
            isSkeuomorphic
              ? 'skeuo-well rounded-md text-[#362217]'
              : isCyberpunk
              ? 'cyber-well rounded-sm text-slate-200'
              : isMaterial
              ? 'bg-[#E4E9F2] border border-[#CBD5E1] rounded-lg text-[#334155]'
              : isEditorial
              ? 'editorial-well rounded-none text-[#433A31]'
              : isSlate
              ? 'bg-[#0B1220] border border-slate-800 rounded-md text-slate-300'
              : isClay
              ? 'clay-well rounded-2xl text-[#4B5478]'
              : isSaas
              ? 'bg-slate-50 border border-slate-200 rounded-lg text-slate-700'
              : isNordic
              ? 'nordic-well rounded-xl text-[#4E5A53]'
              : isBrutal
              ? 'bg-[#FFE4E6] border-2 border-black text-black font-semibold'
              : isObsidian
              ? 'bg-[#0B0B0E] border border-[#2A241A] text-[#C7C1B5]'
              : isGlass
              ? 'bg-white/[0.04] border border-white/12 rounded-xl text-slate-200'
              : 'bg-zinc-900/70 border border-zinc-800 rounded text-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>Cards with review history</span>
            <span className="font-mono font-bold tabular-nums">{summary.reviewedCardsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Total logged reviews &amp; streak</span>
            <span className="font-mono font-bold tabular-nums">
              {summary.totalReviews} reviews · {summary.streakDays}d
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Custom reframes created</span>
            <span className="font-mono font-bold tabular-nums">{summary.customCardsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Active flashcard queue &amp; quiz state</span>
            <span className="font-mono font-bold">Cleared</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              soundEffects.playKeyClick();
              onClose();
            }}
            className={
              isSkeuomorphic
                ? 'px-4 py-2 rounded-md skeuo-leather-btn border border-[#5B3926] text-[#F5ECD8] text-xs font-semibold uppercase tracking-wider cursor-pointer'
                : isCyberpunk
                ? 'px-4 py-2 rounded-sm border border-cyan-400/35 bg-[#0B1024] text-cyan-200 hover:border-[#00F0FF] font-cyber text-xs uppercase tracking-wider cursor-pointer'
                : isMaterial
                ? 'px-4 py-2 rounded-lg bg-[#E4E9F2] hover:bg-[#D5DCE6] text-[#334155] text-xs font-semibold uppercase tracking-wider cursor-pointer'
                : isEditorial
                ? 'px-4 py-2 rounded-none border border-[#1D1814]/50 bg-[#FFFDF7] hover:bg-[#EAE1D0] text-[#1D1814] font-mono text-xs uppercase tracking-wider cursor-pointer'
                : isSlate
                ? 'px-4 py-2 rounded-md border border-slate-700 bg-[#0B1220] hover:bg-slate-800 text-slate-200 text-xs font-semibold uppercase tracking-wider cursor-pointer'
                : isClay
                ? 'px-4 py-2 rounded-2xl clay-card clay-btn-soft border border-white/80 text-[#4B5478] text-xs font-semibold uppercase tracking-wider cursor-pointer'
                : isSaas
                ? 'px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider cursor-pointer'
                : isNordic
                ? 'px-4 py-2 rounded-xl border border-[#DDD7C8] bg-[#F6F3EC] hover:bg-[#EAE5D9] text-[#4E5A53] text-xs font-semibold uppercase tracking-wider cursor-pointer'
                : isBrutal
                ? 'px-4 py-2 bg-white hover:bg-zinc-100 text-black border-2 border-black text-xs font-black uppercase cursor-pointer brutal-btn'
                : isObsidian
                ? 'px-4 py-2 border border-[#2A241A] bg-[#0B0B0E] hover:border-[#D4AF37]/40 text-[#A39E93] text-[11px] uppercase tracking-[0.14em] cursor-pointer'
                : isGlass
                ? 'px-4 py-2 rounded-xl border border-white/20 bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 text-xs font-semibold uppercase tracking-wider cursor-pointer'
                : 'px-4 py-2 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-mono uppercase cursor-pointer'
            }
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={() => {
              soundEffects.playAgainTone();
              onConfirmClear();
            }}
            className={
              isSkeuomorphic
                ? 'px-4 py-2 rounded-md bg-[#8C1D18] hover:bg-[#721612] text-[#FFF8EA] border border-[#5A110E] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.45)] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer'
                : isCyberpunk
                ? 'px-4 py-2 rounded-sm bg-[#FF2A85] hover:bg-[#E01E70] text-white border border-pink-300/60 font-cyber text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer'
                : isMaterial
                ? 'px-4 py-2 rounded-lg bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer material-btn'
                : isEditorial
                ? 'px-4 py-2 rounded-none bg-[#9B2226] hover:bg-[#7F1D1D] text-[#FAF5EA] border border-[#1D1814] shadow-[2px_2px_0_#1D1814] font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer'
                : isSlate
                ? 'px-4 py-2 rounded-md bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer'
                : isClay
                ? 'px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer clay-btn'
                : isSaas
                ? 'px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer'
                : isNordic
                ? 'px-4 py-2 rounded-xl bg-[#964B36] hover:bg-[#7D3B29] text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer'
                : isBrutal
                ? 'px-4 py-2 bg-[#FDA4AF] hover:bg-[#FB7185] text-black border-2 border-black text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer brutal-btn'
                : isObsidian
                ? 'px-4 py-2 bg-[#7F272B] hover:bg-[#993035] text-[#F5F0E6] border border-[#A84045] text-[11px] font-semibold uppercase tracking-[0.14em] flex items-center gap-1.5 cursor-pointer'
                : isGlass
                ? 'px-4 py-2 rounded-xl bg-rose-500/85 hover:bg-rose-500 text-white border border-rose-300/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer'
                : 'px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer'
            }
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR SAVED PROGRESS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
