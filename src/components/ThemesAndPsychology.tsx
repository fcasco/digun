import React from 'react';
import { 
  Brain, 
  HeartHandshake, 
  ShieldCheck, 
  Scale, 
  CheckCircle2
} from 'lucide-react';
import { DEFAULT_CARDS } from '../data/defaultCards';
import { ReframeCard } from '../types/reframe';
import { useTheme } from '../context/ThemeContext';
import { LeitnerDistributionChart } from './LeitnerDistributionChart';

interface ThemesAndPsychologyProps {
  cards?: ReframeCard[];
}

export const ThemesAndPsychology: React.FC<ThemesAndPsychologyProps> = ({ cards = DEFAULT_CARDS }) => {
  const { isSkeuomorphic, isCyberpunk, isMaterial, isEditorial, isSlate, isClay, isSaas, isNordic, isGlass, isBrutal, isObsidian } = useTheme();

  return (
    <div className={`max-w-5xl mx-auto px-4 py-6 ${isMaterial ? 'font-material' : isEditorial ? 'font-editorial-body' : isSkeuomorphic || isCyberpunk || isSlate || isBrutal || isObsidian || isGlass || isNordic || isSaas || isClay ? 'font-sans' : 'font-mono'}`}>
      <div className="space-y-6">
          <div
            className={
              isSkeuomorphic
                ? 'skeuo-paper-elevated rounded-lg p-6 sm:p-7 border-2 border-[#6B4A2B] text-[#1F140E]'
                : isCyberpunk
                ? 'cyber-card-elevated rounded-sm p-6 sm:p-7 border border-cyan-400/40 border-t-2 border-t-[#00F0FF]'
                : isMaterial
                ? 'material-card-elevated rounded-xl p-6 sm:p-7 border-t-4 border-[#1565C0]'
                : isEditorial
                ? 'border-2 border-[#1D1814] editorial-card-elevated rounded-none p-6 sm:p-7'
                : isSlate
                ? 'border border-teal-400/35 slate-card-elevated rounded-lg p-6 sm:p-7'
                : isClay
                ? 'border border-white/95 clay-card-elevated rounded-3xl p-6 sm:p-7'
                : isSaas
                ? 'border border-indigo-200 bg-indigo-50/45 rounded-xl p-6 sm:p-7'
                : isNordic
                ? 'border border-[#B8CBBF] bg-[#E7EFEA]/65 rounded-2xl p-6 sm:p-7'
                : isBrutal
                ? 'border-2 border-black bg-[#FFE500] p-5 sm:p-6 brutal-shadow'
                : isObsidian
                ? 'border border-[#D4AF37]/30 obsidian-surface p-6 sm:p-7'
                : isGlass
                ? 'border border-white/25 glass-panel-elevated rounded-2xl p-6 sm:p-7'
                : 'border border-zinc-800 bg-zinc-950 p-5 sm:p-6 rounded-lg'
            }
          >
            <div className="flex items-center gap-2.5 mb-2">
              <Brain className={isSkeuomorphic ? 'w-5 h-5 text-[#8C1D18]' : isCyberpunk ? 'w-5 h-5 text-[#FF2A85]' : isMaterial ? 'w-5 h-5 text-[#1565C0]' : isEditorial ? 'w-5 h-5 text-[#9B2226]' : isSlate ? 'w-5 h-5 text-teal-400' : isClay ? 'w-5 h-5 text-indigo-500' : isSaas ? 'w-5 h-5 text-indigo-600' : isNordic ? 'w-5 h-5 text-[#527360]' : isBrutal ? 'w-5 h-5 text-black' : isObsidian ? 'w-5 h-5 text-[#D4AF37]' : isGlass ? 'w-5 h-5 text-sky-300' : 'w-5 h-5 text-amber-400'} />
              <h2
                className={
                  isSkeuomorphic
                    ? 'font-editorial-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1F140E]'
                    : isCyberpunk
                    ? 'font-cyber text-xl sm:text-2xl font-bold tracking-[0.06em] uppercase text-[#F0F9FF]'
                    : isMaterial
                    ? 'text-xl sm:text-2xl font-bold tracking-tight text-[#111827]'
                    : isEditorial
                    ? 'font-editorial-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1814]'
                    : isSlate
                    ? 'text-xl sm:text-2xl font-bold tracking-tight text-slate-100'
                    : isClay
                    ? 'text-xl sm:text-2xl font-bold tracking-tight text-[#1E2547]'
                    : isSaas
                    ? 'text-xl sm:text-2xl font-bold tracking-tight text-slate-900'
                    : isNordic
                    ? 'text-xl sm:text-2xl font-bold tracking-tight text-[#242E28]'
                    : isBrutal
                    ? 'text-base sm:text-lg font-black tracking-tight text-black'
                    : isObsidian
                    ? 'font-luxury text-2xl sm:text-3xl font-semibold text-[#F5F0E6]'
                    : isGlass
                    ? 'text-xl sm:text-2xl font-bold tracking-tight text-white'
                    : 'text-base sm:text-lg font-bold tracking-wider text-zinc-100'
                }
              >
                The Psychology of Strategic Reframing
              </h2>
            </div>
            <p className={isSkeuomorphic ? 'text-sm text-[#4A3326] leading-relaxed' : isCyberpunk ? 'text-sm text-slate-300 leading-relaxed' : isMaterial ? 'text-sm text-[#475569] leading-relaxed' : isEditorial ? 'text-sm text-[#433A31] leading-relaxed' : isSlate ? 'text-sm text-slate-300 leading-relaxed' : isClay ? 'text-sm text-[#4B5478] leading-relaxed' : isSaas ? 'text-sm text-slate-600 leading-relaxed' : isNordic ? 'text-sm text-[#3B4B42] leading-relaxed' : isBrutal ? 'text-xs text-black font-medium leading-relaxed' : isObsidian ? 'text-sm text-[#A39E93] leading-relaxed' : isGlass ? 'text-sm text-slate-200 leading-relaxed' : 'text-xs text-zinc-400 leading-relaxed'}>
              The "don't say A, say B" communication style is rooted in behavioral science and cognitive linguistics. The words you choose don't merely convey raw data—they dynamically calibrate how listeners calculate your competence, warmth, and authority, while reinforcing your own internal self-concept.
            </p>
          </div>

          {/* D3 Leitner Box Distribution & Retention Progress Overview */}
          <LeitnerDistributionChart cards={cards} />

          {/* Pillar 1 */}
          <div
            className={
              isSkeuomorphic
                ? 'skeuo-paper border border-[#B8A482] rounded-lg p-6 space-y-3 text-[#1F140E]'
                : isCyberpunk
                ? 'cyber-card border border-cyan-400/25 rounded-sm p-6 space-y-3'
                : isMaterial
                ? 'material-card rounded-xl p-6 space-y-3'
                : isEditorial
                ? 'border border-[#1D1814]/35 editorial-card rounded-none p-6 space-y-3'
                : isSlate
                ? 'border border-slate-700/80 slate-card rounded-lg p-6 space-y-3'
                : isClay
                ? 'border border-white/90 clay-card rounded-3xl p-6 space-y-3'
                : isSaas
                ? 'border border-slate-200 saas-card rounded-xl p-6 space-y-3'
                : isNordic
                ? 'border border-[#E4DFD4] nordic-card rounded-2xl p-6 space-y-3'
                : isBrutal
                ? 'border-2 border-black bg-white p-5 brutal-shadow space-y-3'
                : isObsidian
                ? 'border border-[#2A241A] obsidian-surface p-6 space-y-3'
                : isGlass
                ? 'border border-white/18 glass-panel rounded-2xl p-6 space-y-3'
                : 'border border-zinc-800 bg-zinc-950 p-5 rounded-lg space-y-3'
            }
          >
            <div
              className={
                isSkeuomorphic
                  ? 'flex items-center gap-2 text-[#8C1D18] text-xs font-mono uppercase tracking-wider font-bold pb-2 border-b border-[#D2C1A1]'
                  : isCyberpunk
                  ? 'flex items-center gap-2 text-[#00F0FF] font-cyber text-xs uppercase tracking-[0.12em] font-bold'
                  : isMaterial
                  ? 'flex items-center gap-2 text-[#1565C0] text-xs uppercase tracking-wider font-bold'
                  : isEditorial
                  ? 'flex items-center gap-2 text-[#9B2226] text-xs font-mono uppercase tracking-wider font-semibold pb-2 border-b border-[#C9BFA9]'
                  : isSlate
                  ? 'flex items-center gap-2 text-teal-300 text-xs uppercase tracking-wider font-semibold'
                  : isClay
                  ? 'flex items-center gap-2 text-indigo-600 text-xs uppercase tracking-wider font-semibold'
                  : isSaas
                  ? 'flex items-center gap-2 text-indigo-700 text-xs uppercase tracking-wider font-semibold'
                  : isNordic
                  ? 'flex items-center gap-2 text-[#3B5948] text-xs uppercase tracking-wider font-semibold'
                  : isBrutal
                  ? 'flex items-center gap-2 text-black text-sm font-black'
                  : isObsidian
                  ? 'flex items-center gap-2 text-[#E5C77B] text-xs uppercase tracking-[0.16em] font-semibold'
                  : isGlass
                  ? 'flex items-center gap-2 text-sky-300 text-xs uppercase tracking-wider font-semibold'
                  : 'flex items-center gap-2 text-zinc-200 text-sm font-bold'
              }
            >
              <Scale className={isSkeuomorphic ? 'w-4 h-4 text-[#8C1D18]' : isCyberpunk ? 'w-4 h-4 text-[#00F0FF]' : isMaterial ? 'w-4 h-4 text-[#1565C0]' : isEditorial ? 'w-4 h-4 text-[#9B2226]' : isSlate ? 'w-4 h-4 text-teal-400' : isClay ? 'w-4 h-4 text-indigo-500' : isSaas ? 'w-4 h-4 text-indigo-600' : isNordic ? 'w-4 h-4 text-[#527360]' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : isGlass ? 'w-4 h-4 text-sky-300' : 'w-4 h-4 text-zinc-400'} />
              <span>THE COMPETENCE-WARMTH TRADE-OFF (RESPONSIBILITY EXCHANGE THEORY)</span>
            </div>
            <p className={isSkeuomorphic ? 'text-sm text-[#2C1B12] leading-relaxed' : isCyberpunk ? 'text-sm text-slate-200 leading-relaxed' : isMaterial ? 'text-sm text-[#334155] leading-relaxed' : isEditorial ? 'text-sm text-[#1D1814] leading-relaxed' : isSlate ? 'text-sm text-slate-300 leading-relaxed' : isClay ? 'text-sm text-[#4B5478] leading-relaxed' : isSaas ? 'text-sm text-slate-600 leading-relaxed' : isNordic ? 'text-sm text-[#4E5A53] leading-relaxed' : isBrutal ? 'text-xs text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-sm text-[#DDD6C8] leading-relaxed' : isGlass ? 'text-sm text-slate-200 leading-relaxed' : 'text-xs text-zinc-300 leading-relaxed'}>
              Social psychology research shows that interpersonal judgment rests on two primary axes: <strong>Competence</strong> (capability, intelligence, authority) and <strong>Warmth</strong> (friendliness, trustworthiness, empathy). 
            </p>
            <p className={isSkeuomorphic ? 'text-sm text-[#2C1B12] leading-relaxed' : isCyberpunk ? 'text-sm text-slate-200 leading-relaxed' : isMaterial ? 'text-sm text-[#334155] leading-relaxed' : isEditorial ? 'text-sm text-[#1D1814] leading-relaxed' : isSlate ? 'text-sm text-slate-300 leading-relaxed' : isClay ? 'text-sm text-[#4B5478] leading-relaxed' : isSaas ? 'text-sm text-slate-600 leading-relaxed' : isNordic ? 'text-sm text-[#4E5A53] leading-relaxed' : isBrutal ? 'text-xs text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-sm text-[#DDD6C8] leading-relaxed' : isGlass ? 'text-sm text-slate-200 leading-relaxed' : 'text-xs text-zinc-300 leading-relaxed'}>
              Over-apologizing (e.g. <em>"Sorry I'm late"</em>, <em>"Sorry for the typo"</em>) trades away competence in an attempt to show warmth. It inadvertently creates a <strong>"debt mindset"</strong>, framing your very presence as an inconvenience. Strategic reframes (e.g. <em>"Thank you for waiting"</em>) break this trade-off by projecting high warmth AND high competence simultaneously.
            </p>
          </div>

          {/* Pillar 2 */}
          <div
            className={
              isSkeuomorphic
                ? 'skeuo-paper border border-[#B8A482] rounded-lg p-6 space-y-3 text-[#1F140E]'
                : isCyberpunk
                ? 'cyber-card border border-cyan-400/25 rounded-sm p-6 space-y-3'
                : isMaterial
                ? 'material-card rounded-xl p-6 space-y-3'
                : isEditorial
                ? 'border border-[#1D1814]/35 editorial-card rounded-none p-6 space-y-3'
                : isSlate
                ? 'border border-slate-700/80 slate-card rounded-lg p-6 space-y-3'
                : isClay
                ? 'border border-white/90 clay-card rounded-3xl p-6 space-y-3'
                : isSaas
                ? 'border border-slate-200 saas-card rounded-xl p-6 space-y-3'
                : isNordic
                ? 'border border-[#E4DFD4] nordic-card rounded-2xl p-6 space-y-3'
                : isBrutal
                ? 'border-2 border-black bg-white p-5 brutal-shadow space-y-3'
                : isObsidian
                ? 'border border-[#2A241A] obsidian-surface p-6 space-y-3'
                : isGlass
                ? 'border border-white/18 glass-panel rounded-2xl p-6 space-y-3'
                : 'border border-zinc-800 bg-zinc-950 p-5 rounded-lg space-y-3'
            }
          >
            <div
              className={
                isSkeuomorphic
                  ? 'flex items-center gap-2 text-[#8C1D18] text-xs font-mono uppercase tracking-wider font-bold pb-2 border-b border-[#D2C1A1]'
                  : isCyberpunk
                  ? 'flex items-center gap-2 text-[#00F0FF] font-cyber text-xs uppercase tracking-[0.12em] font-bold'
                  : isMaterial
                  ? 'flex items-center gap-2 text-[#1565C0] text-xs uppercase tracking-wider font-bold'
                  : isEditorial
                  ? 'flex items-center gap-2 text-[#9B2226] text-xs font-mono uppercase tracking-wider font-semibold pb-2 border-b border-[#C9BFA9]'
                  : isSlate
                  ? 'flex items-center gap-2 text-teal-300 text-xs uppercase tracking-wider font-semibold'
                  : isClay
                  ? 'flex items-center gap-2 text-indigo-600 text-xs uppercase tracking-wider font-semibold'
                  : isSaas
                  ? 'flex items-center gap-2 text-indigo-700 text-xs uppercase tracking-wider font-semibold'
                  : isNordic
                  ? 'flex items-center gap-2 text-[#3B5948] text-xs uppercase tracking-wider font-semibold'
                  : isBrutal
                  ? 'flex items-center gap-2 text-black text-sm font-black'
                  : isObsidian
                  ? 'flex items-center gap-2 text-[#E5C77B] text-xs uppercase tracking-[0.16em] font-semibold'
                  : isGlass
                  ? 'flex items-center gap-2 text-sky-300 text-xs uppercase tracking-wider font-semibold'
                  : 'flex items-center gap-2 text-zinc-200 text-sm font-bold'
              }
            >
              <HeartHandshake className={isSkeuomorphic ? 'w-4 h-4 text-[#8C1D18]' : isCyberpunk ? 'w-4 h-4 text-[#00F0FF]' : isMaterial ? 'w-4 h-4 text-[#1565C0]' : isEditorial ? 'w-4 h-4 text-[#9B2226]' : isSlate ? 'w-4 h-4 text-teal-400' : isClay ? 'w-4 h-4 text-indigo-500' : isSaas ? 'w-4 h-4 text-indigo-600' : isNordic ? 'w-4 h-4 text-[#527360]' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : isGlass ? 'w-4 h-4 text-sky-300' : 'w-4 h-4 text-zinc-400'} />
              <span>FROM APOLOGY TO GRATITUDE (VALIDATING THE LISTENER)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className={isSkeuomorphic ? 'skeuo-stamp bg-[#F9EAE7] rounded-md p-4' : isCyberpunk ? 'border border-[#FF2A85]/45 bg-[#19091E] rounded-sm p-4' : isMaterial ? 'bg-[#FFEBEE] border border-[#FFCDD2] rounded-lg p-4' : isEditorial ? 'border border-[#9B2226]/35 bg-[#F6E5E2] rounded-none p-4' : isSlate ? 'border border-rose-500/35 bg-rose-950/35 rounded-md p-4' : isClay ? 'border border-white/80 bg-[#FFE8EC] rounded-2xl p-4 shadow-sm' : isSaas ? 'border border-rose-200 bg-rose-50/70 rounded-lg p-4' : isNordic ? 'border border-[#E4C5B9] bg-[#FAF0EC] rounded-xl p-4' : isBrutal ? 'border-2 border-black bg-[#FFE4E6] p-3' : isObsidian ? 'border border-[#3D2225] bg-[#140D0E] p-4' : isGlass ? 'border border-rose-300/25 bg-rose-950/30 rounded-xl p-4' : 'border border-zinc-800 bg-zinc-900/50 p-3 rounded'}>
                <div className={isSkeuomorphic ? 'text-[#8C1D18] font-mono uppercase tracking-wider font-bold mb-1.5' : isCyberpunk ? 'text-[#FF66B3] font-cyber uppercase tracking-wider font-bold mb-1.5' : isMaterial ? 'text-[#C62828] uppercase tracking-wider font-bold mb-1.5' : isEditorial ? 'text-[#7F1D1D] font-mono uppercase tracking-wider font-semibold mb-1.5' : isSlate ? 'text-rose-300 uppercase tracking-wider font-semibold mb-1.5' : isClay ? 'text-[#9F1239] uppercase tracking-wider font-semibold mb-1.5' : isSaas ? 'text-rose-700 uppercase tracking-wider font-semibold mb-1.5' : isNordic ? 'text-[#964B36] uppercase tracking-wider font-semibold mb-1.5' : isBrutal ? 'text-black font-black mb-1' : isObsidian ? 'text-[#E8A5A5] uppercase tracking-[0.14em] font-semibold mb-1.5' : isGlass ? 'text-rose-200 uppercase tracking-wider font-semibold mb-1.5' : 'text-zinc-400 font-bold mb-1'}>THE "DANGER" APOLOGY PATTERN</div>
                <div className={isSkeuomorphic ? 'text-[#3F1412] leading-relaxed' : isCyberpunk ? 'text-rose-100 leading-relaxed' : isMaterial ? 'text-[#7F1D1D] leading-relaxed' : isEditorial ? 'text-[#431818] leading-relaxed' : isSlate ? 'text-rose-100/90 leading-relaxed' : isClay ? 'text-[#4B2D38] leading-relaxed' : isSaas ? 'text-slate-700 leading-relaxed' : isNordic ? 'text-[#4E3832] leading-relaxed' : isBrutal ? 'text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-[#C7C1B5] leading-relaxed' : isGlass ? 'text-slate-200 leading-relaxed' : 'text-zinc-400 leading-relaxed'}>
                  Focuses inward on self-guilt, weakness, and embarrassment. Forces the listener into the awkward emotional labor of having to soothe you: <em>"Oh no, it's fine, don't worry about it."</em>
                </div>
              </div>
              <div className={isSkeuomorphic ? 'border-2 border-[#164A37]/70 bg-[#E5EFE9] rounded-md p-4 shadow-2xs' : isCyberpunk ? 'border border-[#00F0FF]/45 bg-[#061926] rounded-sm p-4' : isMaterial ? 'bg-[#E0F2F1] border border-[#B2DFDB] rounded-lg p-4' : isEditorial ? 'border border-[#1E4D40]/40 bg-[#E6EDE9] rounded-none p-4' : isSlate ? 'border border-teal-400/35 bg-teal-950/35 rounded-md p-4' : isClay ? 'border border-white/80 bg-[#E3FCEC] rounded-2xl p-4 shadow-sm' : isSaas ? 'border border-emerald-200 bg-emerald-50/70 rounded-lg p-4' : isNordic ? 'border border-[#B8CBBF] bg-[#E7EFEA] rounded-xl p-4' : isBrutal ? 'border-2 border-black bg-[#DCFCE7] p-3' : isObsidian ? 'border border-[#D4AF37]/35 bg-[#14110C] p-4' : isGlass ? 'border border-sky-300/35 bg-sky-950/30 rounded-xl p-4' : 'border border-zinc-700 bg-zinc-900 p-3 rounded'}>
                <div className={isSkeuomorphic ? 'text-[#164A37] font-mono uppercase tracking-wider font-bold mb-1.5' : isCyberpunk ? 'text-[#00F0FF] font-cyber uppercase tracking-wider font-bold mb-1.5' : isMaterial ? 'text-[#00695C] uppercase tracking-wider font-bold mb-1.5' : isEditorial ? 'text-[#1E4D40] font-mono uppercase tracking-wider font-semibold mb-1.5' : isSlate ? 'text-teal-300 uppercase tracking-wider font-semibold mb-1.5' : isClay ? 'text-[#065F46] uppercase tracking-wider font-semibold mb-1.5' : isSaas ? 'text-emerald-700 uppercase tracking-wider font-semibold mb-1.5' : isNordic ? 'text-[#2D4739] uppercase tracking-wider font-semibold mb-1.5' : isBrutal ? 'text-black font-black mb-1' : isObsidian ? 'text-[#E5C77B] uppercase tracking-[0.14em] font-semibold mb-1.5' : isGlass ? 'text-sky-200 uppercase tracking-wider font-semibold mb-1.5' : 'text-zinc-100 font-bold mb-1'}>THE "POWER" GRATITUDE REFRAME</div>
                <div className={isSkeuomorphic ? 'text-[#133829] leading-relaxed' : isCyberpunk ? 'text-cyan-50 leading-relaxed' : isMaterial ? 'text-[#004D40] leading-relaxed' : isEditorial ? 'text-[#18382F] leading-relaxed' : isSlate ? 'text-teal-50 leading-relaxed' : isClay ? 'text-[#1E3B2F] leading-relaxed' : isSaas ? 'text-slate-800 leading-relaxed' : isNordic ? 'text-[#242E28] leading-relaxed' : isBrutal ? 'text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-[#F5F0E6] leading-relaxed' : isGlass ? 'text-white leading-relaxed' : 'text-zinc-300 leading-relaxed'}>
                  Focuses outward on honoring the listener's patience, generosity, or diligence. Gives them credit and positive reinforcement while preserving your own professional dignity.
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div
            className={
              isSkeuomorphic
                ? 'skeuo-paper border border-[#B8A482] rounded-lg p-6 space-y-3 text-[#1F140E]'
                : isCyberpunk
                ? 'cyber-card border border-cyan-400/25 rounded-sm p-6 space-y-3'
                : isMaterial
                ? 'material-card rounded-xl p-6 space-y-3'
                : isEditorial
                ? 'border border-[#1D1814]/35 editorial-card rounded-none p-6 space-y-3'
                : isSlate
                ? 'border border-slate-700/80 slate-card rounded-lg p-6 space-y-3'
                : isClay
                ? 'border border-white/90 clay-card rounded-3xl p-6 space-y-3'
                : isSaas
                ? 'border border-slate-200 saas-card rounded-xl p-6 space-y-3'
                : isNordic
                ? 'border border-[#E4DFD4] nordic-card rounded-2xl p-6 space-y-3'
                : isBrutal
                ? 'border-2 border-black bg-white p-5 brutal-shadow space-y-3'
                : isObsidian
                ? 'border border-[#2A241A] obsidian-surface p-6 space-y-3'
                : isGlass
                ? 'border border-white/18 glass-panel rounded-2xl p-6 space-y-3'
                : 'border border-zinc-800 bg-zinc-950 p-5 rounded-lg space-y-3'
            }
          >
            <div
              className={
                isSkeuomorphic
                  ? 'flex items-center gap-2 text-[#8C1D18] text-xs font-mono uppercase tracking-wider font-bold pb-2 border-b border-[#D2C1A1]'
                  : isCyberpunk
                  ? 'flex items-center gap-2 text-[#00F0FF] font-cyber text-xs uppercase tracking-[0.12em] font-bold'
                  : isMaterial
                  ? 'flex items-center gap-2 text-[#1565C0] text-xs uppercase tracking-wider font-bold'
                  : isEditorial
                  ? 'flex items-center gap-2 text-[#9B2226] text-xs font-mono uppercase tracking-wider font-semibold pb-2 border-b border-[#C9BFA9]'
                  : isSlate
                  ? 'flex items-center gap-2 text-teal-300 text-xs uppercase tracking-wider font-semibold'
                  : isClay
                  ? 'flex items-center gap-2 text-indigo-600 text-xs uppercase tracking-wider font-semibold'
                  : isSaas
                  ? 'flex items-center gap-2 text-indigo-700 text-xs uppercase tracking-wider font-semibold'
                  : isNordic
                  ? 'flex items-center gap-2 text-[#3B5948] text-xs uppercase tracking-wider font-semibold'
                  : isBrutal
                  ? 'flex items-center gap-2 text-black text-sm font-black'
                  : isObsidian
                  ? 'flex items-center gap-2 text-[#E5C77B] text-xs uppercase tracking-[0.16em] font-semibold'
                  : isGlass
                  ? 'flex items-center gap-2 text-sky-300 text-xs uppercase tracking-wider font-semibold'
                  : 'flex items-center gap-2 text-zinc-200 text-sm font-bold'
              }
            >
              <ShieldCheck className={isSkeuomorphic ? 'w-4 h-4 text-[#8C1D18]' : isCyberpunk ? 'w-4 h-4 text-[#00F0FF]' : isMaterial ? 'w-4 h-4 text-[#1565C0]' : isEditorial ? 'w-4 h-4 text-[#9B2226]' : isSlate ? 'w-4 h-4 text-teal-400' : isClay ? 'w-4 h-4 text-indigo-500' : isSaas ? 'w-4 h-4 text-indigo-600' : isNordic ? 'w-4 h-4 text-[#527360]' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : isGlass ? 'w-4 h-4 text-sky-300' : 'w-4 h-4 text-zinc-400'} />
              <span>FROM PASSIVE PERMISSION-SEEKING TO DECLARATIVE OWNERSHIP</span>
            </div>
            <p className={isSkeuomorphic ? 'text-sm text-[#2C1B12] leading-relaxed' : isCyberpunk ? 'text-sm text-slate-200 leading-relaxed' : isMaterial ? 'text-sm text-[#334155] leading-relaxed' : isEditorial ? 'text-sm text-[#1D1814] leading-relaxed' : isSlate ? 'text-sm text-slate-300 leading-relaxed' : isClay ? 'text-sm text-[#4B5478] leading-relaxed' : isSaas ? 'text-sm text-slate-600 leading-relaxed' : isNordic ? 'text-sm text-[#4E5A53] leading-relaxed' : isBrutal ? 'text-xs text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-sm text-[#DDD6C8] leading-relaxed' : isGlass ? 'text-sm text-slate-200 leading-relaxed' : 'text-xs text-zinc-300 leading-relaxed'}>
              Hedging phrases like <em>"Can I ask a question?"</em> or <em>"I might be totally wrong, but..."</em> serve as psychological defense mechanisms against critique. However, preemptive self-undermining diminishes audience confidence before you even deliver your point. Replacing them with <em>"I have a question"</em> or <em>"Here is what the data indicates"</em> assumes your legitimate place at the decision table.
            </p>
          </div>

          {/* Pillar 4 */}
          <div
            className={
              isSkeuomorphic
                ? 'skeuo-paper border border-[#B8A482] rounded-lg p-6 space-y-3 text-[#1F140E]'
                : isCyberpunk
                ? 'cyber-card border border-cyan-400/25 rounded-sm p-6 space-y-3'
                : isMaterial
                ? 'material-card rounded-xl p-6 space-y-3'
                : isEditorial
                ? 'border border-[#1D1814]/35 editorial-card rounded-none p-6 space-y-3'
                : isSlate
                ? 'border border-slate-700/80 slate-card rounded-lg p-6 space-y-3'
                : isClay
                ? 'border border-white/90 clay-card rounded-3xl p-6 space-y-3'
                : isSaas
                ? 'border border-slate-200 saas-card rounded-xl p-6 space-y-3'
                : isNordic
                ? 'border border-[#E4DFD4] nordic-card rounded-2xl p-6 space-y-3'
                : isBrutal
                ? 'border-2 border-black bg-white p-5 brutal-shadow space-y-3'
                : isObsidian
                ? 'border border-[#2A241A] obsidian-surface p-6 space-y-3'
                : isGlass
                ? 'border border-white/18 glass-panel rounded-2xl p-6 space-y-3'
                : 'border border-zinc-800 bg-zinc-950 p-5 rounded-lg space-y-3'
            }
          >
            <div
              className={
                isSkeuomorphic
                  ? 'flex items-center gap-2 text-[#8C1D18] text-xs font-mono uppercase tracking-wider font-bold pb-2 border-b border-[#D2C1A1]'
                  : isCyberpunk
                  ? 'flex items-center gap-2 text-[#00F0FF] font-cyber text-xs uppercase tracking-[0.12em] font-bold'
                  : isMaterial
                  ? 'flex items-center gap-2 text-[#1565C0] text-xs uppercase tracking-wider font-bold'
                  : isEditorial
                  ? 'flex items-center gap-2 text-[#9B2226] text-xs font-mono uppercase tracking-wider font-semibold pb-2 border-b border-[#C9BFA9]'
                  : isSlate
                  ? 'flex items-center gap-2 text-teal-300 text-xs uppercase tracking-wider font-semibold'
                  : isClay
                  ? 'flex items-center gap-2 text-indigo-600 text-xs uppercase tracking-wider font-semibold'
                  : isSaas
                  ? 'flex items-center gap-2 text-indigo-700 text-xs uppercase tracking-wider font-semibold'
                  : isNordic
                  ? 'flex items-center gap-2 text-[#3B5948] text-xs uppercase tracking-wider font-semibold'
                  : isBrutal
                  ? 'flex items-center gap-2 text-black text-sm font-black'
                  : isObsidian
                  ? 'flex items-center gap-2 text-[#E5C77B] text-xs uppercase tracking-[0.16em] font-semibold'
                  : isGlass
                  ? 'flex items-center gap-2 text-sky-300 text-xs uppercase tracking-wider font-semibold'
                  : 'flex items-center gap-2 text-zinc-200 text-sm font-bold'
              }
            >
              <CheckCircle2 className={isSkeuomorphic ? 'w-4 h-4 text-[#8C1D18]' : isCyberpunk ? 'w-4 h-4 text-[#00F0FF]' : isMaterial ? 'w-4 h-4 text-[#1565C0]' : isEditorial ? 'w-4 h-4 text-[#9B2226]' : isSlate ? 'w-4 h-4 text-teal-400' : isClay ? 'w-4 h-4 text-indigo-500' : isSaas ? 'w-4 h-4 text-indigo-600' : isNordic ? 'w-4 h-4 text-[#527360]' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : isGlass ? 'w-4 h-4 text-sky-300' : 'w-4 h-4 text-zinc-400'} />
              <span>FROM VAGUE COMMITMENT TO DEFINITIVE RELIABILITY</span>
            </div>
            <p className={isSkeuomorphic ? 'text-sm text-[#2C1B12] leading-relaxed' : isCyberpunk ? 'text-sm text-slate-200 leading-relaxed' : isMaterial ? 'text-sm text-[#334155] leading-relaxed' : isEditorial ? 'text-sm text-[#1D1814] leading-relaxed' : isSlate ? 'text-sm text-slate-300 leading-relaxed' : isClay ? 'text-sm text-[#4B5478] leading-relaxed' : isSaas ? 'text-sm text-slate-600 leading-relaxed' : isNordic ? 'text-sm text-[#4E5A53] leading-relaxed' : isBrutal ? 'text-xs text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-sm text-[#DDD6C8] leading-relaxed' : isGlass ? 'text-sm text-slate-200 leading-relaxed' : 'text-xs text-zinc-300 leading-relaxed'}>
              Replacing <em>"I'll try"</em> with <em>"I will"</em>, or <em>"I don't know"</em> with <em>"I'll find out for you by 3 PM"</em> converts passive uncertainty into proactive stewardship. In organizational psychology, proactive communication is the single highest predictor of perceived executive presence and leadership readiness.
            </p>
          </div>

      </div>
    </div>
  );
};
