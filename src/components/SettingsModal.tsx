import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Palette,
  SlidersHorizontal,
  Check,
  Play,
  Square,
  Keyboard,
  RotateCcw,
  Monitor,
} from 'lucide-react';
import { useTheme, AppTheme } from '../context/ThemeContext';
import { useAudio } from '../context/AudioContext';
import { soundEffects } from '../utils/soundEffects';
import { speechEngine } from '../utils/speechSynthesis';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCrtScanlinesEnabled: boolean;
  onToggleCrtScanlines: () => void;
  onOpenShortcuts: () => void;
  onOpenClearProgress: () => void;
}

interface ThemeOption {
  id: AppTheme;
  number: string;
  name: string;
  vibe: string;
  swatches: [string, string, string];
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'saas',
    number: '01',
    name: 'Clean SaaS Minimalist',
    vibe: 'Crisp white & slate clarity',
    swatches: ['#F8FAFC', '#FFFFFF', '#4F46E5'],
  },
  {
    id: 'slate',
    number: '02',
    name: 'Modern Slate Dark',
    vibe: 'Deep slate & teal focus',
    swatches: ['#0F172A', '#1E293B', '#2DD4BF'],
  },
  {
    id: 'glassmorphism',
    number: '03',
    name: 'Frosted Glassmorphism',
    vibe: 'Translucent blur & sky glow',
    swatches: ['#07111F', '#162944', '#38BDF8'],
  },
  {
    id: 'neobrutalism',
    number: '04',
    name: 'Neo-Brutalism',
    vibe: 'Hard black ink & volt yellow',
    swatches: ['#FFFDF5', '#FFE500', '#000000'],
  },
  {
    id: 'editorial',
    number: '05',
    name: "Editorial '50s Broadsheet",
    vibe: 'Newsprint serif & crimson',
    swatches: ['#F3ECE0', '#FAF5EA', '#9B2226'],
  },
  {
    id: 'clay',
    number: '06',
    name: 'Claymorphism Soft 3D',
    vibe: 'Sculpted pillowy pastels',
    swatches: ['#EEF2FA', '#FFFFFF', '#6366F1'],
  },
  {
    id: 'material',
    number: '07',
    name: 'Flat Design 2.0 / Material',
    vibe: 'Cobalt tiers & crisp paper',
    swatches: ['#ECEFF4', '#FFFFFF', '#1565C0'],
  },
  {
    id: 'cyberpunk',
    number: '08',
    name: 'Cyberpunk Neon Grid',
    vibe: 'Isometric cyan & magenta',
    swatches: ['#060714', '#0C1532', '#00F0FF'],
  },
  {
    id: 'skeuomorphic',
    number: '09',
    name: 'Skeuomorphic Physical Desk',
    vibe: 'Mahogany, leather & brass',
    swatches: ['#23130B', '#FBF6EA', '#CFA646'],
  },
  {
    id: 'obsidian',
    number: '10',
    name: 'Luxury Obsidian & Brass',
    vibe: 'Velvet black & gold serif',
    swatches: ['#070709', '#14110C', '#D4AF37'],
  },
  {
    id: 'nordic',
    number: '11',
    name: 'Nordic Organic Pastel',
    vibe: 'Warm linen & eucalyptus sage',
    swatches: ['#F6F3EC', '#FDFBF7', '#527360'],
  },
  {
    id: 'terminal',
    number: '12',
    name: 'Retro Terminal Console',
    vibe: 'Obsidian mono & amber cues',
    swatches: ['#09090B', '#18181B', '#F59E0B'],
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isCrtScanlinesEnabled,
  onToggleCrtScanlines,
  onOpenShortcuts,
  onOpenClearProgress,
}) => {
  const {
    theme,
    setTheme,
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

  const {
    soundEffectsEnabled,
    setSoundEffectsEnabled,
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    voiceURI,
    setVoiceURI,
    autoSpeakOnFlip,
    setAutoSpeakOnFlip,
    resetAudioSettings,
  } = useAudio();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [testNotice, setTestNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      speechEngine.stop();
      setIsTestingVoice(false);
      setTestNotice(null);
      return;
    }

    const loadVoices = () => {
      setVoices(speechEngine.getEnglishVoices());
    };
    loadVoices();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
      return () => {
        window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        soundEffects.playKeyClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleTestAudio = useCallback(() => {
    if (isTestingVoice) {
      speechEngine.stop();
      setIsTestingVoice(false);
      return;
    }

    setTestNotice(null);
    if (soundEffectsEnabled) {
      soundEffects.playSuccessTone();
    }

    setIsTestingVoice(true);
    speechEngine.speak('Thank you for waiting for me. Let us review our core deliverables.', {
      rate: speechRate,
      pitch: speechPitch,
      voiceURI: voiceURI || undefined,
      onStart: () => setIsTestingVoice(true),
      onEnd: () => setIsTestingVoice(false),
      onError: (err) => {
        setIsTestingVoice(false);
        setTestNotice(err.message || 'Browser speech output unavailable.');
      },
    });
  }, [isTestingVoice, soundEffectsEnabled, speechRate, speechPitch, voiceURI]);

  if (!isOpen) return null;

  const isLightTheme = isSkeuomorphic || isMaterial || isEditorial || isClay || isSaas || isNordic || isBrutal;

  const backdropClass = isSkeuomorphic
    ? 'bg-[#120804]/75 backdrop-blur-xs font-sans'
    : isCyberpunk
    ? 'bg-[#04050E]/82 backdrop-blur-md font-sans'
    : isMaterial
    ? 'bg-slate-900/45 backdrop-blur-xs font-material'
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
    : `bg-slate-950/75 backdrop-blur-md ${isBrutal || isObsidian || isGlass ? 'font-sans' : 'font-mono'}`;

  const dialogClass = isSkeuomorphic
    ? 'skeuo-paper-elevated border-2 border-[#6B4A2B] rounded-lg max-w-3xl w-full max-h-[88vh] flex flex-col text-[#1F140E]'
    : isCyberpunk
    ? 'cyber-card-elevated border border-cyan-400/45 border-t-2 border-t-[#00F0FF] rounded-sm max-w-3xl w-full max-h-[88vh] flex flex-col text-[#E6F4FF]'
    : isMaterial
    ? 'material-card-elevated border-t-4 border-t-[#1565C0] rounded-xl max-w-3xl w-full max-h-[88vh] flex flex-col text-[#111827]'
    : isEditorial
    ? 'editorial-card-elevated border-2 border-[#1D1814] rounded-none max-w-3xl w-full max-h-[88vh] flex flex-col text-[#1D1814]'
    : isSlate
    ? 'slate-card-elevated border border-slate-700/90 rounded-lg max-w-3xl w-full max-h-[88vh] flex flex-col text-slate-100'
    : isClay
    ? 'clay-card-elevated border border-white/95 rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col text-[#1E2547]'
    : isSaas
    ? 'saas-card-elevated border border-slate-200 rounded-xl max-w-3xl w-full max-h-[88vh] flex flex-col text-slate-900'
    : isNordic
    ? 'nordic-card-elevated border border-[#DDD7C8] rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col text-[#242E28]'
    : isBrutal
    ? 'bg-[#FFFDF5] border-2 border-black max-w-3xl w-full max-h-[88vh] flex flex-col text-black brutal-shadow-lg'
    : isObsidian
    ? 'obsidian-surface border border-[#D4AF37]/35 max-w-3xl w-full max-h-[88vh] flex flex-col text-[#F5F0E6]'
    : isGlass
    ? 'glass-panel-elevated border border-white/25 rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col text-slate-100'
    : 'bg-zinc-950 border border-zinc-800 rounded-lg max-w-3xl w-full max-h-[88vh] flex flex-col text-zinc-100 shadow-2xl';

  const dividerBorderClass = isSkeuomorphic
    ? 'border-[#C8B896]'
    : isCyberpunk
    ? 'border-cyan-400/25'
    : isMaterial
    ? 'border-[#E2E8F0]'
    : isEditorial
    ? 'border-[#1D1814]/25'
    : isSlate
    ? 'border-slate-700/80'
    : isClay
    ? 'border-[#DCE2F7]'
    : isSaas
    ? 'border-slate-200'
    : isNordic
    ? 'border-[#E4DFD4]'
    : isBrutal
    ? 'border-black'
    : isObsidian
    ? 'border-[#2A241A]'
    : isGlass
    ? 'border-white/15'
    : 'border-zinc-800';

  const wellClass = isSkeuomorphic
    ? 'skeuo-well rounded-md border border-[#B8A482]/70'
    : isCyberpunk
    ? 'cyber-well rounded-sm border border-cyan-400/25'
    : isMaterial
    ? 'bg-[#F1F5F9] border border-[#DCE3ED] rounded-lg'
    : isEditorial
    ? 'editorial-well rounded-none border border-[#C9BFA9]'
    : isSlate
    ? 'bg-[#0B1220] border border-slate-800 rounded-lg'
    : isClay
    ? 'clay-well rounded-2xl border border-white/75'
    : isSaas
    ? 'bg-slate-50 border border-slate-200 rounded-lg'
    : isNordic
    ? 'nordic-well rounded-xl border border-[#E2DDD0]'
    : isBrutal
    ? 'bg-white border-2 border-black'
    : isObsidian
    ? 'bg-[#0B0B0E] border border-[#2A241A]'
    : isGlass
    ? 'glass-well rounded-xl border border-white/15'
    : 'bg-zinc-900/70 border border-zinc-800 rounded-md';

  const mutedTextClass = isSkeuomorphic
    ? 'text-[#5A3D28]'
    : isCyberpunk
    ? 'text-slate-300'
    : isMaterial
    ? 'text-[#475569]'
    : isEditorial
    ? 'text-[#574D42]'
    : isSlate
    ? 'text-slate-400'
    : isClay
    ? 'text-[#4B5478]'
    : isSaas
    ? 'text-slate-500'
    : isNordic
    ? 'text-[#4E5A53]'
    : isBrutal
    ? 'text-zinc-700'
    : isObsidian
    ? 'text-[#A39E93]'
    : isGlass
    ? 'text-slate-300'
    : 'text-zinc-400';

  const sectionTitleClass = isSkeuomorphic
    ? 'text-xs font-mono font-bold uppercase tracking-[0.12em] text-[#8C1D18]'
    : isCyberpunk
    ? 'text-xs font-cyber font-bold uppercase tracking-[0.12em] text-[#00F0FF]'
    : isMaterial
    ? 'text-xs font-bold uppercase tracking-[0.08em] text-[#1565C0]'
    : isEditorial
    ? 'text-xs font-mono font-semibold uppercase tracking-[0.14em] text-[#9B2226]'
    : isSlate
    ? 'text-xs font-semibold uppercase tracking-[0.1em] text-teal-300'
    : isClay
    ? 'text-xs font-bold uppercase tracking-[0.1em] text-indigo-600'
    : isSaas
    ? 'text-xs font-semibold uppercase tracking-[0.1em] text-indigo-700'
    : isNordic
    ? 'text-xs font-semibold uppercase tracking-[0.1em] text-[#3B5948]'
    : isBrutal
    ? 'text-xs font-black uppercase tracking-wider text-black'
    : isObsidian
    ? 'text-xs font-semibold uppercase tracking-[0.16em] text-[#E5C77B]'
    : isGlass
    ? 'text-xs font-semibold uppercase tracking-[0.1em] text-sky-300'
    : 'text-xs font-mono font-bold uppercase tracking-wider text-amber-400';

  const segmentedBtnClass = (active: boolean) =>
    isSkeuomorphic
      ? `px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all whitespace-nowrap border ${
          active
            ? 'skeuo-brass-btn border-[#7A5915] font-bold'
            : 'bg-[#FFFDF6]/70 border-[#C8B896] text-[#4A3326] hover:border-[#8C6A3E]'
        }`
      : isCyberpunk
      ? `px-3 py-1.5 rounded-sm text-xs font-cyber uppercase tracking-wider cursor-pointer transition-all whitespace-nowrap border ${
          active
            ? 'bg-[#00F0FF] text-[#060714] border-cyan-200 font-bold'
            : 'bg-[#0C1532] text-slate-300 border-cyan-400/25 hover:border-[#00F0FF]'
        }`
      : isMaterial
      ? `px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all whitespace-nowrap border ${
          active
            ? 'bg-[#1565C0] text-white border-[#1565C0]'
            : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#1565C0]/50'
        }`
      : isEditorial
      ? `px-3 py-1.5 rounded-none text-xs font-mono cursor-pointer transition-colors whitespace-nowrap border ${
          active
            ? 'bg-[#9B2226] text-[#FAF5EA] border-[#1D1814] font-semibold'
            : 'bg-[#FFFDF7] text-[#433A31] border-[#C9BFA9] hover:border-[#1D1814]'
        }`
      : isSlate
      ? `px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap border ${
          active
            ? 'bg-teal-400 text-slate-950 border-teal-300 font-semibold'
            : 'bg-[#1E293B] text-slate-300 border-slate-700 hover:border-teal-400/50'
        }`
      : isClay
      ? `px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap border ${
          active
            ? 'bg-indigo-500 text-white border-indigo-400 clay-btn'
            : 'bg-white text-[#4B5478] border-white/90 hover:text-[#1E2547]'
        }`
      : isSaas
      ? `px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors whitespace-nowrap border ${
          active
            ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
        }`
      : isNordic
      ? `px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap border ${
          active
            ? 'bg-[#527360] text-[#FDFBF7] border-[#425F4E] font-semibold'
            : 'bg-[#FDFBF7] text-[#4E5A53] border-[#DDD7C8] hover:border-[#527360]/50'
        }`
      : isBrutal
      ? `px-3 py-1.5 text-xs font-black cursor-pointer transition-colors whitespace-nowrap border-2 border-black ${
          active ? 'bg-[#FFE500] text-black' : 'bg-white text-black hover:bg-[#FEF9C3]'
        }`
      : isObsidian
      ? `px-3 py-1.5 text-xs uppercase tracking-wider cursor-pointer transition-colors whitespace-nowrap border ${
          active
            ? 'bg-[#D4AF37] text-[#070709] border-[#E5C77B] font-semibold'
            : 'bg-[#14110C] text-[#A39E93] border-[#2A241A] hover:border-[#D4AF37]/40'
        }`
      : isGlass
      ? `px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap border ${
          active
            ? 'bg-sky-400 text-slate-950 border-sky-300 font-semibold'
            : 'bg-white/5 text-slate-200 border-white/15 hover:bg-white/10'
        }`
      : `px-3 py-1.5 rounded text-xs font-mono cursor-pointer transition-colors whitespace-nowrap border ${
          active
            ? 'bg-zinc-100 text-zinc-950 border-white font-bold'
            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
        }`;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${backdropClass}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundEffects.playKeyClick();
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className={dialogClass}
      >
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b ${dividerBorderClass} flex items-center justify-between gap-4 shrink-0`}>
          <div>
            <div
              id="settings-modal-title"
              className={
                isSkeuomorphic
                  ? 'flex items-center gap-2 font-editorial-display text-xl font-bold tracking-tight text-[#1F140E]'
                  : isCyberpunk
                  ? 'flex items-center gap-2 font-cyber text-lg font-bold tracking-[0.1em] uppercase text-[#00F0FF]'
                  : isMaterial
                  ? 'flex items-center gap-2 text-lg font-bold tracking-tight text-[#111827]'
                  : isEditorial
                  ? 'flex items-center gap-2 font-editorial-display text-xl font-bold tracking-tight text-[#1D1814]'
                  : isObsidian
                  ? 'flex items-center gap-2 font-luxury text-xl font-semibold tracking-[0.14em] uppercase text-[#F5F0E6]'
                  : isBrutal
                  ? 'flex items-center gap-2 text-base font-black uppercase tracking-tight text-black'
                  : 'flex items-center gap-2 text-base font-bold tracking-tight'
              }
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span>Workspace Settings</span>
            </div>
            <p className={`text-xs mt-0.5 ${mutedTextClass}`}>
              Configure visual theme, audio feedback, and speech synthesis preferences.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEffects.playKeyClick();
              onClose();
            }}
            aria-label="Close settings"
            className={
              isBrutal
                ? 'p-1.5 border-2 border-black bg-[#FFE500] text-black cursor-pointer'
                : isLightTheme
                ? 'p-1.5 rounded-lg opacity-75 hover:opacity-100 cursor-pointer transition-opacity'
                : 'p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer transition-colors'
            }
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {/* SECTION 1: AUDIO & VOICE OPTIONS */}
          <section aria-labelledby="settings-audio-heading" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 shrink-0 opacity-80" />
                <h3 id="settings-audio-heading" className={sectionTitleClass}>
                  Audio &amp; Speech Options
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestAudio}
                  className={segmentedBtnClass(isTestingVoice)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {isTestingVoice ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isTestingVoice ? 'Stop Preview' : 'Preview Audio'}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetAudioSettings();
                    soundEffects.playKeyClick();
                  }}
                  className={`text-[11px] px-2.5 py-1.5 cursor-pointer underline decoration-dotted underline-offset-4 ${mutedTextClass}`}
                >
                  Reset Audio
                </button>
              </div>
            </div>

            {testNotice && (
              <div className={`${wellClass} px-3 py-2 text-xs flex items-center justify-between gap-2`}>
                <span>{testNotice}</span>
                <button
                  type="button"
                  onClick={() => setTestNotice(null)}
                  className="text-[11px] font-semibold underline cursor-pointer shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className={`${wellClass} p-4 grid grid-cols-1 sm:grid-cols-2 gap-4`}>
              {/* UI Sound Effects Toggle */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold">UI Sound Effects</div>
                  <div className={`text-[11px] ${mutedTextClass}`}>
                    Tactile clicks, flips, and mastery chimes
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSoundEffectsEnabled(true);
                      soundEffects.playKeyClick();
                    }}
                    className={segmentedBtnClass(soundEffectsEnabled)}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      <span>On</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoundEffectsEnabled(false)}
                    className={segmentedBtnClass(!soundEffectsEnabled)}
                  >
                    <span className="inline-flex items-center gap-1">
                      <VolumeX className="w-3 h-3" />
                      <span>Muted</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Auto-Speak on Flip Toggle */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold">Auto-Speak on Flip</div>
                  <div className={`text-[11px] ${mutedTextClass}`}>
                    Read Power Phrase aloud when card flips
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playKeyClick();
                      setAutoSpeakOnFlip(false);
                    }}
                    className={segmentedBtnClass(!autoSpeakOnFlip)}
                  >
                    Off
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playKeyClick();
                      setAutoSpeakOnFlip(true);
                    }}
                    className={segmentedBtnClass(autoSpeakOnFlip)}
                  >
                    On
                  </button>
                </div>
              </div>

              {/* Voice Playback Speed */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold">Voice Cadence</div>
                  <div className={`text-[11px] ${mutedTextClass}`}>
                    Speech synthesis playback speed
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {[
                    { value: 0.8, label: '0.8x' },
                    { value: 1.0, label: '1.0x' },
                    { value: 1.2, label: '1.2x' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        soundEffects.playKeyClick();
                        setSpeechRate(opt.value);
                      }}
                      className={`${segmentedBtnClass(speechRate === opt.value)} font-mono tabular-nums`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Pitch */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold">Voice Tone Pitch</div>
                  <div className={`text-[11px] ${mutedTextClass}`}>
                    Calibrate vocal register
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {[
                    { value: 0.9, label: 'Low' },
                    { value: 1.0, label: 'Natural' },
                    { value: 1.1, label: 'Bright' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        soundEffects.playKeyClick();
                        setSpeechPitch(opt.value);
                      }}
                      className={segmentedBtnClass(speechPitch === opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Browser Speech Voice Selector */}
              <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-current/10">
                <div>
                  <label htmlFor="settings-voice-select" className="text-xs font-semibold block">
                    Speech Voice
                  </label>
                  <span className={`text-[11px] ${mutedTextClass}`}>
                    {voices.length > 0
                      ? `${voices.length} browser voices available`
                      : 'Using system default browser speech voice'}
                  </span>
                </div>
                <select
                  id="settings-voice-select"
                  value={voiceURI}
                  onChange={(e) => {
                    soundEffects.playKeyClick();
                    setVoiceURI(e.target.value);
                  }}
                  className={
                    isLightTheme
                      ? 'px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 text-xs max-w-xs w-full sm:w-64 focus:outline-none'
                      : 'px-3 py-1.5 rounded-md border border-slate-700 bg-slate-900 text-slate-100 text-xs max-w-xs w-full sm:w-64 focus:outline-none'
                  }
                >
                  <option value="">Auto (Recommended English)</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 2: THEME SELECTION */}
          <section aria-labelledby="settings-theme-heading" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 shrink-0 opacity-80" />
                <h3 id="settings-theme-heading" className={sectionTitleClass}>
                  Theme Selection (12 Visual Systems)
                </h3>
              </div>

              {theme === 'terminal' && (
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playKeyClick();
                    onToggleCrtScanlines();
                  }}
                  className={segmentedBtnClass(isCrtScanlinesEnabled)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Monitor className="w-3 h-3" />
                    <span>CRT Scanlines: {isCrtScanlinesEnabled ? 'On' : 'Off'}</span>
                  </span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {THEME_OPTIONS.map((item) => {
                const isActive = theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playKeyClick();
                      setTheme(item.id);
                    }}
                    aria-pressed={isActive}
                    className={
                      isSkeuomorphic
                        ? `text-left p-3 rounded-md border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                            isActive
                              ? 'skeuo-paper border-2 border-[#B38628] ring-2 ring-[#E8C978]/50'
                              : 'bg-[#FFFDF6]/70 border-[#C8B896] hover:border-[#8C6A3E]'
                          }`
                        : isCyberpunk
                        ? `text-left p-3 rounded-sm border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                            isActive
                              ? 'bg-[#0E1A3D] border-[#00F0FF] shadow-[0_0_16px_-6px_rgba(0,240,255,0.65)]'
                              : 'bg-[#080C20]/80 border-cyan-400/20 hover:border-[#00F0FF]/60'
                          }`
                        : isMaterial
                        ? `text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                            isActive
                              ? 'bg-[#E3F2FD] border-[#1565C0] ring-1 ring-[#1565C0]'
                              : 'bg-white border-[#CBD5E1] hover:border-[#1565C0]/50'
                          }`
                        : isEditorial
                        ? `text-left p-3 rounded-none border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                            isActive
                              ? 'bg-[#FAF5EA] border-2 border-[#9B2226]'
                              : 'bg-[#FFFDF7] border-[#C9BFA9] hover:border-[#1D1814]'
                          }`
                        : isSlate
                        ? `text-left p-3 rounded-lg border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                            isActive
                              ? 'bg-[#1E293B] border-teal-400 ring-1 ring-teal-400/30'
                              : 'bg-[#0B1220] border-slate-800 hover:border-slate-600'
                          }`
                        : isClay
                        ? `text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                            isActive
                              ? 'bg-[#E5E9FF] border-indigo-400 ring-1 ring-indigo-400/30'
                              : 'bg-white border-white/90 hover:border-indigo-200'
                          }`
                        : isSaas
                        ? `text-left p-3 rounded-lg border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                            isActive
                              ? 'bg-indigo-50/70 border-indigo-600 ring-1 ring-indigo-600/20'
                              : 'bg-white border-slate-200 hover:border-indigo-300'
                          }`
                        : isNordic
                        ? `text-left p-3 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                            isActive
                              ? 'bg-[#E7EFEA] border-[#527360]'
                              : 'bg-[#FDFBF7] border-[#E4DFD4] hover:border-[#527360]/50'
                          }`
                        : isBrutal
                        ? `text-left p-3 border-2 border-black transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                            isActive
                              ? 'bg-[#FFE500] brutal-shadow-sm'
                              : 'bg-white hover:bg-[#FEF9C3]'
                          }`
                        : isObsidian
                        ? `text-left p-3 border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                            isActive
                              ? 'bg-[#18140D] border-[#D4AF37]'
                              : 'bg-[#0B0B0E] border-[#2A241A] hover:border-[#D4AF37]/45'
                          }`
                        : isGlass
                        ? `text-left p-3 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                            isActive
                              ? 'bg-sky-400/15 border-sky-300'
                              : 'bg-white/[0.04] border-white/15 hover:border-white/30'
                          }`
                        : `text-left p-3 rounded border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                            isActive
                              ? 'bg-zinc-900 border-amber-400'
                              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'
                          }`
                    }
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-1.5" aria-hidden="true">
                        {item.swatches.map((hex, idx) => (
                          <span
                            key={idx}
                            className="w-3 h-3 rounded-xs border border-black/20 shrink-0"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                      <span className={`text-[10px] font-mono tabular-nums font-bold ${isActive ? '' : mutedTextClass}`}>
                        {isActive ? 'ACTIVE' : `#${item.number}`}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold leading-snug flex items-center justify-between gap-1.5">
                        <span className="truncate">{item.name}</span>
                        {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </div>
                      <div className={`text-[11px] mt-0.5 truncate ${mutedTextClass}`}>{item.vibe}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-3.5 border-t ${dividerBorderClass} flex flex-wrap items-center justify-between gap-3 shrink-0`}>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                soundEffects.playKeyClick();
                onClose();
                onOpenShortcuts();
              }}
              className={`inline-flex items-center gap-1.5 cursor-pointer hover:underline ${mutedTextClass}`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Keyboard Shortcuts</span>
            </button>
            <span aria-hidden="true" className={mutedTextClass}>·</span>
            <button
              type="button"
              onClick={() => {
                soundEffects.playKeyClick();
                onClose();
                onOpenClearProgress();
              }}
              className={`inline-flex items-center gap-1.5 cursor-pointer hover:underline ${mutedTextClass}`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Saved Progress</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEffects.playKeyClick();
              onClose();
            }}
            className={
              isSkeuomorphic
                ? 'px-5 py-2 rounded-md skeuo-brass-btn border border-[#7A5915] font-bold uppercase tracking-wider text-xs cursor-pointer'
                : isCyberpunk
                ? 'px-5 py-2 rounded-sm bg-gradient-to-r from-[#00F0FF] to-[#FF2A85] text-[#060714] border border-cyan-200/80 font-cyber font-bold uppercase tracking-[0.12em] text-xs cursor-pointer cyber-btn'
                : isMaterial
                ? 'px-5 py-2 rounded-lg bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold uppercase tracking-wider text-xs cursor-pointer material-btn'
                : isEditorial
                ? 'px-5 py-2 rounded-none bg-[#9B2226] hover:bg-[#7F1D1D] text-[#FAF5EA] border border-[#1D1814] font-semibold uppercase tracking-[0.14em] text-xs cursor-pointer shadow-[2px_2px_0_#1D1814]'
                : isSlate
                ? 'px-5 py-2 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold uppercase tracking-wider text-xs cursor-pointer'
                : isClay
                ? 'px-5 py-2 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold uppercase tracking-wider text-xs cursor-pointer clay-btn'
                : isSaas
                ? 'px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold uppercase tracking-wider text-xs cursor-pointer'
                : isNordic
                ? 'px-5 py-2 rounded-xl bg-[#527360] hover:bg-[#425F4E] text-[#FDFBF7] font-semibold uppercase tracking-wider text-xs cursor-pointer'
                : isBrutal
                ? 'px-5 py-2 bg-[#86EFAC] hover:bg-[#4ADE80] text-black border-2 border-black font-black text-xs cursor-pointer brutal-btn'
                : isObsidian
                ? 'px-5 py-2 bg-[#D4AF37] hover:bg-[#E5C77B] text-[#070709] font-semibold uppercase tracking-[0.16em] text-xs cursor-pointer'
                : isGlass
                ? 'px-5 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold uppercase tracking-wider text-xs cursor-pointer'
                : 'px-5 py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs cursor-pointer'
            }
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
