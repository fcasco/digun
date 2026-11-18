import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { useTheme } from '../context/ThemeContext';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const { isSkeuomorphic, isCyberpunk, isMaterial, isEditorial, isSlate, isClay, isSaas, isNordic, isGlass, isBrutal, isObsidian } = useTheme();
  if (!isOpen) return null;

  const shortcuts = [
    { label: 'Flip Flashcard (Front / Back)', key: 'SPACE' },
    { label: 'Rate: AGAIN (Reset to Box 1)', key: '1' },
    { label: 'Rate: HARD (Maintain Box)', key: '2' },
    { label: 'Rate: GOOD (Advance Box +1)', key: '3' },
    { label: 'Rate: EASY (Advance Box +2)', key: '4' },
    { label: 'Speak Active Phrase (Audio TTS)', key: 'A' },
  ];

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
        className={
          isSkeuomorphic
            ? 'skeuo-paper-elevated border-2 border-[#6B4A2B] rounded-lg max-w-md w-full p-6 text-[#1F140E]'
            : isCyberpunk
            ? 'cyber-card-elevated border border-cyan-400/45 border-t-2 border-t-[#00F0FF] rounded-sm max-w-md w-full p-6'
            : isMaterial
            ? 'material-card-elevated rounded-xl max-w-md w-full p-6'
            : isEditorial
            ? 'editorial-card-elevated border-2 border-[#1D1814] rounded-none max-w-md w-full p-6'
            : isSlate
            ? 'slate-card-elevated border border-slate-700/90 rounded-lg max-w-md w-full p-6'
            : isClay
            ? 'clay-card-elevated border border-white/90 rounded-3xl max-w-md w-full p-6'
            : isSaas
            ? 'saas-card-elevated border border-slate-200 rounded-xl max-w-md w-full p-6'
            : isNordic
            ? 'nordic-card-elevated border border-[#DDD7C8] rounded-2xl max-w-md w-full p-6'
            : isBrutal
            ? 'bg-[#FFFDF5] border-2 border-black max-w-md w-full p-6 brutal-shadow-lg'
            : isObsidian
            ? 'obsidian-surface border border-[#D4AF37]/30 max-w-md w-full p-6'
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
            className={
              isSkeuomorphic
                ? 'flex items-center gap-2 font-editorial-display text-lg font-bold tracking-tight text-[#1F140E]'
                : isCyberpunk
                ? 'flex items-center gap-2 font-cyber text-base font-bold tracking-[0.12em] uppercase text-[#00F0FF]'
                : isMaterial
                ? 'flex items-center gap-2 text-base font-bold tracking-tight text-[#111827]'
                : isEditorial
                ? 'flex items-center gap-2 font-editorial-display text-lg font-bold tracking-tight text-[#1D1814]'
                : isSlate
                ? 'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-slate-50'
                : isClay
                ? 'flex items-center gap-2 text-sm font-bold tracking-wide uppercase text-[#1E2547]'
                : isSaas
                ? 'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-slate-900'
                : isNordic
                ? 'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-[#242E28]'
                : isBrutal
                ? 'flex items-center gap-2 text-sm font-black text-black tracking-tight'
                : isObsidian
                ? 'flex items-center gap-2 font-luxury text-lg font-semibold tracking-[0.14em] uppercase text-[#F5F0E6]'
                : isGlass
                ? 'flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-white'
                : 'flex items-center gap-2 text-sm font-bold text-zinc-100 tracking-wider'
            }
          >
            <Keyboard className={isSkeuomorphic ? 'w-4 h-4 text-[#8C1D18]' : isCyberpunk ? 'w-4 h-4 text-[#FF2A85]' : isMaterial ? 'w-4 h-4 text-[#1565C0]' : isEditorial ? 'w-4 h-4 text-[#9B2226]' : isSlate ? 'w-4 h-4 text-teal-400' : isClay || isSaas ? 'w-4 h-4 text-indigo-600' : isNordic ? 'w-4 h-4 text-[#527360]' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : isGlass ? 'w-4 h-4 text-sky-300' : 'w-4 h-4 text-amber-400'} />
            <span>COMMAND SHORTCUTS</span>
          </div>
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              onClose();
            }}
            className={
              isSkeuomorphic
                ? 'text-[#5A3D28] hover:text-[#8C1D18] p-1 rounded-md hover:bg-[#E6D9C0] cursor-pointer transition-colors'
                : isCyberpunk
                ? 'text-cyan-300 hover:text-[#FF4DA6] p-1 rounded-sm hover:bg-cyan-400/10 cursor-pointer transition-colors'
                : isMaterial
                ? 'text-[#64748B] hover:text-[#1565C0] p-1.5 rounded-lg hover:bg-[#ECEFF4] cursor-pointer transition-colors'
                : isEditorial
                ? 'text-[#574D42] hover:text-[#9B2226] p-1 rounded-none hover:bg-[#EAE1D0] cursor-pointer transition-colors'
                : isSlate
                ? 'text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 cursor-pointer transition-colors'
                : isClay
                ? 'text-[#647094] hover:text-[#1E2547] p-1.5 rounded-xl clay-well cursor-pointer transition-colors'
                : isSaas
                ? 'text-slate-400 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors'
                : isNordic
                ? 'text-[#5C6962] hover:text-[#242E28] p-1 rounded-lg hover:bg-[#EFECE3] cursor-pointer transition-colors'
                : isBrutal
                ? 'text-black bg-[#FFE500] border-2 border-black p-1 cursor-pointer'
                : isObsidian
                ? 'text-[#A39E93] hover:text-[#E5C77B] cursor-pointer transition-colors'
                : isGlass
                ? 'text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors'
                : 'text-zinc-500 hover:text-zinc-200 cursor-pointer'
            }
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 text-xs mb-6">
          {shortcuts.map((item) => (
            <div
              key={item.key}
              className={
                isSkeuomorphic
                  ? 'flex items-center justify-between p-2.5 rounded-md skeuo-well'
                  : isCyberpunk
                  ? 'flex items-center justify-between p-2.5 rounded-sm cyber-well border border-cyan-400/20'
                  : isMaterial
                  ? 'flex items-center justify-between p-3 rounded-lg material-well'
                  : isEditorial
                  ? 'flex items-center justify-between p-2.5 rounded-none editorial-well border border-[#C9BFA9]'
                  : isSlate
                  ? 'flex items-center justify-between p-2.5 rounded-md slate-well border border-slate-800'
                  : isClay
                  ? 'flex items-center justify-between p-2.5 rounded-2xl clay-well border border-white/60'
                  : isSaas
                  ? 'flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200'
                  : isNordic
                  ? 'flex items-center justify-between p-2.5 rounded-xl nordic-well border border-[#E2DDD0]'
                  : isBrutal
                  ? 'flex items-center justify-between p-2.5 bg-white border-2 border-black'
                  : isObsidian
                  ? 'flex items-center justify-between p-2.5 bg-[#070709] border border-[#2A241A]'
                  : isGlass
                  ? 'flex items-center justify-between p-2.5 rounded-xl glass-well border border-white/12'
                  : 'flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800'
              }
            >
              <span className={isSkeuomorphic ? 'text-[#2C1B12] font-semibold' : isCyberpunk ? 'text-[#E6F4FF] font-medium' : isMaterial ? 'text-[#1E293B] font-medium' : isEditorial ? 'text-[#1D1814] font-medium' : isSlate ? 'text-slate-200 font-medium' : isClay ? 'text-[#1E2547] font-semibold' : isSaas ? 'text-slate-700 font-medium' : isNordic ? 'text-[#242E28] font-medium' : isBrutal ? 'text-black font-bold' : isObsidian ? 'text-[#F5F0E6]' : isGlass ? 'text-slate-100 font-medium' : 'text-zinc-300'}>
                {item.label}
              </span>
              <kbd
                className={
                  isSkeuomorphic
                    ? 'px-2.5 py-0.5 rounded skeuo-brass-btn border border-[#7A5915] font-mono font-bold'
                    : isCyberpunk
                    ? 'px-2.5 py-0.5 rounded-sm bg-[#0D1635] text-[#00F0FF] border border-cyan-400/45 font-mono font-bold'
                    : isMaterial
                    ? 'px-2.5 py-0.5 rounded-md bg-white text-[#1565C0] border border-[#CBD5E1] shadow-2xs font-mono font-bold'
                    : isEditorial
                    ? 'px-2 py-0.5 rounded-none bg-[#FFFDF7] text-[#9B2226] border border-[#1D1814]/55 font-mono font-semibold'
                    : isSlate
                    ? 'px-2 py-0.5 rounded bg-[#1E293B] text-teal-300 border border-slate-700 font-mono font-semibold'
                    : isClay
                    ? 'px-2.5 py-0.5 rounded-xl clay-card text-indigo-600 border border-white font-mono font-bold'
                    : isSaas
                    ? 'px-2 py-0.5 rounded-md bg-white text-indigo-700 border border-slate-200 font-mono font-semibold shadow-2xs'
                    : isNordic
                    ? 'px-2 py-0.5 rounded-md bg-[#E7EFEA] text-[#2D4739] border border-[#B8CBBF] font-mono font-semibold'
                    : isBrutal
                    ? 'px-2 py-0.5 bg-[#FFE500] text-black border-2 border-black font-black font-mono'
                    : isObsidian
                    ? 'px-2 py-0.5 bg-[#1A1610] text-[#E5C77B] border border-[#D4AF37]/40 font-mono font-semibold'
                    : isGlass
                    ? 'px-2 py-0.5 rounded-md bg-white/10 text-sky-200 border border-white/25 font-mono font-semibold'
                    : 'px-2 py-0.5 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 font-bold'
                }
              >
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            soundEffects.playKeyClick();
            onClose();
          }}
          className={
            isSkeuomorphic
              ? 'w-full py-2.5 rounded-md skeuo-brass-btn border border-[#7A5915] font-bold uppercase tracking-wider text-xs cursor-pointer'
              : isCyberpunk
              ? 'w-full py-2.5 rounded-sm bg-gradient-to-r from-[#00F0FF] to-[#FF2A85] text-[#060714] border border-cyan-200/80 font-cyber font-bold uppercase tracking-[0.14em] text-xs cursor-pointer cyber-btn'
              : isMaterial
              ? 'w-full py-2.5 rounded-lg bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold uppercase tracking-wider text-xs cursor-pointer material-btn'
              : isEditorial
              ? 'w-full py-2.5 rounded-none bg-[#9B2226] hover:bg-[#7F1D1D] text-[#FAF5EA] border border-[#1D1814] font-semibold uppercase tracking-[0.14em] text-xs cursor-pointer shadow-[2px_2px_0_#1D1814] transition-colors'
              : isSlate
              ? 'w-full py-2.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold uppercase tracking-wider text-xs cursor-pointer shadow-xs transition-colors'
              : isClay
              ? 'w-full py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold uppercase tracking-wider text-xs cursor-pointer clay-btn'
              : isSaas
              ? 'w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold uppercase tracking-wider text-xs cursor-pointer shadow-xs transition-colors'
              : isNordic
              ? 'w-full py-2.5 rounded-xl bg-[#527360] hover:bg-[#425F4E] text-[#FDFBF7] font-semibold uppercase tracking-wider text-xs cursor-pointer shadow-sm transition-colors'
              : isBrutal
              ? 'w-full py-2.5 bg-[#86EFAC] hover:bg-[#4ADE80] text-black border-2 border-black font-black text-xs cursor-pointer brutal-btn'
              : isObsidian
              ? 'w-full py-2.5 bg-[#D4AF37] hover:bg-[#E5C77B] text-[#070709] font-semibold uppercase tracking-[0.18em] text-xs cursor-pointer transition-colors'
              : isGlass
              ? 'w-full py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold uppercase tracking-wider text-xs cursor-pointer shadow-lg shadow-sky-500/20 transition-colors'
              : 'w-full py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs cursor-pointer shadow-sm'
          }
        >
          CLOSE [ESC]
        </button>
      </div>
    </div>
  );
};
