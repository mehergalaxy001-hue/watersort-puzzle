/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Sparkles, 
  HelpCircle, 
  RotateCcw, 
  PlusCircle, 
  Volume2, 
  VolumeX, 
  Play, 
  ChevronRight, 
  BookOpen,
  ArrowRight,
  Gift,
  Settings,
  Check,
  Undo,
  X,
  Info,
  Ban,
  MegaphoneOff,
  Home,
  ShoppingBag,
  Lock,
  Music,
  Palette
} from 'lucide-react';
import { Bottle } from './components/Bottle';
import { LevelSelector } from './components/LevelSelector';
import { Stats } from './components/Stats';
import { PrivacyAboutModal } from './components/PrivacyAboutModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { BottleState, COLOR_PALETTE } from './types';
import { canPour, pour, checkWin, generateLevel, getHint } from './utils/gameLogic';
import { audio } from './utils/audio';
import { useAdMob, AdMobBannerAd, AdMobNativeAd } from './components/AdMobManager';

// Visual skin configs
export interface MarketSkin {
  id: string;
  name: string;
  color: string;
  cost: number;
  desc: string;
  isPremium?: boolean;
  priceInRupees?: string;
  priceInDollars?: string;
}

// Visual themes
interface ThemeConfig {
  id: string;
  name: string;
  tag: string;
  bgClass: string;
  containerBg: string;
  accentBtnClass: string;
  secondaryBtnClass: string;
  textColor: string;
  labelColor: string;
  description: string;
}

const THEMES: ThemeConfig[] = [
  {
    id: 'summer',
    name: 'Studio Pure White',
    tag: '⚪ WHITE',
    bgClass: 'bg-white',
    containerBg: 'bg-white/95 border-2 border-slate-200/80 shadow-xl',
    accentBtnClass: 'bg-amber-400 hover:bg-amber-500 text-slate-900 border-amber-600 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-slate-900',
    labelColor: 'bg-slate-900 text-white',
    description: 'A super-clean pure white workspace designed to make liquid colors shine under clear lights.'
  },
  {
    id: 'christmas',
    name: 'Cozy Wood Cabin (Image 1)',
    tag: '🪵 CABIN',
    bgClass: 'bg-wood-cabin',
    containerBg: 'bg-white/85 backdrop-blur-md border-2 border-orange-200 shadow-xl',
    accentBtnClass: 'bg-orange-400 hover:bg-orange-500 text-slate-900 border-orange-600 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-stone-100 hover:bg-stone-200 text-slate-800 border-stone-300 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-stone-900',
    labelColor: 'bg-orange-400 text-slate-900',
    description: 'Warm mountain cabin light atmosphere with rich soft wood colors and cozy highlight borders.'
  },
  {
    id: 'pastel',
    name: 'Pastel SortPuz (Image 2)',
    tag: '☁️ SKYWAYS',
    bgClass: 'bg-pastel-breeze',
    containerBg: 'bg-white/80 backdrop-blur-md border-2 border-sky-100 shadow-xl',
    accentBtnClass: 'bg-sky-400 hover:bg-sky-500 text-sky-950 border-sky-600 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-white/90 hover:bg-white text-sky-900 border-sky-200 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-sky-950',
    labelColor: 'bg-sky-400 text-sky-950',
    description: 'Light, bright, airy sky background with floating clouds and minimal rounded glass styling.'
  },
  {
    id: 'stars',
    name: 'Starry Midnight (Image 3)',
    tag: '🌌 STARFALL',
    bgClass: 'bg-forest-stars',
    containerBg: 'bg-white/85 backdrop-blur-md border-2 border-indigo-200 shadow-xl',
    accentBtnClass: 'bg-indigo-400 hover:bg-indigo-500 text-white border-indigo-600 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-slate-100 hover:bg-slate-200 text-indigo-900 border-slate-200 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-indigo-900',
    labelColor: 'bg-indigo-400 text-slate-900',
    description: 'Deep light royal twilight morning sky with constellation and dreamy sky-blue highlights.'
  },
  {
    id: 'pink',
    name: 'Water Splash (Image 4)',
    tag: '🌸 SUNSET',
    bgClass: 'bg-playful-pink',
    containerBg: 'bg-white/80 backdrop-blur-md border-2 border-pink-100 shadow-xl',
    accentBtnClass: 'bg-rose-500 hover:bg-rose-600 text-white border-rose-700 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-white hover:bg-white text-rose-800 border-pink-200 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-pink-900',
    labelColor: 'bg-rose-400 text-white',
    description: 'Joyful peach/pink tropical sunrise gradient canvas, clean light borders, and high contrast accents.'
  },
  {
    id: 'volcanic',
    name: 'Obsidian Fire Cave',
    tag: '🌋 OBSIDIAN',
    bgClass: 'bg-volcanic-fire',
    containerBg: 'bg-slate-900/85 backdrop-blur-md border-2 border-orange-500/80 shadow-[0_0_20px_rgba(234,88,12,0.15)]',
    accentBtnClass: 'bg-orange-600 hover:bg-orange-700 text-white border-orange-900 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-slate-800 hover:bg-slate-700 text-orange-200 border-slate-950 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-orange-100',
    labelColor: 'bg-orange-600 text-white',
    description: 'A subterranean volcanic obsidian cavern filled with deep red magma streams and molten stone contours.'
  },
  {
    id: 'deepsea',
    name: 'Deep-Sea Atlantic Abyss',
    tag: '🧜‍♂️ ABYSS',
    bgClass: 'bg-deep-sea-trench',
    containerBg: 'bg-slate-900/85 backdrop-blur-md border-2 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    accentBtnClass: 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-900 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-slate-800 hover:bg-slate-700 text-cyan-200 border-slate-950 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-cyan-100',
    labelColor: 'bg-cyan-600 text-white',
    description: 'Dive into the pitch-black waters of the deep Atlantic trench with stunning bioluminescent highlights.'
  },
  {
    id: 'aurora',
    name: 'Polar Northern Aurora',
    tag: '🌌 POLARIS',
    bgClass: 'bg-aurora-borealis',
    containerBg: 'bg-slate-900/85 backdrop-blur-md border-2 border-emerald-500/85 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    accentBtnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-900 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-slate-800 hover:bg-slate-700 text-emerald-200 border-slate-950 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-emerald-100',
    labelColor: 'bg-emerald-600 text-white',
    description: 'Experience the shimmering green and sky-violet currents of the majestic winter Aurora Borealis.'
  },
  {
    id: 'cyberpunk',
    name: 'Neo-Tokyo Cyberpunk',
    tag: '⚡ CYBER',
    bgClass: 'bg-neon-cyberpunk',
    containerBg: 'bg-slate-950/90 backdrop-blur-md border-2 border-pink-500/80 shadow-[0_0_20px_rgba(236,72,153,0.2)]',
    accentBtnClass: 'bg-pink-600 hover:bg-pink-700 text-white border-pink-900 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-slate-900 hover:bg-slate-800 text-pink-300 border-pink-950 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-pink-100',
    labelColor: 'bg-pink-600 text-white',
    description: 'Fast-paced metropolitan styling featuring high contrast laser pink, ultraviolet and cyan elements.'
  },
  {
    id: 'emerald',
    name: 'Magic Jade Forest',
    tag: '🌳 EMERALD',
    bgClass: 'bg-enchanted-emerald',
    containerBg: 'bg-teal-950/85 backdrop-blur-md border-2 border-teal-500/80 shadow-[0_0_20px_rgba(20,184,166,0.15)]',
    accentBtnClass: 'bg-teal-600 hover:bg-teal-700 text-white border-teal-900 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-slate-800 hover:bg-slate-700 text-teal-200 border-slate-950 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-teal-100',
    labelColor: 'bg-teal-600 text-white',
    description: 'Immerse in the luxury of ancient druid woodlands with gold moss details and rich emerald gradients.'
  }
];

// 100 Custom Premium Vessel shapes for the Galactic Market (Guaranteed non-repeating)
const vesselPrefixes = [
  "Quantum", "Hyperion", "Nebula", "Luminous", "Aether", "Eclipse", "Solar", "Galactic", "Stellar", "Pulsar", 
  "Abyssal", "Astral", "Celestial", "Titan", "Spectral", "Cosmic", "Helios", "Obsidian", "Vortex", "Chrono", 
  "Prism", "Sovereign", "Tempest", "Zenith", "Phoenix", "Aurora", "Infinity", "Helix", "Saga", "Legacy",
  "Arcane", "Cyber", "Enchanted", "Mystic", "Prestige", "Vector", "Titanium", "Matrix", "Supernova", "Primal"
];
const vesselSuffixes = [
  "Chalice", "Flask", "Beaker", "Vessel", "Decanter", "Potion", "Specimen", "Prism", "Star", "Goblet", 
  "Sphere", "Cylinder", "Obelisk", "Capsule", "Reservoir", "Container", "Urn", "Crucible", "Amphora", "Jar",
  "Phial", "Carafe", "Vial", "Canister", "Vat", "Cauldron", "Cruet", "Tumbler", "Conduit", "Crux"
];
const vesselEmojis = [
  "🧪", "🥛", "💎", "🔮", "🔲", "🍷", "⭐", "🏆", "🔬", "🍺", "🍹", "🍼", "🍯", "🏺", "🍶", "🥤", "🍵", "🏮", "🧬"
];

const MARKET_VESSELS = Array.from({ length: 100 }, (_, i) => {
  if (i === 0) {
    return { id: 'standard', name: 'Classic specimen', icon: '🧪', cost: 0, desc: 'The classic narrow-neck glass test tube.' };
  }
  
  const prefIndex = i % vesselPrefixes.length;
  const suffIndex = (i * 7) % vesselSuffixes.length;
  const emojiIndex = (i * 3) % vesselEmojis.length;
  
  const name = `${vesselPrefixes[prefIndex]} ${vesselSuffixes[suffIndex]}`;
  
  let cost = 100000; // Default fallback
  if (i === 1 || i === 2) {
    cost = 10000;
  } else if (i >= 3 && i <= 50) {
    cost = 50000;
  } else if (i >= 51) {
    cost = 100000;
  }
  
  const desc = `Procedural Premium space vessel #${i}. Elegant high-contrast glass with unique cosmic styling.`;
  
  return {
    id: `vessel_${i}`,
    name,
    icon: vesselEmojis[emojiIndex],
    cost,
    desc
  };
});

// Procedural prefix, suffixes and neon coloring arrays to generate exactly 110 skins!
const prefixes = ["Stardust", "Orion", "Nebula", "Solar", "Supernova", "Cosmic", "Galaxy", "Lunar", "Nova", "Astral", "Quantum", "Spectral", "Plasma", "Gravity", "Wormhole", "Void", "Aurora", "Pulsar", "Meteor", "Celestial"];
const suffixes = ["Glow", "Dust", "Vortex", "Aura", "Shimmer", "Mist", "Wave", "Ray", "Tide", "Storm", "Spark", "Ember", "Pulse", "Warp", "Drift", "Halo", "Matrix", "Mirror", "Shadow", "Rift"];
const skinColors = ["#22d3ee", "#c084fc", "#facc15", "#f43f5e", "#10b981", "#3b82f6", "#f97316", "#ec4899", "#8b5cf6", "#14b8a6", "#34d399", "#a7f3d0", "#67e8f9", "#fb7185", "#ca8a04"];

const PREMIUM_SKINS: MarketSkin[] = [
  {
    id: "skin_lunar_dust",
    name: "Lunar Dust",
    color: "#e2e8f0",
    cost: 0,
    isPremium: true,
    priceInRupees: "₹10",
    priceInDollars: "$0.12 USD",
    desc: "Premium celestial silver aura. Radiates stunning moonlit brilliance."
  },
  {
    id: "skin_nova_shimmer",
    name: "Nova Shimmer",
    color: "#d946ef",
    cost: 0,
    isPremium: true,
    priceInRupees: "₹10",
    priceInDollars: "$0.12 USD",
    desc: "Premium energetic pink-purple flare. Gleams like a dazzling stellar nova."
  },
  {
    id: "skin_astral_ray",
    name: "Astral Ray",
    color: "#06b6d4",
    cost: 0,
    isPremium: true,
    priceInRupees: "₹10",
    priceInDollars: "$0.12 USD",
    desc: "Premium high-charge cosmic plasma glow. Beams like a direct laser ray."
  }
];

const PROCEDURAL_SKINS: MarketSkin[] = Array.from({ length: 110 }, (_, i) => {
  const skinId = i + 1;
  const p = prefixes[skinId % prefixes.length];
  const s = suffixes[(skinId * 3) % suffixes.length];
  const color = skinColors[skinId % skinColors.length];
  
  let cost = 100000; // Default fallback
  if (skinId === 1 || skinId === 2) {
    cost = 10000;
  } else if (skinId >= 3 && skinId <= 50) {
    cost = 50000;
  } else if (skinId >= 51) {
    cost = 100000;
  }
  
  return {
    id: `skin_${skinId}`,
    name: `${p} ${s} #${skinId}`,
    color,
    cost,
    desc: `A glowing visual celestial outlining aura.`
  };
});

const MARKET_SKINS: MarketSkin[] = [...PREMIUM_SKINS, ...PROCEDURAL_SKINS];

const SPIN_WHEEL_SECTORS = [
  { value: 100, color: '#3b82f6', label: '100 Coin', secondaryColor: '#1d4ed8' },
  { value: 10000, color: '#eab308', label: '10,000 Coin', secondaryColor: '#ca8a04', highlight: true },
  { value: 10, color: '#f97316', label: '10 Coin', secondaryColor: '#c2410c' },
  { value: 1000, color: '#a855f7', label: '1,000 Coin', secondaryColor: '#7e22ce' },
  { value: 100, color: '#3b82f6', label: '100 Coin', secondaryColor: '#1d4ed8' },
  { value: 10000, color: '#eab308', label: '10,000 Coin', secondaryColor: '#ca8a04', highlight: true },
  { value: 10, color: '#f97316', label: '10 Coin', secondaryColor: '#c2410c' },
  { value: 1000, color: '#a855f7', label: '1,000 Coin', secondaryColor: '#7e22ce' },
];

export default function App() {
  const { showInterstitial, showRewarded, showAppOpen } = useAdMob();
  // Game level states
  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    const saved = localStorage.getItem('water_sort_level');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(() => {
    const saved = localStorage.getItem('water_sort_max_unlocked');
    return saved ? Math.max(1, parseInt(saved, 10)) : 1;
  });

  // Coin wallet balance (Initial starting balance set to 1000 coins so users can freely shop!)
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('water_sort_coins');
    if (saved) return parseInt(saved, 10);
    return 1000; 
  });

  // Welcome Lucky Spin Wheel states for first-time players
  const [hasDoneInitialSpin, setHasDoneInitialSpin] = useState<boolean>(() => {
    return localStorage.getItem('water_sort_has_done_spin') === 'true';
  });
  const [totalSpinsCount, setTotalSpinsCount] = useState<number>(() => {
    const saved = localStorage.getItem('water_sort_total_spin_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showSpinModalManual, setShowSpinModalManual] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinAngle, setSpinAngle] = useState<number>(0);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [spinAdLoading, setSpinAdLoading] = useState<boolean>(false);
  const [spinAdProgress, setSpinAdProgress] = useState<number>(0);
  const [showSpinClaimedSuccess, setShowSpinClaimedSuccess] = useState<boolean>(false);

  const handleOpenSpinModalManual = () => {
    audio.playClick();
    setSpinResult(null);
    setShowSpinClaimedSuccess(false);
    setIsSpinning(false);
    setSpinAngle(0);
    setSpinAdProgress(0);
    setSpinAdLoading(false);
    setShowSpinModalManual(true);
  };

  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(() => {
    const saved = localStorage.getItem('water_sort_unlocked_themes');
    return saved ? JSON.parse(saved) : ['summer', 'pastel']; 
  });

  // Purchased Vessel and Skin arrays
  const [unlockedVessels, setUnlockedVessels] = useState<string[]>(() => {
    const saved = localStorage.getItem('water_sort_unlocked_vessels');
    return saved ? JSON.parse(saved) : ['standard'];
  });

  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(() => {
    const saved = localStorage.getItem('water_sort_unlocked_skins');
    return saved ? JSON.parse(saved) : ['skin_none'];
  });

  // Equipped styles
  const [activeVesselStyle, setActiveVesselStyle] = useState<string>(() => {
    return localStorage.getItem('water_sort_active_vessel') || 'standard';
  });

  const [activeSkinId, setActiveSkinId] = useState<string>(() => {
    return localStorage.getItem('water_sort_active_skin_id') || 'skin_none';
  });

  const [activeSkinGlowColor, setActiveSkinGlowColor] = useState<string | undefined>(() => {
    return localStorage.getItem('water_sort_active_skin_glow') || undefined;
  });

  // Skin toggle option State
  const [skinEnabled, setSkinEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('water_sort_skin_enabled');
    return saved !== 'false';
  });

  const finalSkinGlowColor = skinEnabled ? activeSkinGlowColor : undefined;
  const finalCenterSkinGlowColor = skinEnabled ? (activeSkinGlowColor || '#EC4899') : undefined;

  // Market display states
  const [showMarketModal, setShowMarketModal] = useState<boolean>(false);
  const [marketTab, setMarketTab] = useState<'vessels' | 'skins' | 'themes' | 'coins'>('vessels');
  const [marketOrigin, setMarketOrigin] = useState<'home' | 'settings' | 'game'>('home');
  const [skinPage, setSkinPage] = useState<number>(0);
  
  // Premium Exclusive Skins State
  const [selectedPremiumSkin, setSelectedPremiumSkin] = useState<any>(null);
  const [showPremiumSkinPurchaseModal, setShowPremiumSkinPurchaseModal] = useState<boolean>(false);

  // States to watch Ad to unlock skins for free
  const [watchingAdForSkin, setWatchingAdForSkin] = useState<{ id: string, name: string, color: string } | null>(null);
  const [adSkinProgress, setAdSkinProgress] = useState<number>(0);

  const [skinAdProgress, setSkinAdProgress] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('water_sort_skin_ad_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleWatchAdForSkinInstant = (skinId: string, name: string, color: string) => {
    audio.playClick();
    const currentProgress = skinAdProgress[skinId] || 0;
    const nextProgress = currentProgress + 1;
    const updated = { ...skinAdProgress, [skinId]: nextProgress };
    setSkinAdProgress(updated);
    localStorage.setItem('water_sort_skin_ad_progress', JSON.stringify(updated));

    if (nextProgress >= 2) {
      audio.playCelebration();
      setUnlockedSkins((prev) => {
        const next = [...prev, skinId];
        localStorage.setItem('water_sort_unlocked_skins', JSON.stringify(next));
        return next;
      });
      setActiveSkinId(skinId);
      setActiveSkinGlowColor(color);
      localStorage.setItem('water_sort_active_skin_id', skinId);
      localStorage.setItem('water_sort_active_skin_glow', color);

      setClaimedReward(`🎉 SKIN UNLOCKED FOR FREE! "${name}" outline is now unlocked. 2 of 2 ad steps completed safely without video ads! Enjoy sorting!`);
      setShowClaimModal(true);
    } else {
      setClaimedReward(`📺 AD PROGRESS [1/2] tracked! Successfully completed 1 of 2 ad simulated requirements for "${name}". Click FREE once more to unlock instantly!`);
      setShowClaimModal(true);
    }
  };

  useEffect(() => {
    if (!watchingAdForSkin) {
      setAdSkinProgress(0);
      return;
    }
    const totalTime = 3000;
    const intervalTime = 50;
    const steps = totalTime / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min(100, Math.round((currentStep / steps) * 100));
      setAdSkinProgress(progress);

      if (progress >= 100) {
        clearInterval(timer);
        audio.playCelebration();
        
        const skinId = watchingAdForSkin.id;
        const color = watchingAdForSkin.color;
        const name = watchingAdForSkin.name;

        setUnlockedSkins((prev) => {
          const next = [...prev, skinId];
          localStorage.setItem('water_sort_unlocked_skins', JSON.stringify(next));
          return next;
        });

        setActiveSkinId(skinId);
        setActiveSkinGlowColor(color);
        localStorage.setItem('water_sort_active_skin_id', skinId);
        localStorage.setItem('water_sort_active_skin_glow', color);

        setClaimedReward(`🎉 SKIN UNLOCKED FOR FREE! "${name}" aura was successfully unlocked by watching the quick sponsor commercial. Enjoy your new glowing outlines!`);
        setShowClaimModal(true);
        setWatchingAdForSkin(null);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [watchingAdForSkin]);

  // Splash loader (Loads for 4 seconds total)
  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);
  const [splashPhase, setSplashPhase] = useState<'studio' | 'gate'>('studio');
  const [splashProgress, setSplashProgress] = useState<number>(0);
  const [currentLyric, setCurrentLyric] = useState<string>('Hey, Go! 🌴 Splashing colors in the flow!');

  useEffect(() => {
    const handleLyric = (e: any) => {
      if (e.detail && e.detail.lyric) {
        setCurrentLyric(e.detail.lyric);
      }
    };
    window.addEventListener('bgmLyric', handleLyric);
    return () => {
      window.removeEventListener('bgmLyric', handleLyric);
    };
  }, []);

  // Modals
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState<boolean>(false);
  const [showPrivacyOnly, setShowPrivacyOnly] = useState<boolean>(false);
  const [boosterPrompt, setBoosterPrompt] = useState<'tube' | 'hint' | 'skip' | null>(null);

  useEffect(() => {
    const phase1Duration = 2000; // Galaxy Studio splash screen (2 seconds)
    const phase2Duration = 2000; // Water Sort Puzzle Game loading gate (2 seconds)
    const intervalTime = 50;
    let elapsed = 0;

    const splashTimer = setInterval(() => {
      elapsed += intervalTime;

      if (elapsed < phase1Duration) {
        setSplashPhase('studio');
        setSplashProgress(0);
      } else if (elapsed < phase1Duration + phase2Duration) {
        setSplashPhase('gate');
        const p2Elapsed = elapsed - phase1Duration;
        const progress = Math.min(100, Math.floor((p2Elapsed / phase2Duration) * 100));
        setSplashProgress(progress);
      } else {
        clearInterval(splashTimer);
        setSplashProgress(100);
        setIsSplashActive(false);
        showAppOpen();
      }
    }, intervalTime);

    // Bootstrap default storage saves - only save 1000 coins if they've completed their welcome spin
    if (!localStorage.getItem('water_sort_coins')) {
      if (localStorage.getItem('water_sort_has_done_spin') === 'true') {
        localStorage.setItem('water_sort_coins', '1000');
      } else {
        localStorage.setItem('water_sort_coins', '0');
      }
    }
    if (!localStorage.getItem('water_sort_unlocked_themes')) {
      localStorage.setItem('water_sort_unlocked_themes', JSON.stringify(['summer', 'pastel']));
    }
    if (!localStorage.getItem('water_sort_unlocked_vessels')) {
      localStorage.setItem('water_sort_unlocked_vessels', JSON.stringify(['standard']));
    }
    if (!localStorage.getItem('water_sort_unlocked_skins')) {
      localStorage.setItem('water_sort_unlocked_skins', JSON.stringify(['skin_none']));
    }

    return () => clearInterval(splashTimer);
  }, []);

  // Play the lucky welcome spin! Selects a dynamic wedge, animates, and prepares the interstitial sponsor ad
  const handleStartSpin = () => {
    if (isSpinning) return;
    audio.playClick();
    setIsSpinning(true);
    
    // Increment total spin requests counter for the active session
    const nextSpinCount = totalSpinsCount + 1;
    setTotalSpinsCount(nextSpinCount);
    localStorage.setItem('water_sort_total_spin_count', String(nextSpinCount));

    // Choose targetIdx based on precise custom probabilities requested by the user:
    // - 90% chance: 100 Coins (Wedges at Index 0 or 4)
    // - 7% chance: 1,000 Coins (Wedges at Index 3 or 7)
    // - 3% chance: 10 Coins (Wedges at Index 2 or 6)
    let targetIdx;
    const roll = Math.random() * 100;
    if (roll <= 90) {
      targetIdx = Math.random() < 0.5 ? 0 : 4; // 100 Coins
    } else if (roll <= 97) {
      targetIdx = Math.random() < 0.5 ? 3 : 7; // 1,000 Coins
    } else {
      targetIdx = Math.random() < 0.5 ? 2 : 6; // 10 Coins
    }

    const degreesPerSector = 360 / SPIN_WHEEL_SECTORS.length;
    const rounds = 5 + Math.floor(Math.random() * 3);
    
    // Fix alignment: pointing of pointer should be exactly in the center of the wedge slice, not on the partition border!
    // Offset by half sector width (degreesPerSector / 2) to prevent landing on joints
    const stopAngle = rounds * 360 + (360 - (targetIdx * degreesPerSector + (degreesPerSector / 2)));
    
    setSpinAngle(stopAngle);

    setTimeout(() => {
      const sector = SPIN_WHEEL_SECTORS[targetIdx];
      setSpinResult(sector.value);
      setIsSpinning(false);
      
      // Immediately show the award claim screen requiring the real AdMob rewarded ad
      setSpinAdLoading(false);
      setShowSpinClaimedSuccess(true);
    }, 4600); // Wait for the rotation layout to settle beautifully
  };

  useEffect(() => {
    if (spinAdLoading) {
      const adInterval = setInterval(() => {
        setSpinAdProgress((prev) => {
          if (prev >= 100) {
            clearInterval(adInterval);
            setIsSpinning(false);
            setSpinAdLoading(false);
            setShowSpinClaimedSuccess(true);
            audio.playCelebration();
            return 100;
          }
          return prev + 10;
        });
      }, 350); // Simulates 3.5 seconds of high-fidelity ad loading
      return () => clearInterval(adInterval);
    }
  }, [spinAdLoading]);

  const [bottles, setBottles] = useState<BottleState[]>([]);
  const [selectedBottleId, setSelectedBottleId] = useState<number | null>(null);
  const [history, setHistory] = useState<BottleState[][]>([]);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'home' | 'level-select'>('home');
  const [addedExtraBottle, setAddedExtraBottle] = useState<boolean>(false);
  const [isTransitioningToWin, setIsTransitioningToWin] = useState<boolean>(false);

  // Rewards and Booster ad states
  const [isAdPlaying, setIsAdPlaying] = useState<boolean>(false);
  const [adCountdown, setAdCountdown] = useState<number>(0);
  const [adActionType, setAdActionType] = useState<'gift' | 'hint' | 'tube' | 'skip' | null>(null);
  const [onAdCompleteCallback, setOnAdCompleteCallback] = useState<(() => void) | null>(null);

  // Settings popover
  const [showHomeSettingsMenu, setShowHomeSettingsMenu] = useState<boolean>(false);
  const [showNoAdsModal, setShowNoAdsModal] = useState<boolean>(false);
  const [checkoutItem, setCheckoutItem] = useState<{ title: string; price: string; icon: string; desc: string } | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [tutorialCoords, setTutorialCoords] = useState<{ x: number; y: number; label: string } | null>(null);
  
  // Powerups State
  const [boosters, setBoosters] = useState<{ undo: number; extraBottle: number }>({
    undo: 5,
    extraBottle: 2
  });

  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('water_sort_theme');
    const matched = THEMES.find(t => t.id === saved);
    return matched || THEMES[0];
  });

  const isDarkThemeActive = activeTheme.id !== 'summer' && activeTheme.id !== 'pastel' && activeTheme.id !== 'pink';

  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('water_sort_music_muted');
    return saved === 'true';
  });

  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('water_sort_sound_muted');
    return saved === 'true';
  });

  // Snappy physical timings optimized for smooth fast progression
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [pourSourceId, setPourSourceId] = useState<number | null>(null);
  const [pourTargetId, setPourTargetId] = useState<number | null>(null);
  const [pourAngle, setPourAngle] = useState<number>(0);
  const [pourOffset, setPourOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isStreamActive, setIsStreamActive] = useState<boolean>(false);
  const [streamColor, setStreamColor] = useState<string>('');

  // Solvability hints
  const [isHintActive, setIsHintActive] = useState<boolean>(false);
  const [isExtraTubeHintActive, setIsExtraTubeHintActive] = useState<boolean>(false);
  const [hintDetails, setHintDetails] = useState<{ from: number; to: number } | null>(null);
  const [hintCoords, setHintCoords] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  useEffect(() => {
    if (!isHintActive || (!hintDetails && !isExtraTubeHintActive)) {
      setHintCoords(null);
      return;
    }

    const updateCoords = () => {
      if (isExtraTubeHintActive) {
        const extraBtn = document.getElementById('booster-button-extra-tube');
        if (extraBtn) {
          const parentElem = extraBtn.offsetParent || document.body;
          const parentRect = parentElem.getBoundingClientRect();
          const rect = extraBtn.getBoundingClientRect();
          setHintCoords({
            x1: rect.left - parentRect.left + rect.width / 2,
            y1: rect.top - parentRect.top - 15,
            x2: rect.left - parentRect.left + rect.width / 2,
            y2: rect.top - parentRect.top
          });
        }
        return;
      }

      const sourceElem = document.getElementById(`bottle-wrapper-${hintDetails.from}`);
      const targetElem = document.getElementById(`bottle-wrapper-${hintDetails.to}`);

      if (sourceElem && targetElem) {
        const parentElem = sourceElem.offsetParent || document.body;
        const parentRect = parentElem.getBoundingClientRect();
        const srcRect = sourceElem.getBoundingClientRect();
        const destRect = targetElem.getBoundingClientRect();

        setHintCoords({
          x1: srcRect.left - parentRect.left + srcRect.width / 2,
          y1: srcRect.top - parentRect.top,
          x2: destRect.left - parentRect.left + destRect.width / 2,
          y2: destRect.top - parentRect.top,
        });
      }
    };

    updateCoords();
    const timer1 = setTimeout(updateCoords, 60);
    const timer2 = setTimeout(updateCoords, 200);
    window.addEventListener('resize', updateCoords);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isHintActive, hintDetails, isExtraTubeHintActive, bottles]);

  // Interactive 2-level guide tutorial automatic tracking hook
  useEffect(() => {
    if (currentLevel > 2 || status !== 'playing') {
      setTutorialCoords(null);
      return;
    }

    const updateTutorialCoords = () => {
      const tutMove = getHint(bottles);
      if (!tutMove) {
        setTutorialCoords(null);
        return;
      }

      // If nothing is selected, point to 'from' bottle. If selected, point to 'to' bottle.
      const targetBottleId = selectedBottleId === null ? tutMove.from : tutMove.to;
      const targetElem = document.getElementById(`bottle-wrapper-${targetBottleId}`);
      if (targetElem) {
        const parentElem = targetElem.offsetParent || document.body;
        const parentRect = parentElem.getBoundingClientRect();
        const rect = targetElem.getBoundingClientRect();
        const label = selectedBottleId === null 
          ? "TAP TO SELECT BOTTLE" 
          : "TAP HERE TO POUR";
        setTutorialCoords({
          x: rect.left - parentRect.left + rect.width / 2,
          y: rect.top - parentRect.top,
          label
        });
      } else {
        setTutorialCoords(null);
      }
    };

    updateTutorialCoords();
    const t1 = setTimeout(updateTutorialCoords, 60);
    const t2 = setTimeout(updateTutorialCoords, 250);
    const t3 = setTimeout(updateTutorialCoords, 600);
    window.addEventListener('resize', updateTutorialCoords);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', updateTutorialCoords);
    };
  }, [currentLevel, status, selectedBottleId, bottles]);

  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [claimedReward, setClaimedReward] = useState<string>('');

  const pourAudioHandleRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    audio.setMusicMute(isMusicMuted);
  }, [isMusicMuted]);

  useEffect(() => {
    audio.setSoundMute(isSoundMuted);
  }, [isSoundMuted]);

  // Automatic ambient BGM trigger on first user interaction (bypasses browser autoplay policy cleanly)
  useEffect(() => {
    const triggerBGM = () => {
      if (!isMusicMuted) {
        audio.startBGM();
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('click', triggerBGM);
      window.removeEventListener('pointerdown', triggerBGM);
      window.removeEventListener('keydown', triggerBGM);
      window.removeEventListener('touchstart', triggerBGM);
      window.removeEventListener('mousedown', triggerBGM);
      window.removeEventListener('mouseover', triggerBGM);
      window.removeEventListener('focus', triggerBGM);
      document.removeEventListener('visibilitychange', triggerBGM);
    };

    window.addEventListener('click', triggerBGM);
    window.addEventListener('pointerdown', triggerBGM);
    window.addEventListener('keydown', triggerBGM);
    window.addEventListener('touchstart', triggerBGM);
    window.addEventListener('mousedown', triggerBGM);
    window.addEventListener('mouseover', triggerBGM, { once: true });
    window.addEventListener('focus', triggerBGM);
    document.addEventListener('visibilitychange', triggerBGM);

    if (!isMusicMuted) {
      audio.startBGM();
    }

    return cleanup;
  }, [isMusicMuted]);

  // Snappy simulated ads (Completes inside 1.5 seconds)
  useEffect(() => {
    if (!isAdPlaying) return;
    if (adCountdown <= 0) {
      setIsAdPlaying(false);
      audio.playWin();
      if (onAdCompleteCallback) {
        onAdCompleteCallback();
      }
      return;
    }

    const timer = setTimeout(() => {
      setAdCountdown(prev => prev - 1);
    }, 400); 

    return () => clearTimeout(timer);
  }, [isAdPlaying, adCountdown, onAdCompleteCallback]);

  const triggerAdAndExecute = (type: 'gift' | 'hint' | 'tube' | 'skip', onComplete: () => void) => {
    audio.playClick();
    showRewarded(() => {
      onComplete();
    });
  };

  useEffect(() => {
    if (status === 'playing') {
      const initialBottles = generateLevel(currentLevel);
      setBottles(initialBottles);
      setSelectedBottleId(null);
      setHistory([]);
      setMovesCount(0);
      setAddedExtraBottle(false);
      setIsHintActive(false);
      setIsExtraTubeHintActive(false);
      setHintDetails(null);
    }
  }, [currentLevel, status]);

  const handleToggleMusicMute = () => {
    const nextMuted = !isMusicMuted;
    setIsMusicMuted(nextMuted);
    localStorage.setItem('water_sort_music_muted', String(nextMuted));
    audio.setMusicMute(nextMuted);
  };

  const handleToggleSoundMute = () => {
    const nextMuted = !isSoundMuted;
    setIsSoundMuted(nextMuted);
    localStorage.setItem('water_sort_sound_muted', String(nextMuted));
    audio.setSoundMute(nextMuted);
  };

  // Buy custom Vessel styles (exactly 10,000 Coins as requested)
  const handleEquipVessel = (vesselId: string, cost: number, name: string) => {
    const isUnlocked = unlockedVessels.includes(vesselId);
    if (isUnlocked) {
      audio.playClick();
      setActiveVesselStyle(vesselId);
      localStorage.setItem('water_sort_active_vessel', vesselId);
    } else {
      if (coins >= cost) {
        audio.playWin();
        const nextCoins = coins - cost;
        setCoins(nextCoins);
        localStorage.setItem('water_sort_coins', String(nextCoins));

        const nextUnlocked = [...unlockedVessels, vesselId];
        setUnlockedVessels(nextUnlocked);
        localStorage.setItem('water_sort_unlocked_vessels', JSON.stringify(nextUnlocked));

        setActiveVesselStyle(vesselId);
        localStorage.setItem('water_sort_active_vessel', vesselId);

        setClaimedReward(`🎉 BOTTLE UNLOCKED! You spent ${cost} Coins and equipped the precious "${name}" vessel shape successfully!`);
        setShowClaimModal(true);
      } else {
        audio.playInvalid();
        setClaimedReward(`⚠️ INSUFFICIENT COINS! Unlocking the "${name}" custom vessel costs exactly ${cost} Coins. Complete more levels to earn coins!`);
        setShowClaimModal(true);
      }
    }
  };

  // Buy procedural cosmetic Outline auras (exactly 10,000 Coins as requested)
  const handleEquipSkin = (skinId: string, glowColor: string, cost: number, name: string) => {
    const isUnlocked = unlockedSkins.includes(skinId);
    if (isUnlocked) {
      audio.playClick();
      setActiveSkinId(skinId);
      setActiveSkinGlowColor(glowColor);
      localStorage.setItem('water_sort_active_skin_id', skinId);
      localStorage.setItem('water_sort_active_skin_glow', glowColor);
    } else {
      const isPremiumSkin = PREMIUM_SKINS.find(p => p.id === skinId);
      if (isPremiumSkin) {
        audio.playClick();
        setSelectedPremiumSkin(isPremiumSkin);
        setShowPremiumSkinPurchaseModal(true);
      } else {
        if (coins >= cost) {
          audio.playWin();
          const nextCoins = coins - cost;
          setCoins(nextCoins);
          localStorage.setItem('water_sort_coins', String(nextCoins));

          const nextUnlocked = [...unlockedSkins, skinId];
          setUnlockedSkins(nextUnlocked);
          localStorage.setItem('water_sort_unlocked_skins', JSON.stringify(nextUnlocked));

          setActiveSkinId(skinId);
          setActiveSkinGlowColor(glowColor);
          localStorage.setItem('water_sort_active_skin_id', skinId);
          localStorage.setItem('water_sort_active_skin_glow', glowColor);

          setClaimedReward(`🌌 COSMIC SKIN SHADER EQUIPPED! You spent ${cost} Coins and activated the neon glowing "${name}" aura outline shader!`);
          setShowClaimModal(true);
        } else {
          audio.playInvalid();
          setClaimedReward(`⚠️ INSUFFICIENT COINS! Unlocking the precious space outline theme shader "${name}" costs ${cost} Coins. Keep sorting!`);
          setShowClaimModal(true);
        }
      }
    }
  };

  // Switch Themes
  const handleSelectTheme = (theme: ThemeConfig) => {
    const isUnlocked = unlockedThemes.includes(theme.id);
    if (isUnlocked) {
      audio.playClick();
      setActiveTheme(theme);
      localStorage.setItem('water_sort_theme', theme.id);
    } else {
      if (coins >= 10000) {
        audio.playWin();
        const nextCoins = coins - 10000;
        setCoins(nextCoins);
        localStorage.setItem('water_sort_coins', String(nextCoins));

        const nextUnlocked = [...unlockedThemes, theme.id];
        setUnlockedThemes(nextUnlocked);
        localStorage.setItem('water_sort_unlocked_themes', JSON.stringify(nextUnlocked));

        setActiveTheme(theme);
        localStorage.setItem('water_sort_theme', theme.id);

        setClaimedReward(`🎉 THEME PURCHASED! Spent 10000 Coins and successfully unlocked the core landscape artwork theme "${theme.name}"!`);
        setShowClaimModal(true);
      } else {
        audio.playInvalid();
        setClaimedReward(`⚠️ INSUFFICIENT COINS! Premium Theme "${theme.name}" costs 10000 Coins. Solve more levels, or claim free coin bundles!`);
        setShowClaimModal(true);
      }
    }
  };

  const handleOpenThemeMarket = () => {
    audio.playClick();
    setMarketTab('themes');
    setShowMarketModal(true);
  };

  const handleStartGame = (lvl: number) => {
    setCurrentLevel(lvl);
    localStorage.setItem('water_sort_level', String(lvl));
    setStatus('playing');
  };

  const handleRestart = () => {
    const initialBottles = generateLevel(currentLevel);
    setBottles(initialBottles);
    setSelectedBottleId(null);
    setHistory([]);
    setMovesCount(0);
    setAddedExtraBottle(false);
    setIsHintActive(false);
    setIsExtraTubeHintActive(false);
    setHintDetails(null);
    if (pourAudioHandleRef.current) {
      pourAudioHandleRef.current.stop();
    }
    setIsPouring(false);
    setPourSourceId(null);
    setPourTargetId(null);
    setPourAngle(0);
    setPourOffset({ x: 0, y: 0 });
    setIsStreamActive(false);
  };

  const handleUndo = async () => {
    if (history.length === 0 || isPouring || isTransitioningToWin) return;
    
    if (coins < 1000) {
      audio.playInvalid();
      setClaimedReward('⚠️ INSUFFICIENT COINS! Each Undo step costs exactly 1000 gold coins. Solve more levels to earn coins!');
      setShowClaimModal(true);
      return;
    }

    // Determine the source and target bottles of the reverse animation
    const previousState = JSON.parse(JSON.stringify(history[history.length - 1])) as BottleState[];
    
    // Find undoSourceId and undoTargetId based on total volume changes (where water was added/removed)
    let undoSourceId: number | null = null;
    let undoTargetId: number | null = null;

    for (let i = 0; i < bottles.length; i++) {
      const bCur = bottles[i];
      const bPrev = previousState.find(b => b.id === bCur.id);
      if (bPrev) {
        const vCur = bCur.layers.reduce((sum, l) => sum + l.volume, 0);
        const vPrev = bPrev.layers.reduce((sum, l) => sum + l.volume, 0);
        if (vCur > vPrev) {
          undoSourceId = bCur.id;
        } else if (vCur < vPrev) {
          undoTargetId = bCur.id;
        }
      }
    }

    const nextCoins = coins - 1000;
    setCoins(nextCoins);
    localStorage.setItem('water_sort_coins', String(nextCoins));
    audio.playUndo();

    const prevHistory = [...history];
    prevHistory.pop();
    setHistory(prevHistory);
    setMovesCount((prev) => Math.max(0, prev - 1));
    setSelectedBottleId(null);
    setIsHintActive(false);
    setIsExtraTubeHintActive(false);
    setHintDetails(null);

    if (undoSourceId !== null && undoTargetId !== null) {
      // Rise Phase: Smoothly lift the undo source bottle upwards first
      setSelectedBottleId(undoSourceId);
      await new Promise((r) => setTimeout(r, 250));

      // We run the full, physical pouring animation backwards!
      setIsPouring(true);
      setPourSourceId(undoSourceId);
      setPourTargetId(undoTargetId);

      const sourceWrapper = document.getElementById(`bottle-wrapper-${undoSourceId}`);
      const targetWrapper = document.getElementById(`bottle-wrapper-${undoTargetId}`);

      let dx = 0;
      let dy = 0;

      if (sourceWrapper && targetWrapper) {
        const sourceRect = sourceWrapper.getBoundingClientRect();
        const targetRect = targetWrapper.getBoundingClientRect();
        dx = targetRect.left - sourceRect.left;
        dy = targetRect.top - sourceRect.top;
      } else {
        const sourceIndex = bottles.findIndex((b) => b.id === undoSourceId);
        const targetIndex = bottles.findIndex((b) => b.id === undoTargetId);
        dx = (targetIndex - sourceIndex) * 98;
        dy = 0;
      }

      const isRight = dx > 0;
      const angle = isRight ? 75 : -75;
      const shiftX = dx + (isRight ? -38 : 38);
      const shiftY = dy - 120;

      setPourOffset({ x: shiftX, y: shiftY });
      setPourAngle(angle);

      // Stream color matches the top layer of current undoSourceId which will pour back
      const topUndoSourceLayer = bottles.find(b => b.id === undoSourceId)?.layers[bottles.find(b => b.id === undoSourceId)!.layers.length - 1];
      if (topUndoSourceLayer) {
        setStreamColor(topUndoSourceLayer.color);
      }

      pourAudioHandleRef.current = audio.startPour();

      // Reverse Phase 1: Tilt & Travel (380ms)
      await new Promise((r) => setTimeout(r, 380));
      setIsStreamActive(true);

      // Reverse Phase 2: Flow (380ms)
      await new Promise((r) => setTimeout(r, 380));

      // Restore board state seamlessly mid-stream
      setBottles(previousState);

      // Reverse Phase 3: Trickle (150ms)
      await new Promise((r) => setTimeout(r, 150));
      setIsStreamActive(false);

      // Stop pouring sound IMMEDIATELY when water flow is finished
      if (pourAudioHandleRef.current) {
        pourAudioHandleRef.current.stop();
        pourAudioHandleRef.current = null;
      }

      // Reverse Phase 4: Put back home (380ms)
      setPourAngle(0);
      setPourOffset({ x: 0, y: 0 });

      await new Promise((r) => setTimeout(r, 380));

      setIsPouring(false);
      setPourSourceId(null);
      setPourTargetId(null);
      setSelectedBottleId(null); // Return bottle back down to standard position
    } else {
      // Immediate backup restore if we can't find direct source/target tracking
      setBottles(previousState);
    }
  };

  const handleAddBottle = () => {
    if (isPouring || isTransitioningToWin) return;
    
    if (bottles.length >= 15) {
      setClaimedReward("⚠️ MAXIMUM BOTTLE LIMIT REACHED (15)!");
      setShowClaimModal(true);
      return;
    }
    
    const extraTube: BottleState = {
      id: bottles.length,
      layers: [],
      capacity: 4,
      isExtra: true
    };
    
    setBottles((prev) => [...prev, extraTube]);
    setAddedExtraBottle(true);
    setIsHintActive(false);
    setIsExtraTubeHintActive(false);
    setHintDetails(null);
  };

  const handleToggleHint = () => {
    if (isTransitioningToWin) return;
    if (isHintActive) {
      setIsHintActive(false);
      setHintDetails(null);
      setIsExtraTubeHintActive(false);
    } else {
      const hint = getHint(bottles);
      if (hint) {
        setHintDetails(hint);
        setIsExtraTubeHintActive(false);
        setIsHintActive(true);
      } else {
        audio.playInvalid();
        setIsExtraTubeHintActive(true);
        setIsHintActive(true);
        setClaimedReward("⚠️ STUCK - NO MOVES POSSIBLE!\nAn empty assist container is required to advance. Click the 'Extra' Tube Booster below! 🧪");
        setShowClaimModal(true);
      }
    }
  };

  const handleClaimGift = () => {
    audio.playWin();
    setBoosters({
      undo: 5,
      extraBottle: 2
    });
    const nextCoins = coins + 500;
    setCoins(nextCoins);
    localStorage.setItem('water_sort_coins', String(nextCoins));
    setClaimedReward('BOOSTER PACKAGE UNLOCKED! 🎁 Received +5 Undo charges, +2 Assist Tubes, and +500 Gold Coins!');
    setShowClaimModal(true);
  };

  const handleHomeGiftWithAd = () => {
    audio.playClick();
    audio.playWin();
    const updatedCoins = coins + 50; // Giving 50 coins as requested
    setCoins(updatedCoins);
    localStorage.setItem('water_sort_coins', String(updatedCoins));
    setClaimedReward("🎁 CONGRATULATIONS! You claimed your free gift and earned +50 Gold Coins!");
    setShowClaimModal(true);
  };

  const handleSelectBottle = async (bottleId: number) => {
    if (status !== 'playing' || isPouring || isTransitioningToWin) return;

    if (selectedBottleId === null) {
      const bottle = bottles.find((b) => b.id === bottleId);
      if (!bottle || bottle.layers.length === 0) {
        audio.playInvalid();
        return;
      }
      
      audio.playSelect();
      setSelectedBottleId(bottleId);
    } else {
      const sourceId = selectedBottleId;
      const targetId = bottleId;

      if (sourceId === targetId) {
        audio.playSelect();
        setSelectedBottleId(null);
        return;
      }

      const sourceBottle = bottles.find((b) => b.id === sourceId)!;
      const targetBottle = bottles.find((b) => b.id === targetId)!;

      if (!canPour(sourceBottle, targetBottle)) {
        audio.playInvalid();
        setSelectedBottleId(null);
        return;
      }

      setIsPouring(true);
      setPourSourceId(sourceId);
      setPourTargetId(targetId);
      setIsHintActive(false);
      setIsExtraTubeHintActive(false);
      setHintDetails(null);

      const snapshot = JSON.parse(JSON.stringify(bottles)) as BottleState[];
      setHistory((prev) => [...prev, snapshot]);

      // Calculate coordinates translation offsets
      const sourceWrapper = document.getElementById(`bottle-wrapper-${sourceId}`);
      const targetWrapper = document.getElementById(`bottle-wrapper-${targetId}`);

      let dx = 0;
      let dy = 0;

      if (sourceWrapper && targetWrapper) {
        const sourceRect = sourceWrapper.getBoundingClientRect();
        const targetRect = targetWrapper.getBoundingClientRect();
        dx = targetRect.left - sourceRect.left;
        dy = targetRect.top - sourceRect.top;
      } else {
        const sourceIndex = bottles.findIndex((b) => b.id === sourceId);
        const targetIndex = bottles.findIndex((b) => b.id === targetId);
        dx = (targetIndex - sourceIndex) * 98;
        dy = 0;
      }

      const isRight = dx > 0;
      const angle = isRight ? 75 : -75;
      const shiftX = dx + (isRight ? -38 : 38);
      const shiftY = dy - 120; 

      setPourOffset({ x: shiftX, y: shiftY });
      setPourAngle(angle);

      const topSourceLayer = sourceBottle.layers[sourceBottle.layers.length - 1];
      setStreamColor(topSourceLayer.color);

      pourAudioHandleRef.current = audio.startPour();

      // NORMAL PHASE 1: Tilt & Travel (380ms)
      await new Promise((r) => setTimeout(r, 380));
      setIsStreamActive(true);

      // NORMAL PHASE 2: Flow (380ms)
      await new Promise((r) => setTimeout(r, 380));

      const { source: nextSource, target: nextTarget } = pour(sourceBottle, targetBottle);

      setBottles((prev) =>
          prev.map((b) => {
            if (b.id === sourceId) return nextSource;
            if (b.id === targetId) return nextTarget;
            return b;
          })
      );

      // NORMAL PHASE 3: Trickle out (150ms)
      await new Promise((r) => setTimeout(r, 150));
      setIsStreamActive(false);

      // Stop pouring sound IMMEDIATELY when water flow is finished
      if (pourAudioHandleRef.current) {
        pourAudioHandleRef.current.stop();
        pourAudioHandleRef.current = null;
      }

      // NORMAL PHASE 4: Reset tilt/travel home (380ms)
      setPourAngle(0);
      setPourOffset({ x: 0, y: 0 });

      await new Promise((r) => setTimeout(r, 380));

      setIsPouring(false);
      setPourSourceId(null);
      setPourTargetId(null);
      setSelectedBottleId(null);
      setMovesCount((prev) => prev + 1);

      const afterPourAllBottles = bottles.map((b) => {
        if (b.id === sourceId) return nextSource;
        if (b.id === targetId) return nextTarget;
        return b;
      });

      if (checkWin(afterPourAllBottles)) {
        setIsTransitioningToWin(true);
        audio.playWin();

        setTimeout(() => {
          setIsTransitioningToWin(false);
          setStatus('won');

          const nextLvl = currentLevel + 1;
          localStorage.setItem('water_sort_level', String(nextLvl));

          const nextMax = Math.max(maxUnlockedLevel, nextLvl);
          setMaxUnlockedLevel(nextMax);
          localStorage.setItem('water_sort_max_unlocked', String(nextMax));

          // +50 coins per level cleared
          const nextCoins = coins + 50;
          setCoins(nextCoins);
          localStorage.setItem('water_sort_coins', String(nextCoins));
        }, 1000);
      }
    }
  };

  const handleNextLevel = () => {
    audio.playClick();
    
    const proceed = () => {
      const nextLvl = currentLevel + 1;
      setCurrentLevel(nextLvl);

      const nextMax = Math.max(maxUnlockedLevel, nextLvl);
      setMaxUnlockedLevel(nextMax);
      localStorage.setItem('water_sort_max_unlocked', String(nextMax));

      setStatus('playing');
    };

    // Show real preloaded AdMob Interstitial at level transition every 3 levels
    if (currentLevel % 3 === 0) {
      showInterstitial(proceed);
    } else {
      proceed();
    }
  };

  const isGateLevel = currentLevel % 10 === 0 && currentLevel > 0;

  // Split outer tubes symmetrically for Gate Levels
  const getGateTubesSplit = () => {
    if (!isGateLevel || bottles.length === 0) {
      return { centerTube: null, leftTubes: [], rightTubes: [], bottomTubes: [] };
    }
    const centerTube = bottles[0];
    const outer = bottles.slice(1);
    const leftCount = Math.min(4, Math.floor(outer.length / 2));
    const rightCount = leftCount;
    const leftTubes = outer.slice(0, leftCount);
    const rightTubes = outer.slice(leftCount, leftCount + rightCount);
    const bottomTubes = outer.slice(leftCount + rightCount);
    
    return { centerTube, leftTubes, rightTubes, bottomTubes };
  };

  const { centerTube, leftTubes, rightTubes, bottomTubes } = getGateTubesSplit();

  // Symmetrical layout rows splitting
  const getTubeRows = () => {
    if (bottles.length < 5) {
      return [bottles, []];
    }
    const midpoint = Math.ceil(bottles.length / 2);
    const row1 = bottles.slice(0, midpoint);
    const row2 = bottles.slice(midpoint);
    return [row1, row2];
  };

  const [row1Tubes, row2Tubes] = getTubeRows();

  // "level change saha bottle bi change karaeba"
  // If activeVesselStyle is standard, we rotate styles based on level to alternate shapes!
  // If they lock in/equip a custom style, it stays equipped.
  const currentVesselStyle = activeVesselStyle === 'standard'
    ? MARKET_VESSELS[(currentLevel) % MARKET_VESSELS.length].id
    : activeVesselStyle;

  if (isSplashActive) {
    if (splashPhase === 'studio') {
      return (
        <div 
          id="splash-loader-screen-studio"
          className="fixed inset-0 bg-[#0052FF] flex flex-col items-center justify-center z-[99999] select-none text-white overflow-hidden cursor-pointer"
          onClick={() => {
            if (!isMusicMuted) {
              audio.startBGM();
            }
          }}
          onPointerDown={() => {
            if (!isMusicMuted) {
              audio.startBGM();
            }
          }}
        >
          <div className="flex flex-col items-center justify-center gap-10 max-w-sm w-full p-6">
            {/* Main Diamond Icon Container */}
            <div className="relative">
              {/* Solid Pink/Magenta/Red Rotated Square (Diamond) with soft drop shadow */}
              <div className="relative w-24 h-24 bg-[#FF0563] rounded-[24px] rotate-45 flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.22)]">
                {/* White Letter "G" - rotated back -45deg to stay upright */}
                <div className="transform -rotate-45 text-5xl font-black text-white font-sans tracking-tight">
                  G
                </div>
              </div>
            </div>

            {/* Texts Section */}
            <div className="flex flex-col items-center gap-2.5 text-center mt-3">
              <h1 className="text-white text-[42px] font-black tracking-[0.22em] leading-none uppercase translate-x-[0.11em] font-sans">
                GALAXY
              </h1>
              <p className="text-[#FF8FAB] text-xs font-black tracking-[0.48em] uppercase translate-x-[0.24em] mt-1 font-sans">
                STUDIO
              </p>
            </div>
          </div>

          {/* Kept clean with no intrusive overlay labels */}
        </div>
      );
    } else {
      // High Fidelity Custom Loading Gate Screen styled exactly like user reference image
      return (
        <div 
          id="splash-loader-screen-gate"
          className="fixed inset-0 bg-gradient-to-b from-[#7FB1FF] via-[#5D9AFF] to-[#2563EB] flex flex-col items-center justify-between z-[99999] select-none text-white overflow-hidden p-6 pb-12"
        >
          {/* Drifting subtle blue stars and ambient bubble sparkles */}
          <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
            <div className="absolute top-[10%] left-[8%] w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
            <div className="absolute top-[25%] right-[12%] w-3.5 h-3.5 bg-sky-200 rounded-full animate-pulse" />
            <div className="absolute top-[50%] left-[18%] w-1.5 h-1.5 bg-yellow-200 rounded-full" />
            <div className="absolute bottom-[35%] right-[15%] w-3 h-3 bg-purple-200 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
          </div>

          {/* Fluffy white Vector Silhouetted Clouds at bottom of loading gate */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none h-44 z-0 opacity-90">
            <svg className="absolute bottom-[-15px] left-0 w-full h-36 fill-white" viewBox="0 0 1000 100" preserveAspectRatio="none">
              <path d="M 0,100 C 60,70 140,70 190,100 C 240,60 370,60 440,100 C 490,50 640,50 710,100 C 770,70 910,70 1000,100 Z" fill="#F0F6FF" opacity="0.6" />
              <path d="M 0,100 C 100,80 180,55 280,100 C 350,72 480,45 600,100 C 660,65 820,55 890,100 L 1000,100 L 0,100" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Spacer */}
          <div className="h-4" />

          {/* Logo Title Section with Pouring Bottle Overlay exactly like reference layout */}
          <div className="flex flex-col items-center justify-center text-center relative z-10 w-full max-w-sm mt-4">
            {/* Embedded 3D Bottle Pouring from Above the title */}
            <div className="absolute -top-14 left-1/2 -translate-x-[40px] w-20 h-20 pointer-events-none z-20">
              <svg className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)]" viewBox="0 0 100 100">
                <g style={{ transform: 'rotate(-40deg) translate(-10px, -2px)', transformOrigin: '50px 50px' }}>
                  {/* Bottle */}
                  <path d="M 35,20 L 65,20 L 65,30 C 65,35 75,38 75,55 L 75,85 C 75,92 65,95 50,95 C 35,95 25,92 25,85 L 25,55 C 25,38 35,35 35,30 Z" fill="none" stroke="#FFFFFF" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 35,20 L 65,20 L 65,30 C 65,35 75,38 75,55 L 75,85 C 75,92 65,95 50,95 C 35,95 25,92 25,85 L 25,55 C 25,38 35,35 35,30 Z" fill="rgba(255,255,255,0.15)" />
                  {/* Liquid inside */}
                  <path d="M 28,60 C 28,85 32,90 50,90 C 68,90 72,85 72,60 L 72,55 C 72,55 58,58 50,55 C 42,52 28,55 28,55 Z" fill="#06b6d4" />
                  {/* Glowing Reflection */}
                  <path d="M 32,58 C 29,66 29,78 32,83" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
                </g>
                {/* Flow Stream Pouring Down into the Text */}
                <path d="M 40,28 C 30,35 25,48 25,75 L 25,120" fill="none" stroke="#22d3ee" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
                {/* Water sparkles */}
                <circle cx="25" cy="85" r="3" fill="#FFFFFF" className="animate-ping" style={{ animationDuration: '1.5s' }} />
                <circle cx="28" cy="110" r="2.5" fill="#38bdf8" />
              </svg>
            </div>

            {/* Playful 3D Cartoon Logo Titles: "Water" and "Sort" */}
            <div className="flex flex-col items-center select-none pt-4 mt-2">
              <h1 
                className="text-[64px] font-sans font-black tracking-wide text-[#FBBF24] select-none"
                style={{
                  lineHeight: '0.82',
                  textShadow: '-2.5px -2.5px 0px #FFF, 2.5px -2.5px 0px #FFF, -2.5px 2.5px 0px #FFF, 2.5px 2.5px 0px #FFF, 4px 5px 0px #D97706, 7px 8px 0px #78350F, 0px 12px 16px rgba(0,0,0,0.45)'
                }}
              >
                Water
              </h1>
              <h1 
                className="text-[72px] font-sans font-black tracking-wider text-[#EC4899] select-none mt-1"
                style={{
                  lineHeight: '0.9',
                  textShadow: '-2.5px -2.5px 0px #FFF, 2.5px -2.5px 0px #FFF, -2.5px 2.5px 0px #FFF, 2.5px 2.5px 0px #FFF, 4px 5px 0px #9D174D, 7px 8px 0px #4C0519, 0px 12px 16px rgba(0,0,0,0.45)'
                }}
              >
                Sort
              </h1>
            </div>
          </div>

          {/* Middle Section: Three Standalone Glass Bottles loaded with beautiful colorful state layers */}
          <div className="flex items-center justify-center gap-6 z-10 my-6">
            {/* Tube 1: Red, Orange, Yellow, Green layers */}
            <div className="relative animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0s' }}>
              <div className="absolute -inset-1.5 bg-green-400/30 rounded-[28px] blur-sm animate-pulse -z-10" />
              <svg className="w-[62px] h-[142px] overflow-visible drop-shadow-xl" viewBox="0 0 100 240">
                {/* Glass Bottle Shell definition matched exactly to Bottle components */}
                <path d="M 32,15 L 68,15 L 68,55 C 68,70 85,75 85,95 L 85,220 C 85,235 70,238 50,238 C 30,238 15,235 15,220 L 15,95 C 15,75 32,70 32,55 Z" fill="rgba(255,255,255,0.08)" stroke="#FFFFFF" strokeWidth="5.5" strokeLinejoin="round" />
                {/* Stopper cap rim */}
                <rect x="25" y="8" width="50" height="9" rx="3.5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="2" />
                {/* Colored Liquid Layers (Bottom to Top) */}
                {/* Red layer */}
                <path d="M 18,185 L 82,185 C 82,210 75,233 50,233 C 25,233 18,210 18,185 Z" fill="#EF4444" />
                {/* Orange layer */}
                <rect x="17.5" y="145" width="65" height="40" fill="#F97316" />
                {/* Yellow layer */}
                <rect x="17.5" y="105" width="65" height="40" fill="#FBBF24" />
                {/* Green layer */}
                <path d="M 18,95 Q 50,97 82,95 L 82,105 L 18,105 Z" fill="#22C55E" />
                <rect x="23" y="85" width="54" height="20" fill="#22C55E" />
                {/* Gloss highlights reflection */}
                <path d="M 23,98 C 20,115 20,195 23,212" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
              </svg>
            </div>

            {/* Tube 2: Green, Purple, Yellow layers */}
            <div className="relative animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.4s' }}>
              <div className="absolute -inset-1.5 bg-yellow-400/30 rounded-[28px] blur-sm animate-pulse -z-10" />
              <svg className="w-[62px] h-[142px] overflow-visible drop-shadow-xl" viewBox="0 0 100 240">
                <path d="M 32,15 L 68,15 L 68,55 C 68,70 85,75 85,95 L 85,220 C 85,235 70,238 50,238 C 30,238 15,235 15,220 L 15,95 C 15,75 32,70 32,55 Z" fill="rgba(255,255,255,0.08)" stroke="#FFFFFF" strokeWidth="5.5" strokeLinejoin="round" />
                <rect x="25" y="8" width="50" height="9" rx="3.5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="2" />
                {/* Green layer bottom */}
                <path d="M 18,185 L 82,185 C 82,210 75,233 50,233 C 25,233 18,210 18,185 Z" fill="#22C55E" />
                {/* Purple layer middle */}
                <rect x="17.5" y="125" width="65" height="60" fill="#A855F7" />
                {/* Yellow layer top */}
                <path d="M 18,95 Q 50,97 82,95 L 82,125 L 18,125 Z" fill="#FBBF24" />
                <rect x="23" y="85" width="54" height="15" fill="#FBBF24" />
                <path d="M 23,98 C 20,115 20,195 23,212" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
              </svg>
              {/* Starry glimmers floating */}
              <span className="absolute -top-3 -right-2 text-yellow-300 text-lg animate-spin" style={{ animationDuration: '4s' }}>✦</span>
            </div>

            {/* Tube 3: Pink, Royal Blue, Sky Blue layers */}
            <div className="relative animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.8s' }}>
              <div className="absolute -inset-1.5 bg-sky-400/30 rounded-[28px] blur-sm animate-pulse -z-10" />
              <svg className="w-[62px] h-[142px] overflow-visible drop-shadow-xl" viewBox="0 0 100 240">
                <path d="M 32,15 L 68,15 L 68,55 C 68,70 85,75 85,95 L 85,220 C 85,235 70,238 50,238 C 30,238 15,235 15,220 L 15,95 C 15,75 32,70 32,55 Z" fill="rgba(255,255,255,0.08)" stroke="#FFFFFF" strokeWidth="5.5" strokeLinejoin="round" />
                <rect x="25" y="8" width="50" height="9" rx="3.5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="2" />
                {/* Pink bottom */}
                <path d="M 18,185 L 82,185 C 82,210 75,233 50,233 C 25,233 18,210 18,185 Z" fill="#EC4899" />
                {/* Royal blue middle */}
                <rect x="17.5" y="125" width="65" height="60" fill="#2563EB" />
                {/* Sky Blue top */}
                <path d="M 18,95 Q 50,97 82,95 L 82,125 L 18,125 Z" fill="#38BDF8" />
                <rect x="23" y="85" width="54" height="15" fill="#38BDF8" />
                <path d="M 23,98 C 20,115 20,195 23,212" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
              </svg>
            </div>
          </div>

          {/* Bottom Section: Progress and Neon Loading Bar */}
          <div className="flex flex-col items-center gap-3 w-full max-w-xs z-10 select-none pb-4">
            <span className="text-[15px] font-sans font-black tracking-widest text-[#FFF] uppercase animate-pulse">
              LOADING {splashProgress}%
            </span>
            
            {/* Elegant Neon Green Progress Container exactly matching reference layout */}
            <div className="w-full bg-[#1E293B] h-6 rounded-full p-1.5 overflow-hidden relative border-2 border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
              <div 
                className="bg-[#4ADE80] h-full rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(74,222,128,0.85)]"
                style={{ width: `${splashProgress}%` }}
              />
              {/* Overlay sheen highlight for glossy 3D feel */}
              <div className="absolute top-[2px] inset-x-3 h-1.5 bg-white/25 rounded-full filter blur-[0.5px]" />
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className={`min-h-screen h-screen overflow-hidden ${activeTheme.bgClass} ${activeTheme.textColor} flex flex-col relative transition-colors duration-500 font-sans select-none`}>
      
      {/* Drifting Clouds on Home Screen */}
      {status === 'home' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Cloud 1 */}
          <motion.div
            initial={{ x: '-20vw' }}
            animate={{ x: '110vw' }}
            transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
            className="absolute top-[8%] left-0 opacity-40"
          >
            <svg className="w-24 h-12 fill-white" viewBox="0 0 100 50">
              <path d="M 20 35 C 20 25, 35 15, 50 25 C 65 15, 80 25, 80 35 C 90 35, 95 40, 90 45 C 90 50, 10 50, 10 45 C 5 40, 10 35, 20 35 Z" />
            </svg>
          </motion.div>
          {/* Cloud 2 */}
          <motion.div
            initial={{ x: '110vw' }}
            animate={{ x: '-20vw' }}
            transition={{ repeat: Infinity, duration: 55, ease: 'linear' }}
            className="absolute top-[18%] left-0 opacity-30"
          >
            <svg className="w-32 h-16 fill-white" viewBox="0 0 100 50">
              <path d="M 20 35 C 20 25, 35 15, 50 25 C 65 15, 80 25, 80 35 C 90 35, 95 40, 90 45 C 90 50, 10 50, 10 45 C 5 40, 10 35, 20 35 Z" />
            </svg>
          </motion.div>
        </div>
      )}
      
      {/* Decorative top soft bar highlight */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-40" />

      {/* Upgraded Header Bar */}
      {status === 'playing' && (
        <header className="relative w-full py-2 px-4 shadow-sm z-30 flex-none">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
            
            {/* Left: Close back-to-menu button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { audio.playClick(); setStatus('home'); }}
                className="px-3 h-9 bg-neutral-800 hover:bg-neutral-750 text-white font-extrabold text-[10px] uppercase border-b-2 border-neutral-950 rounded-xl flex items-center gap-1.5 shadow active:translate-y-0.5 cursor-pointer transition"
                title="Return to Main Menu Screen"
              >
                <Home className="w-3 h-3 text-amber-400" />
                <span>HOME</span>
              </button>
            </div>

            {/* Middle: Chunky Level select dropdown option */}
            <div className="flex items-center gap-1 select-none">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-450 font-display">
                Lvl
              </span>
              
              <div className="relative">
                <select
                  value={currentLevel}
                  onChange={(e) => {
                    const targetLvl = parseInt(e.target.value, 10);
                    if (targetLvl > maxUnlockedLevel) {
                      audio.playInvalid();
                    } else {
                      audio.playClick();
                      handleStartGame(targetLvl);
                    }
                  }}
                  className="bg-neutral-950 border border-amber-400 text-white font-black text-xs px-2.5 py-1 rounded-lg text-center focus:outline-none focus:border-amber-500 cursor-pointer appearance-none pr-6 relative uppercase tracking-wider shadow"
                >
                  {Array.from({ length: Math.min(maxUnlockedLevel, 10000) }, (_, i) => i + 1).map((lvl) => (
                    <option key={lvl} value={lvl} className="bg-neutral-900 font-extrabold text-white text-xs">
                      {lvl} {lvl === currentLevel ? '★' : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-amber-450 text-[8px] font-black z-10">
                  ▼
                </div>
              </div>
            </div>

            {/* Right: Sound, Coins and Market button */}
            <div className="flex items-center gap-2">
              {/* Quick Market trigger */}
              <button
                onClick={() => { audio.playClick(); setMarketOrigin('game'); setMarketTab('vessels'); setShowMarketModal(true); }}
                className="w-9 h-9 bg-yellow-400 hover:bg-yellow-500 text-neutral-950 border-b-2 border-yellow-700 rounded-xl flex items-center justify-center cursor-pointer shadow active:translate-y-0.5 transition"
                title="Galactic Market Shop"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>

              {/* Coin wallet */}
              <div className="bg-neutral-950 px-2.5 h-9 border rounded-xl flex items-center gap-1 font-mono text-[10px] font-black text-amber-400 select-none">
                <span>🪙</span>
                <span>{coins}</span>
              </div>

              {/* Mute controller */}
              <button
                onClick={handleToggleSoundMute}
                className="w-9 h-9 bg-neutral-800 text-neutral-300 border-b-2 border-neutral-950 rounded-xl flex items-center justify-center cursor-pointer shadow active:translate-y-0.5"
                title={isSoundMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
              >
                {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-450" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

          </div>
        </header>
      )}

      {/* How To Play Drawer Overlay */}
      <AnimatePresence>
        {showHowToPlay && (
          <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-6 relative text-slate-100 shadow-2xl"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => { audio.playClick(); setShowHowToPlay(false); }}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-750 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="bg-amber-400 text-neutral-909 p-2 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold font-display">How to Play</h3>
              </div>

              <div className="space-y-3 text-xs text-neutral-300 leading-relaxed font-sans font-medium">
                <div className="p-3 bg-neutral-950/50 rounded-xl border border-neutral-850">
                  <p className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <span className="bg-neutral-800 text-white px-1.5 py-0.5 rounded text-[10px]">1</span>
                    Select a Source Tube
                  </p>
                  <p>Tap any tube containing colorful liquids. The selected tube raises up to confirm selection.</p>
                </div>

                <div className="p-3 bg-neutral-950/50 rounded-xl border border-neutral-850">
                  <p className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <span className="bg-neutral-800 text-white px-1.5 py-0.5 rounded text-[10px]">2</span>
                    Select a Target Tube
                  </p>
                  <p>Tap another tube. Liquid pours in if there is space remaining and the top colors match (or the target is empty!).</p>
                </div>

                <div className="p-3 bg-neutral-950/50 rounded-xl border border-neutral-850">
                  <p className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                    <span className="bg-neutral-800 text-white px-1.5 py-0.5 rounded text-[10px]">3</span>
                    Perfect Single Color Fills
                  </p>
                  <p>Each tube must eventually be fully completed with 4 stacked units of one uniform solid color, or be left completely empty!</p>
                </div>
              </div>

              <button
                onClick={() => { audio.playClick(); setShowHowToPlay(false); }}
                className="w-full mt-6 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black py-4 rounded-xl shadow-lg cursor-pointer text-sm"
              >
                GOT IT, LET'S PLAY!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Claim Reward Box Modal */}
      <AnimatePresence>
        {showClaimModal && (
          <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-lg z-[100005] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border-4 border-amber-400 rounded-3xl w-full max-w-sm p-6 text-center relative overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.25)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)] animate-slow-rotate -z-10" />

              <div className="absolute top-4 right-4">
                <button
                  onClick={() => { audio.playClick(); setShowClaimModal(false); }}
                  className="w-8 h-8 rounded-full bg-neutral-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 text-neutral-950 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg animate-bounce">
                🎉
              </div>

              <h2 className="text-xl font-black text-white font-display uppercase tracking-wide">
                Special Notification!
              </h2>

              <p className="my-3 text-[11px] text-neutral-300 bg-neutral-950/60 leading-relaxed font-mono border border-neutral-855 p-3 rounded-xl font-bold">
                {claimedReward}
              </p>

              <button
                onClick={() => { audio.playClick(); setShowClaimModal(false); }}
                className="w-full bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black py-3 rounded-xl shadow-md uppercase tracking-wider text-xs border-b-4 border-amber-600 transition-transform active:scale-98"
              >
                CONTINUE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🎡 FIRST TIME WELCOME LUCKY SPIN MODAL */}
      <AnimatePresence>
        {(!hasDoneInitialSpin || showSpinModalManual) && !isSplashActive && (
          <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-[3px] z-[9999] flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border-4 border-amber-400 rounded-[32px] w-full max-w-sm p-5 relative shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center my-auto"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-yellow-400" />
              
              {/* Optional close button if opened voluntarily from home page */}
              {showSpinModalManual && (
                <button
                  onClick={() => {
                    audio.playClick();
                    setShowSpinModalManual(false);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer font-bold border border-neutral-700 z-[1000]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Header Details */}
              <div className="flex flex-col items-center gap-1.5 mb-4 mt-2">
                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-400/20 px-3.5 py-1 rounded-full text-yellow-400 text-[10px] font-black font-mono tracking-widest uppercase">
                  <Gift className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                  <span>{hasDoneInitialSpin ? "LUCKY BONUS DRAW" : "WELCOME PRESENT"}</span>
                </div>
                <h2 className="text-white text-2xl font-black font-display tracking-tight leading-tight">
                  LUCKY SPIN WHEEL
                </h2>
                <p className="text-slate-400 text-[10px] font-mono leading-relaxed max-w-[280px]">
                  {hasDoneInitialSpin 
                    ? "Spin the lucky wheel again by watching a sponsored ad! Up to 10,000 Coins are up for grabs! 💎" 
                    : "Spin the lucky wheel once to unlock your starting coin balance! Up to 10,000 Coins are up for grabs! 💎"
                  }
                </p>
              </div>

              {/* Spin Wheel Container */}
              <div className="relative w-64 h-64 my-2 flex items-center justify-center">
                {/* Arrow Pointer */}
                <div className="absolute top-0 w-8 h-8 z-30 flex items-center justify-center -translate-y-1 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 relative drop-shadow">
                    <div className="absolute w-2 h-2 rounded-full bg-white -top-4 -left-1 shadow-inner" />
                  </div>
                </div>

                {/* Outer Shiny Circle Rim */}
                <div className="absolute inset-0 rounded-full border-[8px] border-amber-500 bg-neutral-950 shadow-2xl flex items-center justify-center overflow-hidden">
                  
                  {/* Rotating Inner Wheel Plate */}
                  <motion.div
                    className="w-full h-full relative"
                    style={{
                      transformOrigin: '50% 50%',
                    }}
                    animate={{
                      rotate: spinAngle,
                    }}
                    transition={
                      isSpinning
                        ? { duration: 4.5, ease: [0.15, 0.85, 0.1, 1.002] }
                        : { duration: 0 }
                    }
                  >
                    <svg viewBox="0 0 200 200" className="w-full h-full relative overflow-visible">
                      <g transform="translate(100, 100)">
                        {/* Render 8 Wedge slices */}
                        {SPIN_WHEEL_SECTORS.map((sector, idx) => {
                          const degreesPerSector = 360 / 8;
                          const startAngle = idx * degreesPerSector;
                          const endAngle = (idx + 1) * degreesPerSector;
                          
                          // Helper values to draw beautiful SVG arc slices
                          const radStart = (startAngle - 90) * Math.PI / 180;
                          const radEnd = (endAngle - 90) * Math.PI / 180;
                          const R = 90;
                          
                          const x1 = R * Math.cos(radStart);
                          const y1 = R * Math.sin(radStart);
                          const x2 = R * Math.cos(radEnd);
                          const y2 = R * Math.sin(radEnd);
                          
                          const pathData = `M 0 0 L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;
                          
                          // Midpoint calculations for placement of sector texts
                          const midAngle = startAngle + degreesPerSector / 2;
                          const radMid = (midAngle - 90) * Math.PI / 180;
                          const textR = 56;
                          const textX = textR * Math.cos(radMid);
                          const textY = textR * Math.sin(radMid);

                          return (
                            <g key={idx} className="relative select-none">
                              {/* Sector Slice Area */}
                              <path
                                d={pathData}
                                fill={sector.color}
                                stroke="#171717"
                                strokeWidth="2.5"
                              />
                              {/* Glowing Inner Details */}
                              <circle cx={x1} cy={y1} r="2.5" fill="#ffffff" opacity="0.6" />
                              
                              {/* Sector label text aligned cleanly towards center */}
                              <text
                                x={textX}
                                y={textY}
                                transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className={`font-mono text-[9px] font-black tracking-tighter ${
                                  sector.value === 10000 ? 'fill-yellow-300 font-extrabold stroke-neutral-900 stroke-[0.5px]' : 'fill-white'
                                }`}
                              >
                                {sector.value >= 1000 ? `${sector.value / 1000}k` : sector.value}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                  </motion.div>
                </div>

                {/* Interactive SPIN button directly in the center of the wheel as requested! */}
                <button
                  disabled={isSpinning}
                  onClick={handleStartSpin}
                  className="absolute w-14 h-14 bg-gradient-to-b from-amber-400 to-amber-600 active:scale-95 disabled:scale-100 text-neutral-950 hover:text-black border-4 border-white rounded-full z-[100] flex flex-col items-center justify-center shadow-[inset_0_2px_0_rgba(255,255,255,0.4),0_6px_12px_rgba(0,0,0,0.45)] cursor-pointer transition-all font-display font-black text-[11px] select-none"
                  style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.2)' }}
                  title={isSpinning ? "Spinning..." : "Tap to Spin!"}
                >
                  <span className="leading-none tracking-tight">SPIN</span>
                  <span className="text-[7px] font-mono opacity-80 mt-0.5 leading-none">{isSpinning ? "🌀" : "TAP"}</span>
                </button>
              </div>

              {/* Action Buttons Panel */}
              <div className="w-full mt-3 flex flex-col gap-2.5 z-40 relative">
                {/* 1. Spin trigger */}
                {spinResult === null && (
                  <button
                    onClick={handleStartSpin}
                    disabled={isSpinning}
                    className={`w-full py-3 px-4 flex items-center justify-center gap-2 font-display text-xs font-black uppercase text-neutral-950 border-b-4 border-amber-700 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 rounded-2xl cursor-pointer shadow active:translate-y-0.5 transition-all ${
                      isSpinning ? 'opacity-50 cursor-not-allowed filter grayscale' : 'hover:brightness-110'
                    }`}
                  >
                    <RotateCcw className={`w-4 h-4 stroke-[3] ${isSpinning ? 'animate-spin' : ''}`} />
                    <span>{isSpinning ? 'SPINNING...' : 'TAP TO SPIN!'}</span>
                  </button>
                )}

                {/* 2. Interactive simulated Ad loading bar overlay */}
                {spinAdLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full bg-neutral-950 border border-neutral-800 p-4 rounded-2xl flex flex-col items-center gap-2"
                  >
                    <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-amber-450 animate-pulse">
                      <span>📺 Sponsored reward ad loading...</span>
                    </div>
                    {/* Fake ad container progress bar */}
                    <div className="w-full h-3 bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden relative">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
                        style={{ width: `${spinAdProgress}%` }}
                      />
                    </div>
                    <span className="text-[8px] text-slate-500 font-mono">
                      Please wait to claim your prize package ({spinAdProgress}%)
                    </span>
                  </motion.div>
                )}

                {/* 3. Reward Display & Claim Trigger */}
                {showSpinClaimedSuccess && spinResult !== null && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full bg-neutral-950 border-2 border-amber-500 p-4 rounded-3xl flex flex-col items-center gap-3 relative overflow-hidden"
                  >
                    <div className="absolute -right-6 -top-6 w-12 h-12 bg-amber-400/10 rounded-full blur-sm" />
                    <div className="w-11 h-11 bg-amber-400/15 border border-amber-400/40 rounded-full flex items-center justify-center text-xl text-amber-400">
                      🎁
                    </div>
                    <div>
                      <h4 className="text-amber-450 font-bold text-xs uppercase tracking-wider font-mono">PRIZE LANDED!</h4>
                      <p className="text-white font-black text-xl leading-none mt-1 font-display">
                        🪙 +{spinResult.toLocaleString()} COINS
                      </p>
                      <p className="text-neutral-400 text-[9px] font-mono mt-1 leading-relaxed">
                        Claim your prize instantly to start customizing empty tubes!
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        audio.playClick();
                        const claimAction = () => {
                          audio.playCelebration();
                          const wonAmount = spinResult || 100;
                          if (!hasDoneInitialSpin) {
                            // On first spin, keep the starting 1,000 progress coins and ADD this awesome spin wonAmount!
                            const finalCoins = coins + wonAmount;
                            setCoins(finalCoins);
                            localStorage.setItem('water_sort_coins', String(finalCoins));
                            localStorage.setItem('water_sort_has_done_spin', 'true');
                            setHasDoneInitialSpin(true);
                            setClaimedReward(`🎉 WELCOME PACKAGE SECURED! Received 🪙 ${wonAmount.toLocaleString()} Coins as a starter bundle!`);
                          } else {
                            const nextCoins = coins + wonAmount;
                            setCoins(nextCoins);
                            localStorage.setItem('water_sort_coins', String(nextCoins));
                            setClaimedReward(`🎉 REWARD SECURED! Received 🪙 ${wonAmount.toLocaleString()} Coins from the Lucky Spin!`);
                          }
                          setShowClaimModal(true);
                          setShowSpinModalManual(false);
                        };

                        if (!hasDoneInitialSpin) {
                          claimAction();
                        } else {
                          showRewarded(claimAction);
                        }
                      }}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 font-display text-xs font-black uppercase text-center rounded-xl cursor-pointer border-b-2 border-amber-700 shadow active:translate-y-0.5 transition"
                    >
                      🎁 CLAIM REWARD
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🛒 GALACTIC CUSTOMIZATION MARKET MODAL CONTAINER */}
      <AnimatePresence>
        {showMarketModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 border-amber-400 rounded-3xl w-full max-w-xl h-[85vh] flex flex-col relative shadow-2xl overflow-hidden text-slate-800"
              id="galaxy-market-container"
            >
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-400 text-neutral-950 p-1.5 rounded-xl text-lg font-black font-mono">🎰</div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 font-display leading-none">GALACTIC MARKET</h3>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider font-bold">Customize Shapes & border colors (10,000 Coins Each!)</p>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-400/20 text-amber-600 px-3.5 py-1.5 rounded-2xl flex items-center gap-1 font-black font-mono text-xs shadow-inner">
                  <span>🪙</span>
                  <span>{coins}</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-100 font-mono text-[9px] font-black border-b border-slate-200 flex-none overflow-x-auto">
                <button
                  onClick={() => { audio.playClick(); setMarketTab('vessels'); }}
                  className={`flex-1 min-w-[70px] py-3 text-center border-b-2 transition-all cursor-pointer ${
                    marketTab === 'vessels' ? 'border-amber-400 text-slate-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-850'
                  }`}
                >
                  🧪 SHAPES
                </button>
                <button
                  onClick={() => { audio.playClick(); setMarketTab('skins'); }}
                  className={`flex-1 min-w-[70px] py-3 text-center border-b-2 transition-all cursor-pointer ${
                    marketTab === 'skins' ? 'border-amber-400 text-slate-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-850'
                  }`}
                >
                  🌌 SKINS
                </button>
                <button
                  onClick={() => { audio.playClick(); setMarketTab('themes'); }}
                  className={`flex-1 min-w-[70px] py-3 text-center border-b-2 transition-all cursor-pointer ${
                    marketTab === 'themes' ? 'border-amber-400 text-slate-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-850'
                  }`}
                >
                  🎨 THEMES
                </button>
                <button
                  onClick={() => { audio.playClick(); setMarketTab('coins'); }}
                  className={`flex-1 min-w-[70px] py-3 text-center border-b-2 transition-all cursor-pointer ${
                    marketTab === 'coins' ? 'border-amber-400 text-slate-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-850'
                  }`}
                >
                  🪙 COINS
                </button>
              </div>

              {/* Scrollable grid content */}
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin bg-white">
                {marketTab === 'vessels' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                    {MARKET_VESSELS.map((v) => {
                      const isUnlocked = unlockedVessels.includes(v.id);
                      const isEquipped = activeVesselStyle === v.id;
                      return (
                        <div
                          key={v.id}
                          className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                            isEquipped 
                              ? 'border-amber-400 bg-amber-500/5 shadow' 
                              : isUnlocked 
                              ? 'border-slate-100 bg-slate-50/50' 
                              : 'border-slate-200/60 bg-slate-50/30 hover:border-slate-350'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl select-none">{v.icon}</span>
                            <div>
                              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">{v.name}</h4>
                              <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{v.desc}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleEquipVessel(v.id, v.cost, v.name)}
                            className={`px-3 py-1.5 rounded-xl font-black text-[9px] uppercase border font-mono transition-all cursor-pointer ${
                              isEquipped
                                ? 'bg-amber-400 text-neutral-950 border-amber-300'
                                : isUnlocked
                                ? 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                                : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500 shadow-xs'
                            }`}
                          >
                            {isEquipped ? 'ACTIVE' : isUnlocked ? 'EQUIP' : v.cost === 0 ? 'FREE' : `🪙 ${v.cost >= 1000 ? `${v.cost / 1000}K` : v.cost}`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : marketTab === 'themes' ? (
                  <div className="space-y-3 pb-4 text-slate-800">
                    <div className="bg-amber-500/5 border border-amber-400/20 rounded-2xl p-3 mb-2 flex items-center gap-2 select-none">
                      <span className="text-sm">🎨</span>
                      <span className="text-[10px] font-black font-mono tracking-wide text-amber-700 uppercase leading-normal">
                        Unlock premium galaxy backgrounds (10,000 Coins Each)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {THEMES.map((theme) => {
                        const isActive = theme.id === activeTheme.id;
                        const isUnlocked = unlockedThemes.includes(theme.id);
                        return (
                          <div
                            key={theme.id}
                            className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                              isActive 
                                ? 'border-amber-400 bg-amber-500/5 shadow' 
                                : isUnlocked 
                                ? 'border-slate-100 bg-slate-50/50' 
                                : 'border-slate-200/60 bg-slate-50/30 hover:border-slate-350'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full shadow-inner bg-gradient-to-tr flex-none ${
                                theme.id === 'summer' ? 'from-amber-400 to-amber-100' :
                                theme.id === 'christmas' ? 'from-amber-900 to-amber-100' :
                                theme.id === 'pastel' ? 'from-sky-300 to-white' :
                                theme.id === 'stars' ? 'from-indigo-900 to-indigo-100' :
                                theme.id === 'pink' ? 'from-pink-300 to-orange-200' :
                                theme.id === 'volcanic' ? 'from-orange-600 to-neutral-900' :
                                theme.id === 'deepsea' ? 'from-cyan-500 to-slate-900' :
                                theme.id === 'aurora' ? 'from-emerald-400 to-indigo-900' :
                                theme.id === 'cyberpunk' ? 'from-pink-500 to-purple-900' :
                                'from-teal-400 to-teal-950'
                              }`} />
                              <div>
                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">{theme.name.split(' (')[0]}</h4>
                                <p className="text-[8px] text-slate-400 font-mono font-bold mt-0.5 uppercase tracking-wide leading-none">
                                  {theme.tag}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleSelectTheme(theme)}
                              className={`px-3 py-1.5 rounded-xl font-black text-[9px] uppercase border font-mono transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-sm'
                                  : isUnlocked
                                  ? 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                                  : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500 shadow-xs'
                              }`}
                            >
                              {isActive ? 'ACTIVE' : isUnlocked ? 'EQUIP' : '🪙 10K'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : marketTab === 'coins' ? (
                  <div className="space-y-6 pb-4 text-slate-800">
                    <div>
                      <div className="bg-amber-500/5 border border-amber-400/20 rounded-2xl p-3 mb-3 flex items-center gap-2 select-none">
                        <span className="text-sm">🪙</span>
                        <span className="text-[10px] font-black font-mono tracking-wide text-amber-700 uppercase leading-normal">
                          Buy Coins (Instant Top-up Packages)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { coins: 100, price: "₹9 / $0.12 USD", text: "Starter Pack", icon: "🪙", desc: "Instantly add 100 extra golden play coins." },
                          { coins: 1005, price: "₹29 / $0.35 USD", text: "Value Stack", icon: "🪙🪙", desc: "Instantly add 1,000 premium golden coins." },
                          { coins: 10000, price: "₹99 / $1.19 USD", text: "Fortune Vault", icon: "🏺🪙", desc: "Instantly add 10,000 large coin assets." },
                          { coins: 100000, price: "₹149 / $1.79 USD", text: "Cosmic Fortune", icon: "🪐✨", desc: "Instantly add a massive 100,000 coins." },
                          { coins: 1000000, price: "₹499 / $5.99 USD", text: "Empire Treasury", icon: "👑✨", desc: "Instantly add a luxurious 1,000,000 coins.", isRecommended: true },
                          { coins: 10000000, price: "₹999 / $11.99 USD", text: "Galactic Bankroll", icon: "🌌💎", desc: "Unleash infinite power with 10,000,000 coins." }
                        ].map((pkg, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 relative ${
                              pkg.isRecommended 
                                ? 'bg-gradient-to-r from-amber-500/5 to-yellow-500/5 border-amber-300 shadow-sm hover:border-amber-450' 
                                : 'border-slate-200 bg-slate-50/50 hover:border-slate-350'
                            }`}
                          >
                            {pkg.isRecommended && (
                              <div className="absolute -top-2 right-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-mono font-black text-[7.5px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                                RECOMMENDED
                              </div>
                            )}
                            <div className="flex items-center gap-3">
                              <span className="text-2xl select-none filter drop-shadow-md">{pkg.icon}</span>
                              <div>
                                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{pkg.text}</h4>
                                <p className="text-[8.5px] text-slate-500 leading-normal mt-0.5">{pkg.desc}</p>
                                <div className="inline-block mt-1 bg-amber-100 text-amber-800 font-mono font-bold text-[8px] px-1.5 py-0.5 rounded-md leading-none uppercase">
                                  +{pkg.coins === 1005 ? "1,000" : pkg.coins.toLocaleString()} Coins
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                audio.playClick();
                                setCheckoutItem({
                                  title: `${pkg.text} (${pkg.coins === 1005 ? "1,000" : pkg.coins.toLocaleString()} Coins)`,
                                  price: pkg.price,
                                  icon: pkg.icon || "🪙",
                                  desc: pkg.desc || "Instant Coin Top-up Package"
                                });
                                setCheckoutError(null);
                              }}
                              className="px-2 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-black text-[8.5px] text-white rounded-xl border border-amber-400 cursor-pointer shadow-md active:scale-95 transition-all flex-none min-w-[72px] text-center"
                            >
                              {pkg.price.replace(" USD", "")}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="bg-red-500/5 border border-red-400/20 rounded-2xl p-3 mb-3 flex items-center gap-2 select-none">
                        <span className="text-sm">🚫</span>
                        <span className="text-[10px] font-black font-mono tracking-wide text-rose-700 uppercase leading-normal">
                          No Ads Subscription packages
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { duration: "2 Month No Ads", price: "₹99 / $1.19 USD", text: "Plus Plan", icon: "🚫", desc: "Enjoy completely ad-free gaming for 2 continuous months." },
                          { duration: "4 Month No Ads", price: "₹149", text: "Standard Plan", icon: "🚫", desc: "Solid 4 months of ads-free fluid sorting convenience." },
                          { duration: "6 Month No Ads", price: "₹199 / $2.39 USD", text: "Pro Plan", icon: "🚫", desc: "Epic 6 months of absolute sorting comfort with zero ads." },
                          { duration: "1 Year No Ads", price: "₹249 / $2.99 USD", text: "Elite Plan", icon: "🛡️", desc: "Unleash maximum focus with 1 full year ad-free premium access." }, isRecommended: true },
                          { duration: "Lifetime No Ads", price: "₹2999 / $35.99 USD", text: "Ultimate Pass", icon: "👑", desc: "Remove all advertisements forever from your account." }
                        ].map((pkg, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-slate-350 transition-all flex items-center justify-between gap-2.5"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl select-none filter drop-shadow-md">{pkg.icon}</span>
                              <div>
                                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{pkg.duration}</h4>
                                <p className="text-[8.5px] text-slate-500 leading-normal mt-0.5">{pkg.desc}</p>
                                <div className="inline-block mt-1 bg-rose-100 text-rose-800 font-mono font-bold text-[8px] px-1.5 py-0.5 rounded-md leading-none uppercase">
                                  {pkg.text}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                audio.playCelebration();
                                setClaimedReward(`🎉 NO ADS SUBSCRIPTION ACTIVE!\n\nYou have successfully unlocked the "${pkg.duration}" for ${pkg.price.replace(" USD", "")}! Enjoy seamless, ad-free play sessions!`);
                                setShowClaimModal(true);
                              }}
                              className="px-2 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-650 hover:to-rose-650 font-black text-[8.5px] text-white rounded-xl border border-red-400 cursor-pointer shadow-md active:scale-95 transition-all flex-none min-w-[72px] text-center"
                            >
                              {pkg.price.replace(" USD", "")}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pb-4">
                    {/* ⚙️ Skin Systems Controller Gate */}
                    <div className="bg-slate-900 text-white rounded-2xl p-3.5 flex items-center justify-between select-none shadow border border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🌌</span>
                        <div className="text-left">
                          <p className="text-[10px] font-black tracking-wider text-cyan-450 uppercase leading-none">BOTTLE AURA SKINS STATUS</p>
                          <p className="text-[8px] text-slate-400 font-mono mt-1 uppercase leading-none">Toggle whether outlines glow on/off</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8.5px] font-mono font-bold uppercase text-slate-350">
                          {skinEnabled ? "SHADERS ON" : "SHADERS OFF"}
                        </span>
                        <button
                          onClick={() => {
                            audio.playClick();
                            const next = !skinEnabled;
                            setSkinEnabled(next);
                            localStorage.setItem('water_sort_skin_enabled', String(next));
                            setClaimedReward(next ? "Glowing skin borders successfully activated!" : "Glowing skin borders turned off. Standard dark borders restored.");
                            setShowClaimModal(true);
                          }}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 relative focus:outline-none cursor-pointer flex items-center ${
                            skinEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              skinEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {MARKET_SKINS.slice(skinPage * 10, (skinPage + 1) * 10).map((s) => {
                        const isUnlocked = unlockedSkins.includes(s.id);
                        const isEquipped = activeSkinId === s.id;
                        return (
                          <div
                            key={s.id}
                            className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                              isEquipped 
                                ? 'border-cyan-400 bg-cyan-50/10 shadow' 
                                : isUnlocked 
                                ? 'border-slate-100 bg-slate-50/50' 
                                : 'border-slate-200/60 bg-slate-50/30 hover:border-slate-350'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Glowing Mini Bottle Preview of the Skin */}
                              <div className="w-10 h-16 bg-slate-950/90 rounded-xl p-1 shadow-md border-2 border-slate-800 flex items-center justify-center relative flex-none overflow-hidden">
                                <svg className="w-8 h-14 overflow-visible" viewBox="0 0 100 300">
                                  {/* Glass outline with the active glowing skin color */}
                                  <path
                                    d={
                                      activeVesselStyle === 'flask' ? "M 36,15 L 64,15 L 64,80 L 88,255 C 91,275 80,290 50,290 C 20,290 9,275 12,255 L 36,80 Z" :
                                      activeVesselStyle === 'beaker' ? "M 32,15 L 68,15 L 68,60 L 82,60 L 82,270 C 82,285 70,290 50,290 C 30,290 18,285 18,270 L 18,60 L 32,60 Z" :
                                      activeVesselStyle === 'hex' ? "M 35,15 L 65,15 L 65,55 L 82,90 L 82,240 L 65,290 L 35,290 L 18,240 L 18,90 L 35,55 Z" :
                                      activeVesselStyle === 'potion' ? "M 36,15 L 64,15 L 64,85 C 84,100 88,135 88,180 C 88,240 71,290 50,290 C 29,290 12,240 12,180 C 12,135 16,100 36,85 Z" :
                                      activeVesselStyle === 'square' ? "M 35,15 L 65,15 L 65,70 L 82,75 L 82,275 C 82,286 76,290 50,290 C 24,290 18,286 18,275 L 18,75 L 35,70 Z" :
                                      activeVesselStyle === 'decanter' ? "M 32,15 Q 50,28 68,15 L 62,80 C 82,95 86,130 86,180 Q 86,280 50,290 Q 14,280 14,180 C 14,130 18,95 38,80 Z" :
                                      activeVesselStyle === 'star' ? "M 34,15 L 66,15 L 66,70 C 85,90 90,130 84,180 L 84,260 C 84,280 65,290 50,290 C 35,290 16,280 16,260 L 16,180 C 10,130 15,90 34,70 Z" :
                                      activeVesselStyle === 'goblet' ? "M 22,15 L 78,15 L 82,110 L 64,170 Q 64,230 59,260 L 73,260 L 73,288 L 27,288 L 27,260 L 41,260 Q 36,230 36,170 L 18,110 Z" :
                                      activeVesselStyle === 'testtube' ? "M 32,15 L 68,15 L 68,245 C 68,274 58,290 50,290 C 42,290 32,274 32,245 Z" :
                                      "M 32,15 L 68,15 L 68,70 C 68,90 85,95 85,120 L 85,265 C 85,285 70,290 50,290 C 30,290 15,285 15,265 L 15,120 C 15,95 32,90 32,70 Z"
                                    }
                                    fill="rgba(30, 41, 59, 0.7)"
                                    stroke={s.color}
                                    strokeWidth="16"
                                    style={{ filter: `drop-shadow(0 0 6px ${s.color})` }}
                                  />
                                  {/* Glass highlight glare */}
                                  <path
                                    d="M 32,60 Q 38,65 38,120"
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth="10"
                                    opacity="0.3"
                                    strokeLinecap="round"
                                  />
                                  {/* Colorful segment layers filled with gradient inside to preview liquid content */}
                                  <path
                                    d={
                                      activeVesselStyle === 'flask' ? "M 18,205 L 82,205 L 88,255 C 91,275 80,290 50,290 C 20,290 9,275 12,255 Z" :
                                      activeVesselStyle === 'beaker' ? "M 18,185 L 82,185 L 82,270 C 82,285 70,290 50,290 C 30,290 18,285 18,270 Z" :
                                      activeVesselStyle === 'hex' ? "M 18,180 L 82,180 L 82,240 L 65,290 L 35,290 L 18,240 Z" :
                                      activeVesselStyle === 'potion' ? "M 20,180 L 80,180 C 80,230 71,290 50,290 C 29,290 20,230 20,180 Z" :
                                      activeVesselStyle === 'square' ? "M 18,185 L 82,185 L 82,275 C 82,286 76,290 50,290 C 24,290 18,286 18,275 Z" :
                                      activeVesselStyle === 'decanter' ? "M 25,180 L 75,180 C 75,250 50,290 50,290 C 50,290 25,250 25,180 Z" :
                                      activeVesselStyle === 'star' ? "M 21,180 L 79,180 L 79,260 C 79,280 65,290 50,290 C 35,290 21,280 21,260 Z" :
                                      activeVesselStyle === 'goblet' ? "M 41,200 L 59,200 L 59,260 L 73,260 L 73,288 L 27,288 L 27,260 L 41,260 Z" :
                                      activeVesselStyle === 'testtube' ? "M 32,180 L 68,180 L 68,245 C 68,274 58,290 50,290 C 42,290 32,274 32,245 Z" :
                                      "M 15,180 L 85,180 L 85,265 C 85,285 70,290 50,290 C 30,290 15,285 15,265 Z"
                                    }
                                    fill={s.color}
                                    opacity="0.85"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-[10px] font-black text-slate-800 uppercase leading-none">
                                  {s.name.includes('#') ? s.name.split(' #')[0] : s.name}
                                </h4>
                                <p className="text-[8px] text-slate-400 font-mono font-bold mt-1 uppercase tracking-widest leading-none">
                                  {s.isPremium ? "★ PREMIUM EXCLUSIVE" : `Code #${s.id.split('_')[1]}`}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 flex-none">
                              <button
                                onClick={() => handleEquipSkin(s.id, s.color, s.cost || 0, s.name)}
                                className={`px-2.5 py-1.5 rounded-xl font-black text-[9px] uppercase border font-mono transition-all cursor-pointer ${
                                  isEquipped
                                    ? 'bg-cyan-400 text-neutral-950 border-cyan-300'
                                    : isUnlocked
                                    ? 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                                    : s.isPremium
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-amber-400 shadow-md'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500'
                                }`}
                              >
                                {isEquipped 
                                  ? 'ACTIVE' 
                                  : isUnlocked 
                                  ? 'EQUIP' 
                                  : s.isPremium 
                                  ? `${s.priceInRupees} / ${s.priceInDollars.split(' ')[0]}` 
                                  : `🪙 ${s.cost}`
                                }
                              </button>

                              {!isUnlocked && !s.isPremium && s.cost === 10000 && (
                                <button
                                  onClick={() => handleWatchAdForSkinInstant(s.id, s.name, s.color)}
                                  className="px-2 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-mono font-black rounded-xl border border-emerald-400 hover:from-emerald-650 hover:to-teal-650 shadow-sm cursor-pointer transition select-none flex items-center gap-1"
                                >
                                  <span>📺 FREE</span>
                                  <span className="bg-emerald-950/30 text-[8px] px-1.5 py-0.5 rounded leading-none font-black text-emerald-100">
                                    [{skinAdProgress[s.id] || 0}/2]
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Skin pages pagination */}
                    <div className="flex items-center justify-between pt-2.5 font-mono text-[9px] font-black uppercase text-slate-500">
                      <button
                        disabled={skinPage === 0}
                        onClick={() => { audio.playClick(); setSkinPage(p => Math.max(0, p - 1)); }}
                        className={`px-3 py-1.5 rounded-xl border ${skinPage === 0 ? 'text-slate-300 cursor-not-allowed border-slate-100 bg-slate-50' : 'bg-slate-100 text-slate-700 cursor-pointer hover:bg-slate-200 border-slate-200'}`}
                      >
                        ◄ PREV
                      </button>
                      <span>PAGE {skinPage + 1} / 11 ({skinPage*10 + 1}-{Math.min(110, (skinPage+1)*10)} / 110)</span>
                      <button
                        disabled={skinPage === 10}
                        onClick={() => { audio.playClick(); setSkinPage(p => Math.min(10, p + 1)); }}
                        className={`px-3 py-1.5 rounded-xl border ${skinPage === 10 ? 'text-slate-300 cursor-not-allowed border-slate-100 bg-slate-50' : 'bg-slate-100 text-slate-700 cursor-pointer hover:bg-slate-200 border-slate-200'}`}
                      >
                        NEXT ►
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => {
                          audio.playClick();
                          setActiveSkinId('skin_none');
                          setActiveSkinGlowColor(undefined);
                          localStorage.setItem('water_sort_active_skin_id', 'skin_none');
                          localStorage.removeItem('water_sort_active_skin_glow');
                          setClaimedReward("Classic border styles restored successfully!");
                          setShowClaimModal(true);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-250/60 text-slate-700 rounded-xl text-[9px] font-mono font-black uppercase cursor-pointer"
                      >
                        Reset to Standard Black Border
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end select-none">
                <button
                  onClick={() => { audio.playClick(); setShowMarketModal(false); }}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black rounded-xl text-xs uppercase cursor-pointer border-b-4 border-amber-600 active:translate-y-0.5"
                >
                  CLOSE SHOP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📺 INTERACTIVE SIMULATED AD SPONSOR PLAYER FOR SKINS */}
      <AnimatePresence>
        {watchingAdForSkin && (
          <div className="fixed inset-0 bg-neutral-950/95 z-[100] flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_75%)] animate-pulse pointer-events-none" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border-2 border-neutral-800 rounded-3xl p-6 max-w-sm w-full relative shadow-2xl flex flex-col items-center gap-5 text-center overflow-hidden"
            >
              {/* Header badge */}
              <div className="w-full flex items-center justify-between border-b border-neutral-800 pb-3 select-none">
                <span className="bg-emerald-500 text-neutral-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">
                  SPONSORED SPOT
                </span>
                <span className="text-[9px] text-neutral-400 font-mono">
                  REWARD LOCKED
                </span>
              </div>

              {/* Skin Preview inside Ad */}
              <div className="flex flex-col items-center gap-3 py-3 w-full">
                <div className="relative w-16 h-24 bg-slate-950 rounded-2xl flex items-center justify-center border-2 border-slate-800 p-1.5 shadow-[0_0_20px_rgba(30,41,59,0.5)] overflow-hidden">
                  <div 
                    className="absolute inset-[4px] opacity-45 blur-md rounded-xl"
                    style={{ backgroundColor: watchingAdForSkin.color }}
                  />
                  
                  {/* Glowing bottle inside the AD */}
                  <svg className="w-10 h-18 overflow-visible z-10" viewBox="0 0 100 300">
                    <path
                      d={
                        activeVesselStyle === 'flask' ? "M 36,15 L 64,15 L 64,80 L 88,255 C 91,275 80,290 50,290 C 20,290 9,275 12,255 L 36,80 Z" :
                        activeVesselStyle === 'beaker' ? "M 32,15 L 68,15 L 68,60 L 82,60 L 82,270 C 82,285 70,290 50,290 C 30,290 18,285 18,270 L 18,60 L 32,60 Z" :
                        activeVesselStyle === 'hex' ? "M 35,15 L 65,15 L 65,55 L 82,90 L 82,240 L 65,290 L 35,290 L 18,240 L 18,90 L 35,55 Z" :
                        activeVesselStyle === 'potion' ? "M 36,15 L 64,15 L 64,85 C 84,100 88,135 88,180 C 88,240 71,290 50,290 C 29,290 12,240 12,180 C 12,135 16,100 36,85 Z" :
                        activeVesselStyle === 'square' ? "M 35,15 L 65,15 L 65,70 L 82,75 L 82,275 C 82,286 76,290 50,290 C 24,290 18,286 18,275 L 18,75 L 35,70 Z" :
                        activeVesselStyle === 'decanter' ? "M 32,15 Q 50,28 68,15 L 62,80 C 82,95 86,130 86,180 Q 86,280 50,290 Q 14,280 14,180 C 14,130 18,95 38,80 Z" :
                        activeVesselStyle === 'star' ? "M 34,15 L 66,15 L 66,70 C 85,90 90,130 84,180 L 84,260 C 84,280 65,290 50,290 C 35,290 16,280 16,260 L 16,180 C 10,130 15,90 34,70 Z" :
                        activeVesselStyle === 'goblet' ? "M 22,15 L 78,15 L 82,110 L 64,170 Q 64,230 59,260 L 73,260 L 73,288 L 27,288 L 27,260 L 41,260 Q 36,230 36,170 L 18,110 Z" :
                        activeVesselStyle === 'testtube' ? "M 32,15 L 68,15 L 68,245 C 68,274 58,290 50,290 C 42,290 32,274 32,245 Z" :
                        "M 32,15 L 68,15 L 68,70 C 68,90 85,95 85,120 L 85,265 C 85,285 70,290 50,290 C 30,290 15,285 15,265 L 15,120 C 15,95 32,90 32,70 Z"
                      }
                      fill="none"
                      stroke={watchingAdForSkin.color}
                      strokeWidth="18"
                      style={{ filter: `drop-shadow(0 0 12px ${watchingAdForSkin.color})` }}
                    />
                    <path
                      d={
                        activeVesselStyle === 'flask' ? "M 18,205 L 82,205 L 88,255 C 91,275 80,290 50,290 C 20,290 9,275 12,255 Z" :
                        activeVesselStyle === 'beaker' ? "M 18,185 L 82,185 L 82,270 C 82,285 70,290 50,290 C 30,290 18,285 18,270 Z" :
                        activeVesselStyle === 'hex' ? "M 18,180 L 82,180 L 82,240 L 65,290 L 35,290 L 18,240 Z" :
                        activeVesselStyle === 'potion' ? "M 20,180 L 80,180 C 80,230 71,290 50,290 C 29,290 20,230 20,180 Z" :
                        activeVesselStyle === 'square' ? "M 18,185 L 82,185 L 82,275 C 82,286 76,290 50,290 C 24,290 18,286 18,275 Z" :
                        activeVesselStyle === 'decanter' ? "M 25,180 L 75,180 C 75,250 50,290 50,290 C 50,290 25,250 25,180 Z" :
                        activeVesselStyle === 'star' ? "M 21,180 L 79,180 L 79,260 C 79,280 65,290 50,290 C 35,290 21,280 21,260 Z" :
                        activeVesselStyle === 'goblet' ? "M 41,200 L 59,200 L 59,260 L 73,260 L 73,288 L 27,288 L 27,260 L 41,260 Z" :
                        activeVesselStyle === 'testtube' ? "M 32,180 L 68,180 L 68,245 C 68,274 58,290 50,290 C 42,290 32,274 32,245 Z" :
                        "M 15,180 L 85,180 L 85,265 C 85,285 70,290 50,290 C 30,290 15,285 15,265 Z"
                      }
                      fill={watchingAdForSkin.color}
                      opacity="0.8"
                    />
                  </svg>
                </div>

                <div className="space-y-1 select-none">
                  <h4 className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono">
                    CLAIMING PREMIUM OUTLINE
                  </h4>
                  <h3 className="text-white text-base font-black uppercase font-display tracking-tight leading-none animate-pulse">
                    {watchingAdForSkin.name}
                  </h3>
                  <p className="text-neutral-400 text-[10px] max-w-[280px] leading-relaxed mx-auto pt-1 font-sans">
                    Please enjoy this interactive custom glow showcase. Your color skin is preparing for immediate sorting deployment!
                  </p>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full space-y-2 select-none">
                <div className="w-full bg-slate-950 border border-neutral-800 rounded-full h-3 overflow-hidden p-0.5">
                  <motion.div 
                    className="bg-emerald-450 h-full rounded-full shadow-[0_0_10px_#10b981]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${adSkinProgress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
                
                <div className="flex items-center justify-center gap-2 font-mono text-[9px] font-bold text-amber-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span>PREPARATION PROGRESS: {adSkinProgress}%</span>
                </div>
              </div>

              {/* Footer notice */}
              <div className="text-[8px] text-neutral-500 font-medium tracking-wide uppercase select-none">
                Verified Certified Safe Reward Integration
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 z-20 overflow-hidden">
        
        <AnimatePresence mode="wait">
          
          {/* HOME SCREEN */}
          {status === 'home' && (
            <>
              {/* Floating Left/Right Compact Circle Buttons on the page margins for modern mobile layout vibes */}
              {/* Left Widget: Lucky Spin Wheel Circle Button */}
              <button
                onClick={handleOpenSpinModalManual}
                className="fixed left-3 sm:left-4 md:left-8 top-[35%] sm:top-[40%] -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-b from-purple-400 to-indigo-600 hover:brightness-110 active:scale-95 text-white flex flex-col items-center justify-center shadow-lg border-2 border-white/85 z-[100] cursor-pointer transition-all animate-bounce"
                style={{ animationDuration: '3.5s' }}
                title="Lucky Spin Wheel"
              >
                <span className="text-xl md:text-2xl animate-spin" style={{ animationDuration: '8s' }}>🎡</span>
                <span className="text-[7.5px] md:text-[9.5px] font-extrabold tracking-tight font-sans mt-0.5 leading-none">SPIN</span>
              </button>

              {/* Right Widget: Free Gift Circle Button */}
              <button
                onClick={handleHomeGiftWithAd}
                className="fixed right-3 sm:right-4 md:right-8 top-[35%] sm:top-[40%] -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-b from-rose-400 to-red-600 hover:brightness-110 active:scale-95 text-white flex flex-col items-center justify-center shadow-lg border-2 border-white/85 z-[100] cursor-pointer transition-all animate-bounce"
                style={{ animationDuration: '4.5s' }}
                title="Claim Free Gift"
              >
                <div>
                  <Gift className="w-5 h-5 md:w-6 md:h-6 text-yellow-250" />
                </div>
                <span className="text-[7.5px] md:text-[9.5px] font-extrabold tracking-tight font-sans mt-0.5 leading-none">GIFT</span>
              </button>

              <motion.div
                key="home"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="w-full flex flex-col items-center gap-4 md:gap-6 py-2 max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto relative z-30"
              >
                {/* Home Header */}
                <div className="w-full flex items-center justify-between gap-3 p-1 relative select-none z-30">
                  {/* Coins Counter Bubble styled nicely */}
                  <div className="bg-gradient-to-b from-white/95 to-white/90 border-2 border-sky-350 text-[#0288d1] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-display font-black text-xs shadow-md select-none">
                    <span>🪙</span>
                    <span className="font-mono">{coins.toLocaleString()}</span>
                    <button
                      onClick={handleOpenSpinModalManual}
                      className="ml-1 w-5 h-5 bg-[#0288d1] hover:brightness-110 text-white flex items-center justify-center rounded-full text-[10px] cursor-pointer font-bold"
                      title="Get more coins"
                    >
                      +
                    </button>
                  </div>

                  {/* Top Right Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { audio.playClick(); setShowNoAdsModal(true); }}
                      className="w-11 h-11 bg-gradient-to-b from-rose-500 to-red-600 hover:brightness-110 text-white border-2 border-white ring-2 ring-red-500/25 rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all relative z-50 group"
                      title="No Ads Packages"
                    >
                      <span className="text-sm font-black flex flex-col items-center justify-center leading-none">
                        <span className="text-[14px] leading-none mb-0.5">🚫</span>
                        <span className="text-[6px] font-sans font-black tracking-tighter uppercase -mt-0.5 text-white/90">NO ADS</span>
                      </span>
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => { audio.playClick(); setShowHomeSettingsMenu(true); }}
                        className="w-11 h-11 bg-gradient-to-b from-[#4fc3f7] to-[#0288d1] hover:brightness-110 text-white border-2 border-white ring-2 ring-[#028cda]/30 rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all relative z-50"
                        title="Toggle Game Settings Menu"
                      >
                        <Settings className="w-5.5 h-5.5 drop-shadow-[0_1.5px_0_rgba(0,0,0,0.25)] stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* High-Fidelity 3D Cartoon Logo: "Water Sort Puzzle" */}
                <div className="relative w-full flex flex-col items-center select-none my-2">
                  <svg viewBox="0 0 320 220" className="w-72 h-52 drop-shadow-[0_12px_24px_rgba(30,58,138,0.35)] select-none overflow-visible">
                    <defs>
                      <linearGradient id="gradOrange" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                      <linearGradient id="gradGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#15803d" />
                      </linearGradient>
                      <linearGradient id="gradPink" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#be185d" />
                      </linearGradient>
                      <linearGradient id="gradBlueFill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0288d1" />
                        <stop offset="100%" stopColor="#01579b" />
                      </linearGradient>
                      <linearGradient id="gradCyanFill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#0288d1" stopOpacity="0.95" />
                      </linearGradient>
                      <linearGradient id="streamGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                      <linearGradient id="streamGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.15" />
                      </linearGradient>
                    </defs>

                    <g transform="translate(10, 10)">
                      {/* Tilted top-left floating game bottle pouring water down */}
                      <g transform="translate(45, 12) rotate(112)">
                        <rect x="-11" y="-41" width="30" height="74" rx="10" fill="#1e3a8a" opacity="0.15" />
                        <rect x="-10" y="-40" width="28" height="72" rx="9" fill="rgba(255, 255, 255, 0.25)" stroke="#1e40af" strokeWidth="3" />
                        <path d="M -5 -40 L -5 -46 L -7 -46 L -7 -49 L 15 -49 L 15 -46 L 13 -46 L 13 -40" fill="rgba(255, 255, 255, 0.4)" stroke="#1e40af" strokeWidth="2" strokeLinejoin="round" />
                        
                        {/* Fluid rushing down to the mouth to pour */}
                        <rect x="-8.5" y="-12" width="25" height="15" fill="url(#gradBlueFill)" />
                        <rect x="-8.5" y="3" width="25" height="10" fill="url(#gradCyanFill)" />
                        <path d="M -8.5 -12 L 16.5 -12 L 16.5 -48 L -8.5 -48 Z" fill="url(#gradCyanFill)" />
                        
                        <line x1="-6" y1="-30" x2="-6" y2="20" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                        <circle cx="10" cy="-25" r="2.5" fill="#ffffff" opacity="0.6" />
                      </g>

                      {/* Elegant upright glass style bottle catching the water at the bottom */}
                      <g transform="translate(176, 174)">
                        {/* Outer shadow/glow aura */}
                        <rect x="-15.5" y="-39.5" width="31" height="52" rx="11" fill="none" stroke="#2563eb" strokeWidth="4" opacity="0.12" />
                        
                        {/* Outer heavy glass bottle container shape */}
                        <rect x="-14" y="-38" width="28" height="49" rx="10" fill="rgba(255, 255, 255, 0.28)" stroke="#1e40af" strokeWidth="2.8" />
                        
                        {/* Bottleneck with glass rim & cork stopper */}
                        <path d="M -6 -38 L -6 -44 L -8 -44 L -8 -47 L 8 -47 L 8 -44 L 6 -44 L 6 -38" fill="rgba(255, 255, 255, 0.45)" stroke="#1e40af" strokeWidth="2" strokeLinejoin="round" />
                        
                        {/* Elegant wooden cork inside the bottleneck */}
                        <rect x="-4.5" y="-46.5" width="9" height="5" fill="#b45309" rx="1" />

                        {/* Colored liquid segments layers */}
                        {/* 1. Pink base layer at the very bottom */}
                        <path d="M -12.5 2 Q -12.5 9, -5 9 L 5 Q 12.5 9, 12.5 2 L 12.5 -5 L -12.5 -5 Z" fill="url(#gradPink)" />
                        
                        {/* 2. Green middle layer */}
                        <rect x="-12.5" y="-17" width="25" height="12" fill="url(#gradGreen)" stroke="#166534" strokeWidth="0.5" />
                        
                        {/* 3. Orange upper layer */}
                        <rect x="-12.5" y="-29" width="25" height="12" fill="url(#gradOrange)" stroke="#9a3412" strokeWidth="0.5" />
                        
                        {/* 4. Cyan top layer */}
                        <rect x="-12.5" y="-34.5" width="25" height="5.5" fill="url(#gradCyanFill)" />
                        
                        {/* Sparkly water bubbles inside the liquid blocks */}
                        <circle cx="-6" cy="3" r="1.5" fill="#ffffff" opacity="0.7" />
                        <circle cx="5" cy="-10" r="1.2" fill="#ffffff" opacity="0.6" />
                        <circle cx="-3" cy="-22" r="1.6" fill="#ffffff" opacity="0.8" />
                        <circle cx="4" cy="-28" r="1" fill="#ffffff" opacity="0.6" />

                        {/* Glossy glass reflection & bright specular highlight */}
                        <line x1="-9.5" y1="-33" x2="-9.5" y2="7" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
                        <circle cx="8" cy="-32" r="1.5" fill="#ffffff" opacity="0.4" />
                      </g>

                      {/* Highly-realistic active flowing water stream falling from bottle mouth into bottle neck */}
                      <path
                        d="M 88,52 Q 105,42 115,64 T 150,105 T 176,128"
                        fill="none"
                        stroke="url(#streamGrad1)"
                        strokeWidth="6.5"
                        strokeLinecap="round"
                      />
                      
                      {/* Static glistening white flow highlights (No CPU/GPU lag!) */}
                      <path
                        d="M 88,52 Q 105,42 115,64 T 150,105 T 176,128"
                        fill="none"
                        stroke="url(#streamGrad2)"
                        strokeWidth="3.8"
                        strokeLinecap="round"
                        strokeDasharray="14, 20"
                      />

                      {/* Static Droplets sliding down the streamline path */}
                      <circle cx="106" cy="53" r="3.2" fill="#67e8f9" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
                      <circle cx="138" cy="88" r="3.2" fill="#67e8f9" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
                      <circle cx="166" cy="118" r="3.2" fill="#67e8f9" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />

                      {/* Static high-fidelity splashing sparkles on impact */}
                      <circle cx="115" cy="64" r="3.5" fill="#22d3ee" stroke="#ffffff" strokeWidth="0.6" />
                      <circle cx="125" cy="56" r="2.2" fill="#22d3ee" stroke="#ffffff" strokeWidth="0.6" />
                      <circle cx="176" cy="128" r="3.2" fill="#22d3ee" stroke="#ffffff" strokeWidth="0.6" />
                      <circle cx="184" cy="118" r="2.5" fill="#22d3ee" stroke="#ffffff" strokeWidth="0.6" />

                      {/* Highly stylized outlines + overlapping bubble fonts exactly matching target image 5 */}
                      <text
                        x="160"
                        y="75"
                        textAnchor="middle"
                        fontSize="54"
                        fontWeight="900"
                        fontFamily="Fredoka, sans-serif"
                        fill="#1e40af"
                        stroke="#1e40af"
                        strokeWidth="11"
                        strokeLinejoin="round"
                        transform="rotate(-5, 160, 75)"
                      >
                        Water
                      </text>
                      <text
                        x="160"
                        y="75"
                        textAnchor="middle"
                        fontSize="54"
                        fontWeight="900"
                        fontFamily="Fredoka, sans-serif"
                        fill="#ffffff"
                        transform="rotate(-5, 160, 75)"
                      >
                        Water
                      </text>

                      <text
                        x="175"
                        y="134"
                        textAnchor="middle"
                        fontSize="48"
                        fontWeight="900"
                        fontFamily="Fredoka, sans-serif"
                        fill="#1e40af"
                        stroke="#1e40af"
                        strokeWidth="11"
                        strokeLinejoin="round"
                        transform="rotate(6, 175, 134)"
                      >
                        Sort
                      </text>
                      <text
                        x="175"
                        y="134"
                        textAnchor="middle"
                        fontSize="48"
                        fontWeight="900"
                        fontFamily="Fredoka, sans-serif"
                        fill="#ffffff"
                        transform="rotate(6, 175, 134)"
                      >
                        Sort
                      </text>

                      <text
                        x="195"
                        y="180"
                        textAnchor="middle"
                        fontSize="26"
                        fontWeight="900"
                        fontFamily="Fredoka, sans-serif"
                        fill="#1e40af"
                        stroke="#1e40af"
                        strokeWidth="7"
                        strokeLinejoin="round"
                        transform="rotate(-3, 195, 180)"
                      >
                        Puzzle
                      </text>
                      <text
                        x="195"
                        y="180"
                        textAnchor="middle"
                        fontSize="26"
                        fontWeight="900"
                        fontFamily="Fredoka, sans-serif"
                        fill="#ffffff"
                        transform="rotate(-3, 195, 180)"
                      >
                        Puzzle
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Middle Play / Shop Action Buttons block */}
                <div className="w-full flex flex-col gap-4 md:gap-5 px-2 select-none z-30 mt-1 max-w-sm md:max-w-md lg:max-w-lg mx-auto">
                  {/* 3D Glossy PLAY Button */}
                  <button
                    onClick={() => {
                      audio.playClick();
                      setStatus('level-select');
                    }}
                    className="w-full flex items-center justify-center py-4 md:py-5 lg:py-6 bg-gradient-to-b from-[#4fc3f7] to-[#0288d1] hover:brightness-105 text-white border-b-[6px] md:border-b-[8px] border-[#01579b] rounded-[24px] md:rounded-[32px] font-display font-black text-2xl md:text-3xl lg:text-4xl shadow-[inset_0_4px_0_rgba(255,255,255,0.4),0_8px_16px_rgba(18,122,220,0.3)] active:translate-y-1 active:border-b-2 cursor-pointer transition uppercase tracking-wider text-center"
                    style={{ textShadow: '2.5px 2.5px 0px #01579b' }}
                  >
                    PLAY
                  </button>

                  {/* 3D Glossy SHOP Button */}
                  <button
                    onClick={() => {
                      audio.playClick();
                      setMarketOrigin('home');
                      setMarketTab('vessels');
                      setShowMarketModal(true);
                    }}
                    className="w-full flex items-center justify-center py-4 md:py-5 lg:py-6 bg-gradient-to-b from-[#a3e635] to-[#65a30d] hover:brightness-105 text-white border-b-[6px] md:border-b-[8px] border-[#3f6212] rounded-[24px] md:rounded-[32px] font-display font-black text-2xl md:text-3xl lg:text-4xl shadow-[inset_0_4px_0_rgba(255,255,255,0.4),0_8px_16px_rgba(101,163,13,0.35)] active:translate-y-1 active:border-b-2 cursor-pointer transition uppercase tracking-wider text-center"
                    style={{ textShadow: '2.5px 2.5px 0px #3f6212' }}
                  >
                    SHOP
                  </button>
                </div>

                {/* Powered By Galaxy Studio text as requested */}
                <div className="w-full text-center mt-3 select-none z-30 opacity-70">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-blue-900 uppercase font-black font-sans">
                    ⚡ POWERED BY GALAXY STUDIO ⚡
                  </span>
                </div>

                {/* High-quality Native Ad */}
                <div className="w-full max-w-sm px-2 z-30 mt-3">
                  <AdMobNativeAd />
                </div>
              </motion.div>
            </>
          )}

          {/* LEVEL SELECT SCREEN */}
          {status === 'level-select' && (
            <motion.div
              key="level-select"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col items-center gap-4 py-2"
            >
              {/* Back to Home header bar */}
              <div className="w-full max-w-xl flex items-center justify-between px-2 select-none">
                <button
                  onClick={() => { audio.playClick(); setStatus('home'); }}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-750 text-white font-extrabold text-[10px] uppercase border-b-2 border-neutral-950 rounded-xl flex items-center gap-1.5 shadow active:translate-y-0.5 cursor-pointer transition"
                >
                  <Home className="w-3 h-3 text-amber-400" />
                  <span>HOME</span>
                </button>

                <div className="bg-neutral-955/40 px-3 py-1.5 rounded-xl border border-neutral-850 font-mono text-[10px] font-white text-yellow-400 font-black">
                  🪙 {coins}
                </div>
              </div>

              {/* Level Selector component itself is scrollable internally */}
              <div className="w-full max-h-[70vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <LevelSelector 
                  currentLevel={currentLevel} 
                  maxUnlockedLevel={maxUnlockedLevel}
                  onSelectLevel={handleStartGame} 
                />
              </div>

              <div className="mt-2 text-center select-none w-full">
                <span className="text-[9px] font-mono tracking-[0.2em] text-slate-450 uppercase font-black">
                  Powered By Galaxy Studio
                </span>
              </div>

              {/* High-quality Native Ad */}
              <div className="w-full max-w-sm px-2 z-30 mt-3">
                <AdMobNativeAd />
              </div>
            </motion.div>
          )}

          {/* PLAY SCREEN */}
          {status === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center gap-3"
            >
              {/* Stats Bar */}
              <div className="w-full max-w-xl">
                <Stats 
                  currentLevel={currentLevel} 
                  movesCount={movesCount} 
                  status={status} 
                />
              </div>

              {/* Game Grid Plate - Keeps heights compact so mobile users dont scroll */}
              <div className={`w-full max-w-xl border border-white/15 rounded-[24px] ${bottles.length >= 6 ? 'p-1.5 sm:p-3' : 'p-3'} shadow-2xl relative transition-all duration-300 min-h-[250px] sm:min-h-[300px] flex items-center justify-center`}>
                <div className="absolute bottom-5 inset-x-8 h-3 bg-black/30 rounded-full blur-xs -z-10" />

                {isGateLevel && centerTube ? (
                  <div className="flex flex-col items-center w-full py-2 z-10 relative">
                    {/* Main horizontal layout containing Left Column, Giant Center Bottle and Right Column */}
                    <div className="flex items-center justify-between w-full gap-2 sm:gap-4 px-1 sm:px-3">
                      
                      {/* LEFT COLUMN: stacked vertically */}
                      <div className="flex flex-col gap-1.5 sm:gap-3 flex-shrink-0">
                        {leftTubes.map((bottle) => {
                          const isSelected = selectedBottleId === bottle.id;
                          const isSourceOfAnim = pourSourceId === bottle.id;
                          const isTargetOfAnim = pourTargetId === bottle.id;
                          const isHintSource = hintDetails?.from === bottle.id;
                          const isHintTarget = hintDetails?.to === bottle.id;
                          const isStreamActiveOnThis = isStreamActive && isTargetOfAnim;

                          return (
                            <div
                              id={`bottle-wrapper-${bottle.id}`}
                              key={bottle.id}
                              className="flex justify-center flex-shrink-0"
                            >
                              <Bottle
                                bottle={bottle}
                                isSelected={isSelected}
                                isHintSource={isHintActive && isHintSource}
                                isHintTarget={isHintActive && isHintTarget}
                                onSelect={handleSelectBottle}
                                pourAngle={isSourceOfAnim ? pourAngle : 0}
                                pourOffset={isSourceOfAnim ? pourOffset : { x: 0, y: 0 }}
                                isStreamActive={isStreamActiveOnThis}
                                streamColor={isStreamActiveOnThis ? streamColor : undefined}
                                vesselStyle={currentVesselStyle}
                                skinGlowColor={finalSkinGlowColor}
                                isCompact={true}
                                isDarkTheme={isDarkThemeActive}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* CENTER SPACE: Giant Heart Flask */}
                      <div className="flex-1 flex flex-col items-center justify-center py-5 px-3 bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent border border-pink-500/20 rounded-[35px] shadow-[0_0_24px_rgba(236,72,153,0.15)] relative min-w-[140px] sm:min-w-[190px]">
                        {/* Shiny animated pulsing heart tag */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-[7.5px] sm:text-[9px] px-3.5 py-1 rounded-full uppercase tracking-[0.15em] font-sans shadow-lg shadow-pink-500/40 border border-white/20 flex items-center gap-1 animate-pulse">
                          <span className="text-[9px]">💖</span>
                          <span>GATE VESSEL</span>
                        </div>
                        
                        {(() => {
                          const bottle = centerTube;
                          const isSelected = selectedBottleId === bottle.id;
                          const isSourceOfAnim = pourSourceId === bottle.id;
                          const isTargetOfAnim = pourTargetId === bottle.id;
                          const isHintSource = hintDetails?.from === bottle.id;
                          const isHintTarget = hintDetails?.to === bottle.id;
                          const isStreamActiveOnThis = isStreamActive && isTargetOfAnim;

                          return (
                            <div id={`bottle-wrapper-${bottle.id}`} key={bottle.id} className="flex justify-center relative z-20">
                              <Bottle
                                bottle={bottle}
                                isSelected={isSelected}
                                isHintSource={isHintActive && isHintSource}
                                isHintTarget={isHintActive && isHintTarget}
                                onSelect={handleSelectBottle}
                                pourAngle={isSourceOfAnim ? pourAngle : 0}
                                pourOffset={isSourceOfAnim ? pourOffset : { x: 0, y: 0 }}
                                isStreamActive={isStreamActiveOnThis}
                                streamColor={isStreamActiveOnThis ? streamColor : undefined}
                                vesselStyle="heart" // FORCED heart shape
                                skinGlowColor={finalCenterSkinGlowColor}
                                isCompact={false}
                                isDarkTheme={isDarkThemeActive}
                                isGiant={true}
                              />
                            </div>
                          );
                        })()}
                      </div>

                      {/* RIGHT COLUMN: stacked vertically */}
                      <div className="flex flex-col gap-1.5 sm:gap-3 flex-shrink-0">
                        {rightTubes.map((bottle) => {
                          const isSelected = selectedBottleId === bottle.id;
                          const isSourceOfAnim = pourSourceId === bottle.id;
                          const isTargetOfAnim = pourTargetId === bottle.id;
                          const isHintSource = hintDetails?.from === bottle.id;
                          const isHintTarget = hintDetails?.to === bottle.id;
                          const isStreamActiveOnThis = isStreamActive && isTargetOfAnim;

                          return (
                            <div
                              id={`bottle-wrapper-${bottle.id}`}
                              key={bottle.id}
                              className="flex justify-center flex-shrink-0"
                            >
                              <Bottle
                                bottle={bottle}
                                isSelected={isSelected}
                                isHintSource={isHintActive && isHintSource}
                                isHintTarget={isHintActive && isHintTarget}
                                onSelect={handleSelectBottle}
                                pourAngle={isSourceOfAnim ? pourAngle : 0}
                                pourOffset={isSourceOfAnim ? pourOffset : { x: 0, y: 0 }}
                                isStreamActive={isStreamActiveOnThis}
                                streamColor={isStreamActiveOnThis ? streamColor : undefined}
                                vesselStyle={currentVesselStyle}
                                skinGlowColor={finalSkinGlowColor}
                                isCompact={true}
                                isDarkTheme={isDarkThemeActive}
                              />
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    {/* BOTTOM ROW: stacked horizontally for any remains / empty tubes */}
                    {bottomTubes.length > 0 && (
                      <div className="flex justify-center flex-wrap gap-2.5 sm:gap-4 mt-3 sm:mt-5 w-full">
                        {bottomTubes.map((bottle) => {
                          const isSelected = selectedBottleId === bottle.id;
                          const isSourceOfAnim = pourSourceId === bottle.id;
                          const isTargetOfAnim = pourTargetId === bottle.id;
                          const isHintSource = hintDetails?.from === bottle.id;
                          const isHintTarget = hintDetails?.to === bottle.id;
                          const isStreamActiveOnThis = isStreamActive && isTargetOfAnim;

                          return (
                            <div
                              id={`bottle-wrapper-${bottle.id}`}
                              key={bottle.id}
                              className="flex justify-center flex-shrink-0"
                            >
                              <Bottle
                                bottle={bottle}
                                isSelected={isSelected}
                                isHintSource={isHintActive && isHintSource}
                                isHintTarget={isHintActive && isHintTarget}
                                onSelect={handleSelectBottle}
                                pourAngle={isSourceOfAnim ? pourAngle : 0}
                                pourOffset={isSourceOfAnim ? pourOffset : { x: 0, y: 0 }}
                                isStreamActive={isStreamActiveOnThis}
                                streamColor={isStreamActiveOnThis ? streamColor : undefined}
                                vesselStyle={currentVesselStyle}
                                skinGlowColor={finalSkinGlowColor}
                                isCompact={true}
                                isDarkTheme={isDarkThemeActive}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : bottles.length >= 5 ? (
                  <div className={`flex flex-col ${bottles.length >= 6 ? 'gap-y-1 sm:gap-y-2' : 'gap-y-3.5'} w-full py-1`}>
                    {/* Row 1 Grid */}
                    <div className={`flex flex-wrap items-end justify-center ${bottles.length >= 6 ? 'gap-y-1 gap-x-1 sm:gap-x-2' : 'gap-y-2 gap-x-2 sm:gap-x-4'}`}>
                      {row1Tubes.map((bottle) => {
                        const isSelected = selectedBottleId === bottle.id;
                        const isSourceOfAnim = pourSourceId === bottle.id;
                        const isTargetOfAnim = pourTargetId === bottle.id;
                        const isHintSource = hintDetails?.from === bottle.id;
                        const isHintTarget = hintDetails?.to === bottle.id;
                        const isStreamActiveOnThis = isStreamActive && isTargetOfAnim;

                        return (
                          <div
                            id={`bottle-wrapper-${bottle.id}`}
                            key={bottle.id}
                            className="flex justify-center flex-shrink-0"
                          >
                            <Bottle
                              bottle={bottle}
                              isSelected={isSelected}
                              isHintSource={isHintActive && isHintSource}
                              isHintTarget={isHintActive && isHintTarget}
                              onSelect={handleSelectBottle}
                              pourAngle={isSourceOfAnim ? pourAngle : 0}
                              pourOffset={isSourceOfAnim ? pourOffset : { x: 0, y: 0 }}
                              isStreamActive={isStreamActiveOnThis}
                              streamColor={isStreamActiveOnThis ? streamColor : undefined}
                              vesselStyle={currentVesselStyle}
                              skinGlowColor={finalSkinGlowColor}
                              isCompact={bottles.length >= 6}
                              isDarkTheme={isDarkThemeActive}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-[85%] mx-auto h-[1px] bg-white/5 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_80%)]" />

                    {/* Row 2 Grid */}
                    <div className={`flex flex-wrap items-end justify-center ${bottles.length >= 6 ? 'gap-y-1 gap-x-1 sm:gap-x-2' : 'gap-y-2 gap-x-2 sm:gap-x-4'}`}>
                      {row2Tubes.map((bottle) => {
                        const isSelected = selectedBottleId === bottle.id;
                        const isSourceOfAnim = pourSourceId === bottle.id;
                        const isTargetOfAnim = pourTargetId === bottle.id;
                        const isHintSource = hintDetails?.from === bottle.id;
                        const isHintTarget = hintDetails?.to === bottle.id;
                        const isStreamActiveOnThis = isStreamActive && isTargetOfAnim;

                        return (
                          <div
                            id={`bottle-wrapper-${bottle.id}`}
                            key={bottle.id}
                            className="flex justify-center flex-shrink-0"
                          >
                            <Bottle
                              bottle={bottle}
                              isSelected={isSelected}
                              isHintSource={isHintActive && isHintSource}
                              isHintTarget={isHintActive && isHintTarget}
                              onSelect={handleSelectBottle}
                              pourAngle={isSourceOfAnim ? pourAngle : 0}
                              pourOffset={isSourceOfAnim ? pourOffset : { x: 0, y: 0 }}
                              isStreamActive={isStreamActiveOnThis}
                              streamColor={isStreamActiveOnThis ? streamColor : undefined}
                              vesselStyle={currentVesselStyle}
                              skinGlowColor={finalSkinGlowColor}
                              isCompact={bottles.length >= 6}
                              isDarkTheme={isDarkThemeActive}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  // Single Row Fallback centered perfectly
                  <div className={`flex flex-wrap items-end justify-center ${bottles.length >= 6 ? 'gap-x-1.5' : 'gap-x-2 sm:gap-x-3'} gap-y-4 py-3`}>
                    {bottles.map((bottle) => {
                      const isSelected = selectedBottleId === bottle.id;
                      const isSourceOfAnim = pourSourceId === bottle.id;
                      const isTargetOfAnim = pourTargetId === bottle.id;
                      const isHintSource = hintDetails?.from === bottle.id;
                      const isHintTarget = hintDetails?.to === bottle.id;
                      const isStreamActiveOnThis = isStreamActive && isTargetOfAnim;

                      return (
                        <div
                          id={`bottle-wrapper-${bottle.id}`}
                          key={bottle.id}
                          className="flex justify-center flex-shrink-0"
                        >
                          <Bottle
                            bottle={bottle}
                            isSelected={isSelected}
                            isHintSource={isHintActive && isHintSource}
                            isHintTarget={isHintActive && isHintTarget}
                            onSelect={handleSelectBottle}
                            pourAngle={isSourceOfAnim ? pourAngle : 0}
                            pourOffset={isSourceOfAnim ? pourOffset : { x: 0, y: 0 }}
                            isStreamActive={isStreamActiveOnThis}
                            streamColor={isStreamActiveOnThis ? streamColor : undefined}
                            vesselStyle={currentVesselStyle}
                            skinGlowColor={finalSkinGlowColor}
                            isCompact={bottles.length >= 6}
                            isDarkTheme={isDarkThemeActive}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2-Level Interactive Tutorial Hand Guide */}
                {currentLevel <= 2 && status === 'playing' && tutorialCoords && (
                  <div className="absolute inset-0 pointer-events-none z-[45] overflow-visible">
                    <motion.div
                      className="absolute text-center flex flex-col items-center"
                      style={{
                        originX: 0.5,
                        originY: 0.5,
                      }}
                      animate={{
                        x: tutorialCoords.x - 50, // Center on bottle (width is 100px so offset is 50)
                        y: [tutorialCoords.y - 70, tutorialCoords.y - 45, tutorialCoords.y - 70],
                        rotate: [0, -10, 0]
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <span className="text-4xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] select-none">👇</span>
                      <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-green-600 text-white font-mono text-[8px] sm:text-[9.5px] font-black px-2.5 py-1 rounded-full border border-white tracking-wide uppercase shadow-[0_4px_12px_rgba(16,185,129,0.3)] whitespace-nowrap leading-none mt-1">
                        {tutorialCoords.label}
                      </span>
                    </motion.div>
                  </div>
                )}

                {/* Animated hand details */}
                {isHintActive && hintCoords && (
                  <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                      {!isExtraTubeHintActive && (
                        <motion.path
                          d={`M ${hintCoords.x1} ${hintCoords.y1 - 15} Q ${(hintCoords.x1 + hintCoords.x2)/2} ${Math.min(hintCoords.y1, hintCoords.y2) - 40} ${hintCoords.x2} ${hintCoords.y2 - 15}`}
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray="5 5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                        />
                      )}
                    </svg>

                    <motion.div
                      className="absolute text-2xl sm:text-3xl filter drop-shadow select-none text-center flex flex-col items-center"
                      style={{
                        originX: 0.5,
                        originY: 0.5,
                      }}
                      animate={{
                        x: isExtraTubeHintActive 
                          ? [hintCoords.x1 - 12, hintCoords.x1 - 12, hintCoords.x1 - 12]
                          : [hintCoords.x1 - 12, hintCoords.x2 - 12, hintCoords.x1 - 12],
                        y: isExtraTubeHintActive
                          ? [hintCoords.y1 - 45, hintCoords.y1 - 25, hintCoords.y1 - 45]
                          : [hintCoords.y1 - 30, hintCoords.y2 - 45, hintCoords.y1 - 30],
                        rotate: [0, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: isExtraTubeHintActive ? 1.0 : 1.8,
                        repeat: Infinity,
                        ease: isExtraTubeHintActive ? "easeInOut" : "easeOut"
                      }}
                    >
                      {isExtraTubeHintActive ? (
                        <div className="flex flex-col items-center">
                          <span className="text-3xl drop-shadow-lg">👇</span>
                          <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white font-sans text-[8px] font-black px-2 py-0.5 rounded-lg border border-white uppercase shadow-md leading-none mt-1 animate-pulse whitespace-nowrap">
                            TEST TUBE NEEDED! 🧪
                          </span>
                        </div>
                      ) : (
                        <span>👆</span>
                      )}
                    </motion.div>
                  </div>
                )}

                {/* 2-second delay transition overlay */}
                {isTransitioningToWin && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-50 rounded-[24px] select-none">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-14 h-14 bg-gradient-to-tr from-yellow-300 via-amber-400 to-amber-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20 animate-bounce">
                        🎉
                      </div>
                      <h2 className="text-white text-xl font-black font-display tracking-widest uppercase">
                        LEVEL SOLVED!
                      </h2>
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-1 text-amber-450 text-amber-450 text-amber-400 font-mono text-[10px] uppercase font-black tracking-wider bg-neutral-950/90 border border-neutral-800 px-3.5 py-1 rounded-full animate-pulse shadow-md">
                          <span>🪙</span>
                          <span>+50 Coins Credited!</span>
                        </div>
                        <div className="text-slate-400 font-mono text-[9px] uppercase font-bold tracking-wider">
                          Preparing Next Challenge...
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Clean layout modifiers: Text descriptions removed as requested */}
              <div className={`w-full max-w-xl h-auto p-2 md:p-2.5 border rounded-2xl md:rounded-3xl shadow-xl flex items-center justify-center gap-2 md:gap-3 ${activeTheme.containerBg} backdrop-blur-md`}>
                {/* 1. TUBE ACTION */}
                <button
                  id="booster-button-extra-tube"
                  onClick={() => {
                    audio.playClick();
                    setBoosterPrompt('tube');
                  }}
                  className="flex-1 h-10 md:h-12 flex items-center justify-center gap-1.2 sm:gap-1.5 text-[10px] md:text-[11.5px] uppercase font-black transition-all cursor-pointer border-b-2 rounded-xl md:rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 text-neutral-950 border-cyan-705 font-extrabold shadow hover:brightness-110 active:translate-y-0.5"
                  title="Unlock auxiliary Tube"
                >
                  <PlusCircle className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[3.5]" />
                  <span>Extra</span>
                  <span className="text-[8px] md:text-[9.5px] opacity-80 font-mono">10k</span>
                </button>

                {/* 2. UNDO ACTION (Costs exactly 1000 gold coins) */}
                <button
                  onClick={handleUndo}
                  className={`flex-1 h-10 md:h-12 flex items-center justify-center gap-1.2 sm:gap-1.5 text-[10px] md:text-[11.5px] uppercase font-black transition-all cursor-pointer border-b-2 rounded-xl md:rounded-2xl ${
                    history.length > 0
                      ? 'bg-amber-400 text-neutral-950 border-amber-600 shadow hover:brightness-110 active:translate-y-0.5'
                      : 'bg-neutral-800/40 text-neutral-500 border-neutral-800/10 opacity-40 cursor-not-allowed'
                  }`}
                  title="Spend 1000 coins to Undo"
                >
                  <Undo className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[3.5]" />
                  <span>Undo</span>
                  <span className="text-[8px] md:text-[9.5px] opacity-80 font-mono">1k</span>
                </button>

                {/* 3. HINT ACTION */}
                <button
                  onClick={() => {
                    if (isHintActive) {
                      handleToggleHint();
                    } else {
                      audio.playClick();
                      setBoosterPrompt('hint');
                    }
                  }}
                  className={`flex-1 h-10 md:h-12 flex items-center justify-center gap-1.2 sm:gap-1.5 text-[10px] md:text-[11.5px] uppercase font-black border-b-2 rounded-xl md:rounded-2xl transition-all cursor-pointer ${
                    isHintActive
                      ? 'bg-emerald-500 text-white border-emerald-700 shadow animate-pulse'
                      : 'bg-amber-400 text-neutral-950 border-amber-600 shadow hover:brightness-110 active:translate-y-0.5'
                  }`}
                  title="Show visual hints"
                >
                  <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[3.5]" />
                  <span>{isHintActive ? 'Hide' : 'Hint'}</span>
                  {!isHintActive && <span className="text-[8px] md:text-[9.5px] opacity-80 font-mono">2k</span>}
                </button>

                {/* 4. SKIP LEVEL ACTION */}
                <button
                  onClick={() => {
                    audio.playClick();
                    setBoosterPrompt('skip');
                  }}
                  className="flex-1 h-10 md:h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-550 text-white border-b-2 border-indigo-905 rounded-xl md:rounded-2xl flex items-center justify-center gap-1.2 sm:gap-1.5 text-[10px] md:text-[11.5px] uppercase font-black cursor-pointer shadow transition hover:brightness-110 active:translate-y-0.5"
                  title="Skip level"
                >
                  <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[3.5]" />
                  <span>Skip</span>
                  <span className="text-[8px] md:text-[9.5px] opacity-80 font-mono">10k</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* WIN SCREEN */}
          {status === 'won' && (
            <div className="fixed inset-0 bg-[#000000]/95 z-[999] flex items-center justify-center p-4 overflow-hidden select-none">
              {/* Fall-back falling confetti particles */}
              {Array.from({ length: 45 }).map((_, index) => {
                const colors = [
                  'bg-red-500', 'bg-blue-405', 'bg-yellow-405', 'bg-green-405', 
                  'bg-pink-505', 'bg-purple-505', 'bg-orange-405', 'bg-teal-405',
                  'bg-emerald-405', 'bg-amber-405'
                ];
                const color = colors[index % colors.length];
                const size = index % 2 === 0 ? 'w-2 h-4.5' : 'w-1.5 h-3.5';
                const left = (index * 2.2) % 100;
                const duration = 2.0 + (index % 5) * 0.6;
                const delay = (index % 4) * 0.4;
                const rotateValue = 180 + (index * 45) % 360;
                const xSway = (index % 3 === 0) ? 60 : (index % 3 === 1) ? -60 : 0;
                return (
                  <motion.div
                    key={index}
                    className={`absolute ${color} ${size} opacity-90 rounded-[1.5px] z-[5] pointer-events-none`}
                    initial={{ y: -50, x: `${left}vw`, rotate: 0 }}
                    animate={{ 
                      y: '110vh', 
                      x: `${left + (xSway / (typeof window !== 'undefined' ? window.innerWidth : 1000)) * 100}vw`,
                      rotate: rotateValue 
                    }}
                    transition={{
                      duration: duration,
                      delay: delay,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                );
              })}

              <motion.div
                key="won"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm flex flex-col items-center justify-center p-6 text-center relative z-10"
              >
                {/* Glowing Crown SVG exactly like user image 2 */}
                <div className="mb-4">
                  <svg className="w-[100px] h-[75px] drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-bounce" viewBox="0 0 100 80">
                    {/* Crown Main Surface */}
                    <path 
                      d="M10,70 L90,70 L85,45 L65,55 L50,30 L35,55 L15,45 Z" 
                      fill="url(#goldGrad)" 
                      stroke="#B45309" 
                      strokeWidth="2.5" 
                      strokeLinejoin="round"
                    />
                    
                    {/* Red diamond gems on primary tips */}
                    <circle cx="10" cy="45" r="4" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1" />
                    <circle cx="90" cy="45" r="4" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1" />
                    
                    {/* Blue lapis stones on secondary valley folds */}
                    <circle cx="35" cy="55" r="3.5" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="1" />
                    <circle cx="65" cy="55" r="3.5" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="1" />
                    
                    {/* Royal Green Emerald at the peak center position */}
                    <circle cx="50" cy="30" r="5" fill="#10B981" stroke="#064E3B" strokeWidth="1" />
                    
                    {/* Crown bottom heavy support plate */}
                    <rect x="10" y="65" width="80" height="9" fill="#F59E0B" stroke="#B45309" strokeWidth="2" rx="1.5" />
                    {/* Colorful inset jewelry gems on base */}
                    <circle cx="20" cy="69.5" r="2.5" fill="#10B981" />
                    <circle cx="35" cy="69.5" r="2.5" fill="#EF4444" />
                    <circle cx="50" cy="69.5" r="3" fill="#3B82F6" />
                    <circle cx="65" cy="69.5" r="2.5" fill="#EF4444" />
                    <circle cx="80" cy="69.5" r="2.5" fill="#10B981" />

                    <defs>
                      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFF4D0" />
                        <stop offset="20%" stopColor="#FBBF24" />
                        <stop offset="60%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#D97706" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Beautiful Golden 3-Star Rating Graphic */}
                <div className="flex justify-center items-end gap-1.5 my-1.5 relative z-20">
                  {/* Star 1 (Left - tilted left) */}
                  <motion.svg
                    className="w-10 h-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.65)]"
                    viewBox="0 0 24 24"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: -15, y: 3 }}
                    transition={{
                      type: "spring",
                      stiffness: 240,
                      damping: 11,
                      delay: 0.1,
                    }}
                  >
                    <defs>
                      <linearGradient id="starGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFFBEB" />
                        <stop offset="35%" stopColor="#FBBF24" />
                        <stop offset="70%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#D97706" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z"
                      fill="url(#starGoldGrad)"
                      stroke="#B45309"
                      strokeWidth="1.2"
                    />
                  </motion.svg>

                  {/* Star 2 (Center - slightly larger & taller) */}
                  <motion.svg
                    className="w-13 h-13 drop-shadow-[0_0_22px_rgba(251,191,36,0.85)]"
                    viewBox="0 0 24 24"
                    initial={{ scale: 0, y: -15 }}
                    animate={{ scale: 1.15, y: -5 }}
                    transition={{
                      type: "spring",
                      stiffness: 240,
                      damping: 10,
                      delay: 0.25,
                    }}
                  >
                    <path
                      d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z"
                      fill="url(#starGoldGrad)"
                      stroke="#B45309"
                      strokeWidth="1.2"
                    />
                  </motion.svg>

                  {/* Star 3 (Right - tilted right) */}
                  <motion.svg
                    className="w-10 h-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.65)]"
                    viewBox="0 0 24 24"
                    initial={{ scale: 0, rotate: 45 }}
                    animate={{ scale: 1, rotate: 15, y: 3 }}
                    transition={{
                      type: "spring",
                      stiffness: 240,
                      damping: 11,
                      delay: 0.4,
                    }}
                  >
                    <path
                      d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z"
                      fill="url(#starGoldGrad)"
                      stroke="#B45309"
                      strokeWidth="1.2"
                    />
                  </motion.svg>
                </div>

                {/* AWESOME Ribbon/Badge Banner component */}
                <div className="relative w-full max-w-[280px] mx-auto select-none">
                  {/* Left edge shadow tail */}
                  <div className="absolute left-[-10px] top-[6px] w-6 h-10 bg-[#830B0F] rounded-l -z-10" style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }} />
                  {/* Right edge shadow tail */}
                  <div className="absolute right-[-10px] top-[6px] w-6 h-10 bg-[#830B0F] rounded-r -z-10" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
                  
                  {/* Raised structural red display banner */}
                  <div className="bg-gradient-to-r from-[#DF1D24] to-[#B31217] border-y border-red-500/20 text-white px-8 py-2.5 rounded shadow-xl flex items-center justify-center font-display font-black leading-none uppercase">
                    <span className="text-xl sm:text-2xl font-black tracking-[0.18em] translate-x-[0.09em] font-sans">
                      AWESOME
                    </span>
                  </div>
                </div>

                {/* Visual Two Finished Tube cylinders exactly matching user image 2 */}
                <div className="flex justify-center items-end gap-6 my-7">
                  {/* Yellow Bottle Graphic */}
                  <div className="relative w-6 h-[72px] border-2 border-white/40 bg-white/5 rounded-b-full shadow-inner flex flex-col justify-end p-0.5 overflow-hidden">
                    <div className="w-full h-[95%] bg-gradient-to-t from-yellow-500 to-amber-300 rounded-b-full shadow-[inset_0_2px_10px_rgba(255,255,255,0.4)]" />
                    <div className="absolute top-[-3px] left-[-2px] right-[-2px] h-2 bg-neutral-900 border-2 border-white/40 rounded-full" />
                  </div>
                  
                  {/* Green Bottle Graphic */}
                  <div className="relative w-6 h-[72px] border-2 border-white/40 bg-white/5 rounded-b-full shadow-inner flex flex-col justify-end p-0.5 overflow-hidden">
                    <div className="w-full h-[95%] bg-gradient-to-t from-emerald-500 to-green-400 rounded-b-full shadow-[inset_0_2px_10px_rgba(255,255,255,0.4)]" />
                    <div className="absolute top-[-3px] left-[-2px] right-[-2px] h-2 bg-neutral-900 border-2 border-white/40 rounded-full" />
                  </div>
                </div>

                {/* Score details */}
                <div className="text-white text-xs font-sans tracking-wide mt-1 font-medium filter drop-shadow">
                  Completed in <span className="font-extrabold text-white">{movesCount} steps</span>
                </div>

                <div className="text-[#FFAE00] text-[11px] font-black uppercase tracking-[0.25em] translate-x-[0.125em] mt-1.5 font-sans filter drop-shadow">
                  {movesCount <= 10 ? "EASY" : "HARD"}
                </div>

                <div className="mt-3.5 bg-amber-400/10 border border-amber-400/35 text-amber-400 font-black text-[10px] font-mono px-3.5 py-1.5 rounded-full flex items-center gap-1.5 select-none tracking-widest uppercase shadow-sm">
                  <span>🪙</span>
                  <span>+50 Coins Received!</span>
                </div>

                {/* Main Action buttons matching image flow */}
                <div className="w-full flex flex-col items-center gap-3.5 mt-8 select-none">
                  {/* Primary Capsule Button NEXT -> */}
                  <button
                    onClick={handleNextLevel}
                    className="w-full max-w-[240px] h-13 bg-gradient-to-b from-[#FFCF00] to-[#E5AB00] text-slate-950 font-black rounded-full flex items-center justify-center gap-2 hover:scale-[1.03] transition-all cursor-pointer font-sans shadow-[0_0_20px_rgba(255,191,0,0.35)] tracking-wide active:translate-y-0.5"
                  >
                    <span className="text-xs font-black tracking-[0.2em] translate-x-[0.1em]">NEXT</span>
                    <ArrowRight className="w-4.5 h-4.5 stroke-[3]" />
                  </button>

                  {/* Secondary Capsule Button Restart This Level */}
                  <button
                    onClick={() => {
                      audio.playClick();
                      handleRestart();
                      setStatus('playing');
                    }}
                    className="w-full max-w-[190px] py-2 bg-neutral-900/60 hover:bg-neutral-850 text-slate-400 hover:text-white rounded-full flex items-center justify-center gap-1.5 cursor-pointer text-[9px] uppercase transition border border-neutral-800/80 active:translate-y-0.5"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span className="font-extrabold font-sans tracking-wider">Restart This Level</span>
                  </button>

                  {/* Highy interactive Native Sponsor segment */}
                  <div className="w-full max-w-sm mt-3 px-2">
                    <AdMobNativeAd />
                  </div>
                </div>
              </motion.div>
            </div>
          )}

        </AnimatePresence>
      </main>

      {/* Real AdMob Banner Ad safely positioned below gameplay controls */}
      <div className="w-full py-1 bg-transparent flex justify-center z-25 flex-none">
        <AdMobBannerAd />
      </div>



      {/* About Us and Codex Modal Overlay */}
      <PrivacyAboutModal 
        isOpen={showPrivacyPolicy} 
        onClose={() => setShowPrivacyPolicy(false)} 
        onOpenPrivacy={() => {
          setShowPrivacyPolicy(false);
          setShowPrivacyOnly(true);
        }}
      />

      {/* Official 1500 words Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyOnly}
        onClose={() => setShowPrivacyOnly(false)}
      />

      {/* Booster Coins/Ad Selection Modal Option Popups */}
      <AnimatePresence>
        {boosterPrompt !== null && (
          <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border-4 border-amber-400 rounded-3xl w-full max-w-sm p-6 text-center relative overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.2)]"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => { audio.playClick(); setBoosterPrompt(null); }}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-750 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer font-bold transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-14 h-14 mx-auto mb-3.5 bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 text-neutral-950 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg animate-pulse">
                {boosterPrompt === 'tube' ? '🧪' : boosterPrompt === 'hint' ? '💡' : '⏭️'}
              </div>

              <h3 className="text-lg font-black text-white font-display uppercase tracking-wide">
                {boosterPrompt === 'tube' ? 'UNLOCK EXTRA TUBE' :
                 boosterPrompt === 'hint' ? 'REVEAL STRATEGY HINT' :
                 'SKIP LEVEL'}
              </h3>

              <p className="my-3 mx-2 text-[11px] font-medium leading-relaxed text-slate-300 font-sans">
                {boosterPrompt === 'tube' ? 'Gain an auxiliary empty container vessel to expand your sorting moves catalog and exit congested state blocks.' :
                 boosterPrompt === 'hint' ? 'Construct a visual path projection showing the next certified valid fluid pour movement.' :
                 'Bypass the current color sorting puzzle entirely and automatically progress forward to the subsequent stage.'}
              </p>

              <div className="my-3 inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-950/90 border border-neutral-800 rounded-full font-mono text-[9px] text-amber-400 font-black">
                <span>Wallet Balance:</span>
                <span>🪙</span>
                <span>{coins}</span>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => {
                    const price = boosterPrompt === 'hint' ? 2000 : 10000;
                    if (coins >= price) {
                      audio.playWin();
                      const nextCoins = coins - price;
                      setCoins(nextCoins);
                      localStorage.setItem('water_sort_coins', String(nextCoins));
                      setBoosterPrompt(null);

                      if (boosterPrompt === 'tube') {
                        handleAddBottle();
                      } else if (boosterPrompt === 'hint') {
                        handleToggleHint();
                      } else if (boosterPrompt === 'skip') {
                        audio.playWin();
                        setStatus('won');
                      }
                    } else {
                      audio.playInvalid();
                      setClaimedReward(`⚠️ INSUFFICIENT COIN WALLET BALANCE! You require exactly 🪙${price.toLocaleString()} gold coins. Claim your Free Daily Gift instead!`);
                      setShowClaimModal(true);
                    }
                  }}
                  className="w-full h-12 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black rounded-xl text-xs uppercase cursor-pointer border-b-4 border-amber-600 transition flex items-center justify-center gap-2"
                >
                  <span>SPEND 🪙 {boosterPrompt === 'hint' ? '2,000' : '10,000'} COINS</span>
                </button>

                <button
                  onClick={() => {
                    const savedPrompt = boosterPrompt;
                    setBoosterPrompt(null);
                    triggerAdAndExecute(savedPrompt, () => {
                      if (savedPrompt === 'tube') {
                        handleAddBottle();
                      } else if (savedPrompt === 'hint') {
                        handleToggleHint();
                      } else if (savedPrompt === 'skip') {
                        audio.playWin();
                        setStatus('won');
                      }
                    });
                  }}
                  className="w-full h-11 bg-neutral-800 hover:bg-neutral-750 text-white border-b-2 border-neutral-950 font-black rounded-xl text-xs uppercase cursor-pointer transition flex items-center justify-center gap-2"
                >
                  <span>🎁 CLAIM FREE BOOST GIFT</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simulated Video Ad Playback Countdown Overlay */}
      <AnimatePresence>
        {isAdPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/95 z-[9999] flex flex-col items-center justify-center p-6 text-center select-none font-mono"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1),transparent_70%)] animate-pulse" />
            
            <div className="bg-neutral-900 border-4 border-amber-400 rounded-[32px] p-6 max-w-sm w-full relative shadow-2xl flex flex-col items-center gap-4">
              <div className="bg-amber-400/10 border border-amber-450/20 text-amber-400 text-[9px] uppercase tracking-widest font-black px-4 py-1 rounded-full">
                🎬 Sponsor Commercial Ad Segment
              </div>

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full flex items-center justify-center text-xl mt-1"
              >
                🔮
              </motion.div>

              <div className="space-y-1">
                <h3 className="text-white font-black text-sm uppercase tracking-tight">
                  GALAXY STUDIO ADS
                </h3>
                <p className="text-neutral-400 text-[10px] font-sans leading-relaxed px-2 font-bold select-none">
                  {adActionType === 'gift' ? 'Dispensing secure gold coin rewards...' :
                   adActionType === 'hint' ? 'Analyzing dynamic board solution states...' :
                   'Preparing auxiliary tubes and fluid volumes...'}
                </p>
              </div>

              <div className="w-full bg-slate-950 border border-neutral-800 rounded-full h-7 p-0.5 relative overflow-hidden flex items-center justify-center">
                <div
                  className="absolute inset-y-0.5 left-0.5 bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${(3 - adCountdown) * 33.33}%` }}
                />
                <span className="absolute text-white text-[10px] font-black drop-shadow z-10">
                  REWARDING IN {adCountdown}S...
                </span>
              </div>

              <div className="text-[8px] text-slate-500 font-medium">
                Distributed securely by Galaxy Studio
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Theme-Adaptive Cute Settings Dialog */}
      <AnimatePresence>
        {showHomeSettingsMenu && (
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-[4px] z-[99999] flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-[310px] p-5 rounded-[22px] flex flex-col gap-3 font-mono text-[10px] sm:text-[11px] font-bold shadow-2xl relative border-2 ${activeTheme.containerBg} ${activeTheme.textColor}`}
            >
              <button
                onClick={() => { audio.playClick(); setShowHomeSettingsMenu(false); }}
                className="absolute top-4 right-4 w-7.5 h-7.5 rounded-full bg-current/5 hover:bg-current/10 border border-current/10 flex items-center justify-center cursor-pointer transition"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="text-[12px] uppercase tracking-wider text-center font-black border-b border-current/15 pb-2.5 mb-1 flex items-center justify-center gap-2">
                <span>⚙️</span>
                <span>GAME SETTINGS</span>
                <span>⚙️</span>
              </div>

              {/* Restart Progress (level 1 start) */}
              <button
                onClick={() => {
                  audio.playClick();
                  setShowResetConfirmModal(true);
                }}
                className="w-full py-2 px-3 bg-current/5 hover:bg-current/10 border border-current/10 rounded-xl text-left flex items-center gap-3 cursor-pointer transition select-none"
              >
                <RotateCcw className="w-4 h-4 text-rose-500 flex-none" />
                <span>RESTART PROGRESS</span>
              </button>

              {/* Rules Tutorial */}
              <button
                onClick={() => {
                  audio.playClick();
                  setShowHomeSettingsMenu(false);
                  setShowHowToPlay(true);
                }}
                className="w-full py-2 px-3 bg-current/5 hover:bg-current/10 border border-current/10 rounded-xl text-left flex items-center gap-3 cursor-pointer transition select-none"
              >
                <Info className="w-4 h-4 text-blue-400 flex-none" />
                <span>RULES TUTORIAL</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() => {
                  handleToggleSoundMute();
                }}
                className="w-full py-2 px-3 bg-current/5 hover:bg-current/10 border border-current/10 rounded-xl text-left flex items-center justify-between gap-3 cursor-pointer transition select-none"
              >
                <div className="flex items-center gap-3">
                  {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-400 flex-none" /> : <Volume2 className="w-4 h-4 text-emerald-400 flex-none" />}
                  <span>SOUND EFFECTS</span>
                </div>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${isSoundMuted ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                  {isSoundMuted ? "OFF" : "ON"}
                </span>
              </button>

              {/* Music Toggle */}
              <button
                onClick={() => {
                  handleToggleMusicMute();
                }}
                className="w-full py-2 px-3 bg-current/5 hover:bg-current/10 border border-current/10 rounded-xl text-left flex items-center justify-between gap-3 cursor-pointer transition select-none"
              >
                <div className="flex items-center gap-3">
                  <Music className={`w-4 h-4 flex-none ${isMusicMuted ? "text-rose-400" : "text-cyan-400 animate-pulse"}`} />
                  <span>BG MUSIC</span>
                </div>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${isMusicMuted ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                  {isMusicMuted ? "OFF" : "ON"}
                </span>
              </button>

              {/* Shapes & Skins trigger inside settings */}
              <button
                onClick={() => {
                  audio.playClick();
                  setMarketOrigin('settings');
                  setMarketTab('vessels');
                  setShowHomeSettingsMenu(false);
                  setShowMarketModal(true);
                }}
                className="w-full py-2 px-3 bg-current/5 hover:bg-current/10 border border-current/10 rounded-xl text-left flex items-center gap-3 cursor-pointer transition select-none"
              >
                <ShoppingBag className="w-4 h-4 text-cyan-400 flex-none" />
                <span>🛸 GALAXY MARKET SHOP</span>
              </button>

              {/* About Us Popup trigger */}
              <button
                onClick={() => {
                  audio.playClick();
                  setShowHomeSettingsMenu(false);
                  setShowPrivacyPolicy(true);
                }}
                className="w-full py-2 px-3 bg-current/5 hover:bg-current/10 border border-current/10 rounded-xl text-left flex items-center gap-3 cursor-pointer transition select-none"
              >
                <HelpCircle className="w-4 h-4 text-teal-400 flex-none" />
                <span>ABOUT US</span>
              </button>

              {/* Privacy Policy Popup trigger */}
              <button
                onClick={() => {
                  audio.playClick();
                  setShowHomeSettingsMenu(false);
                  setShowPrivacyOnly(true);
                }}
                className="w-full py-2 px-3 bg-current/5 hover:bg-current/10 border border-current/10 rounded-xl text-left flex items-center gap-3 cursor-pointer transition select-none"
              >
                <Lock className="w-4 h-4 text-purple-400 flex-none" />
                <span>PRIVACY POLICY</span>
              </button>

              <div className="pt-2 border-t border-current/15 flex justify-center">
                <button
                  onClick={() => { audio.playClick(); setShowHomeSettingsMenu(false); }}
                  className="px-5 py-2 font-black rounded-xl text-[10px] uppercase cursor-pointer bg-current/10 text-current transition-all select-none hover:bg-current/20 active:scale-95"
                >
                  CLOSE SETTINGS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium No Ads Packages Modal */}
      <AnimatePresence>
        {showNoAdsModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-[4px] z-[99999] flex items-center justify-center p-4 select-none text-slate-800">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border-4 border-rose-500 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col p-5 gap-4 relative shadow-[0_12px_40px_rgba(244,63,94,0.3)]"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => { audio.playClick(); setShowNoAdsModal(false); }}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer font-bold transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Header Title with Pro badge */}
              <div className="text-center pt-2">
                <div className="inline-block bg-rose-500 text-white font-mono font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                  🚫 ELITE STATUS
                </div>
                <h2 className="text-2xl font-black font-display text-rose-600 uppercase tracking-tight select-none">
                  No Ads Packages
                </h2>
                <p className="text-[10px] text-slate-500 leading-normal font-sans font-bold mt-1 px-4">
                  Experience seamless color sorting. Stop watching commercial gaps and unlock instant claim privileges!
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2 py-1 select-none text-left">
                {[
                  { icon: "⚡", title: "Uninterrupted Game Stages", desc: "No random interstitial video popups." },
                  { icon: "🎁", title: "Double Booster Rewards", desc: "Instantly double your rewards without watching ad playbacks." },
                  { icon: "👑", title: "Lifetime VIP Aura Skin", desc: "Includes elite player tag decoration automatically." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start p-2.5 bg-rose-50/40 rounded-2xl border border-rose-100/40">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-wide">{item.title}</h4>
                      <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* List of pricing options */}
              <div className="space-y-2.5 select-none">
                {[
                  { duration: "2 Month No Ads", price: "₹99 / $1.19 USD", tag: "STARTER" },
                  { duration: "4 Month No Ads", price: "₹149", tag: "STANDARD" },
                  { duration: "6 Month No Ads", price: "₹199 / $2.39 USD", tag: "BEST VALUE" },
                  { duration: "1 Year No Ads", price: "₹249 / $2.99 USD", tag: "MOST POPULAR", highlight: true },
                  { duration: "Lifetime No Ads", price: "₹2999 / $35.99 USD", tag: "ULTIMATE CHAMPION" },
                ].map((pkg, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      audio.playClick();
                      setCheckoutItem({
                        title: pkg.duration,
                        price: pkg.price,
                        icon: "🚫",
                        desc: `Seamless ${pkg.duration} Ad-free VIP Pass`
                      });
                      setCheckoutError(null);
                    }}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                      pkg.highlight
                        ? 'bg-rose-500 border-rose-400 text-white shadow-md active:translate-y-0.5'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-350'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded ${
                        pkg.highlight ? 'bg-amber-400 text-neutral-900 border border-white/20' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {pkg.tag}
                      </span>
                      <span className="text-[11px] font-black font-sans uppercase tracking-tight">{pkg.duration}</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-mono font-black tracking-wide bg-white/15 px-2 py-1 rounded-xl whitespace-nowrap">
                      {pkg.price.replace(" USD", "")}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-center">
                <button
                  onClick={() => { audio.playClick(); setShowNoAdsModal(false); }}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase cursor-pointer"
                >
                  CLOSE OPTIONS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Restart Progress Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirmModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-[6px] z-[99999] flex items-center justify-center p-4 select-none text-slate-800">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border-4 border-amber-400 rounded-3xl w-full max-w-md overflow-hidden flex flex-col p-6 gap-4 relative shadow-[0_12px_45px_rgba(245,158,11,0.4)]"
            >
              <div className="text-center">
                <div className="inline-block bg-amber-500 text-white font-mono font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                  ⚠️ CONFIRMATION REQUIRED
                </div>
                <h2 className="text-xl font-black font-display text-amber-600 uppercase tracking-tight select-none">
                  Reset Progress Options
                </h2>
                <p className="text-[11px] text-slate-500 font-bold leading-normal mt-1 px-1">
                  Choose which part of your game progress you would like to reset.
                </p>
              </div>

              <div className="flex flex-col gap-3.5 my-1 overflow-y-auto max-h-[360px] pr-1">
                {/* 1. LEVEL RESET */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col gap-2">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase">
                      <span>🏆</span> Level Progress
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold mt-0.5">
                      Resets your gameplay back to <strong>Level 1</strong> and resets / awards you <strong>1,000 Coins</strong> to start fresh!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      audio.playWin();
                      setShowResetConfirmModal(false);
                      setShowHomeSettingsMenu(false);
                      setCurrentLevel(1);
                      setMaxUnlockedLevel(1);
                      setCoins(1000);
                      localStorage.setItem('water_sort_level', '1');
                      localStorage.setItem('water_sort_max_unlocked', '1');
                      localStorage.setItem('water_sort_coins', '1000');
                      setStatus('home');
                      setClaimedReward("🔄 LEVEL PROGRESS RESET!\nStarted cleanly from Level 1 with 1,000 Coins.");
                      setShowClaimModal(true);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-xl text-[10px] uppercase cursor-pointer border-b-2 border-orange-700 transition active:translate-y-0.5"
                  >
                    RESET LEVEL & GET 1000 COINS
                  </button>
                </div>

                {/* 2. SKIN RESET */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col gap-2">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase">
                      <span>🎨</span> Custom Skins
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold mt-0.5">
                      Locks all acquired skins, resets custom skin ad watch progress, and equips the default clear look.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      audio.playWin();
                      setShowResetConfirmModal(false);
                      setShowHomeSettingsMenu(false);
                      setUnlockedSkins(['skin_none']);
                      setActiveSkinId('skin_none');
                      setActiveSkinGlowColor(undefined);
                      setSkinAdProgress({});
                      localStorage.setItem('water_sort_unlocked_skins', JSON.stringify(['skin_none']));
                      localStorage.setItem('water_sort_active_skin_id', 'skin_none');
                      localStorage.removeItem('water_sort_active_skin_glow');
                      localStorage.removeItem('water_sort_skin_ad_progress');
                      setClaimedReward("🔄 SKIN PROGRESS RESET!\nAll custom skins have been locked successfully.");
                      setShowClaimModal(true);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-black rounded-xl text-[10px] uppercase cursor-pointer border-b-2 border-blue-700 transition active:translate-y-0.5"
                  >
                    RESET CUSTOM SKINS
                  </button>
                </div>

                {/* 3. BOTTLE/VESSEL RESET */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col gap-2">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase">
                      <span>🧪</span> Bottle Vessels
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold mt-0.5">
                      Locks all unlocked bottle vessel shapes and equips the standard glass tube.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      audio.playWin();
                      setShowResetConfirmModal(false);
                      setShowHomeSettingsMenu(false);
                      setUnlockedVessels(['standard']);
                      setActiveVesselStyle('standard');
                      localStorage.setItem('water_sort_unlocked_vessels', JSON.stringify(['standard']));
                      localStorage.setItem('water_sort_active_vessel', 'standard');
                      setClaimedReward("🔄 BOTTLE SHAPES RESET!\nDefault testing tube style equipped & custom vessels locked.");
                      setShowClaimModal(true);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-black rounded-xl text-[10px] uppercase cursor-pointer border-b-2 border-indigo-700 transition active:translate-y-0.5"
                  >
                    RESET BOTTLE SHAPES
                  </button>
                </div>

                {/* 4. ALL GAME RESET */}
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-150 flex flex-col gap-2">
                  <div>
                    <h3 className="text-xs font-black text-rose-800 flex items-center gap-1.5 uppercase">
                      <span>🔥</span> RESET ALL GAME PROGRESS
                    </h3>
                    <p className="text-[10px] text-rose-700 leading-relaxed font-bold mt-0.5">
                      Wipes everything! Level resets to 1, Coins set to 1000, all skins and bottle vessels locked to standard defaults.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      audio.playCelebration();
                      setShowResetConfirmModal(false);
                      setShowHomeSettingsMenu(false);
                      
                      // Reset Levels
                      setCurrentLevel(1);
                      setMaxUnlockedLevel(1);
                      setCoins(1000);
                      localStorage.setItem('water_sort_level', '1');
                      localStorage.setItem('water_sort_max_unlocked', '1');
                      localStorage.setItem('water_sort_coins', '1000');
                      
                      // Reset Skins
                      setUnlockedSkins(['skin_none']);
                      setActiveSkinId('skin_none');
                      setActiveSkinGlowColor(undefined);
                      setSkinAdProgress({});
                      localStorage.setItem('water_sort_unlocked_skins', JSON.stringify(['skin_none']));
                      localStorage.setItem('water_sort_active_skin_id', 'skin_none');
                      localStorage.removeItem('water_sort_active_skin_glow');
                      localStorage.removeItem('water_sort_skin_ad_progress');

                      // Reset Bottles/Vessels
                      setUnlockedVessels(['standard']);
                      setActiveVesselStyle('standard');
                      localStorage.setItem('water_sort_unlocked_vessels', JSON.stringify(['standard']));
                      localStorage.setItem('water_sort_active_vessel', 'standard');

                      setStatus('home');
                      setClaimedReward("🔥 ALL-IN-ONE SYSTEM RESET COMPLETE!\nClean restart initiated: Level 1, 1,000 Coins, locked skins, & default bottles.");
                      setShowClaimModal(true);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black rounded-xl text-[10px] uppercase cursor-pointer border-b-2 border-red-900 transition active:translate-y-0.5 animate-pulse"
                  >
                    🔥 YES, RESET EVERY PROGRESS
                  </button>
                </div>
              </div>

              <div className="mt-1">
                <button
                  onClick={() => {
                    audio.playClick();
                    setShowResetConfirmModal(false);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase cursor-pointer border-b-2 border-slate-300 transition active:translate-y-0.5 text-center block"
                >
                  NO, KEEP MY PROGRESS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🌌 Exclusive Premium Skin Purchase Modal */}
      <AnimatePresence>
        {showPremiumSkinPurchaseModal && selectedPremiumSkin && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-[8px] z-[99999] flex items-center justify-center p-4 select-none text-slate-100">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="bg-neutral-900 border-4 border-amber-400 rounded-[32px] w-full max-w-sm p-6 relative shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500" />
              
              <div className="inline-block bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-mono font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-wider mb-4 shadow">
                 Exclusive Premium Skin
              </div>
              
              <h2 className="text-2xl font-black font-display tracking-tight text-white uppercase leading-none">
                {selectedPremiumSkin.name}
              </h2>
              
              {/* Special Animated Aura Preview Circle */}
              <div className="my-6 relative w-28 h-28 rounded-full border-2 border-neutral-700 bg-neutral-950/60 flex items-center justify-center shadow-inner overflow-hidden">
                <div 
                  className="absolute inset-2 rounded-full opacity-20 animate-pulse duration-[3s]"
                  style={{
                    boxShadow: `0 0 35px 15px ${selectedPremiumSkin.color}`,
                    backgroundColor: selectedPremiumSkin.color
                  }}
                />
                
                {/* Glowing test bottle visual */}
                <div className="w-10 h-16 bg-slate-900 rounded-xl border border-white/20 p-1 flex items-center justify-center relative z-10">
                  <svg className="w-8 h-12 overflow-visible" viewBox="0 0 100 300">
                    <path
                      d="M 32,15 L 68,15 L 68,245 C 68,274 58,290 50,290 C 42,290 32,274 32,245 Z"
                      fill="rgba(30,30,40,0.5)"
                      stroke={selectedPremiumSkin.color}
                      strokeWidth="24"
                      style={{ filter: `drop-shadow(0 0 10px ${selectedPremiumSkin.color})` }}
                    />
                  </svg>
                </div>
              </div>

              <p className="text-[11px] text-slate-350 leading-relaxed font-sans px-2 mb-1.5">
                {selectedPremiumSkin.desc}
              </p>

              <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-3 w-full my-3 flex flex-col gap-1 items-center justify-center">
                <span className="text-[9px] font-bold text-slate-500 font-mono uppercase tracking-widest leading-none">Price Package</span>
                <span className="text-xl font-mono font-black text-amber-400 tracking-wide mt-1.5 leading-none">
                  {selectedPremiumSkin.priceInRupees} / {selectedPremiumSkin.priceInDollars}
                </span>
              </div>

              <div className="flex flex-col gap-2 w-full mt-3">
                <button
                  onClick={() => {
                    audio.playClick();
                    setShowPremiumSkinPurchaseModal(false);
                    setCheckoutItem({
                      title: `Exclusive Skin: ${selectedPremiumSkin.name}`,
                      price: `${selectedPremiumSkin.priceInRupees} / ${selectedPremiumSkin.priceInDollars}`,
                      icon: "🎨",
                      desc: selectedPremiumSkin.desc || "Lifetime Elite Glowing Vessel Aura"
                    });
                    setCheckoutError(null);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 font-black rounded-2xl text-xs uppercase cursor-pointer border-b-4 border-amber-700 transition active:translate-y-0.5 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5"
                >
                  💳 AUTHORIZE PAY: {selectedPremiumSkin.priceInRupees}
                </button>

                <button
                  onClick={() => {
                    audio.playClick();
                    setShowPremiumSkinPurchaseModal(false);
                  }}
                  className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-slate-300 font-bold rounded-[18px] text-[10px] uppercase cursor-pointer border border-neutral-700 transition"
                >
                  CANCEL TRANSACTION
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 💳 SIMULATED GOOGLE PLAY STORE CHECKOUT MODAL (Fake Payment Refusal) */}
      <AnimatePresence>
        {checkoutItem && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[999999] flex items-center justify-center p-4 select-none animate-fadeIn">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border-2 border-slate-700 text-white rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative font-sans text-left"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-850 px-5 py-4 border-b border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛡️</span>
                  <div>
                    <h3 className="text-xs font-black tracking-wider uppercase text-slate-200">Google Play Simulated Checkout</h3>
                    <p className="text-[9px] text-slate-400 font-mono">Sandboxed Payment Gateway</p>
                  </div>
                </div>
                <button
                  onClick={() => { audio.playClick(); setCheckoutItem(null); setCheckoutError(null); }}
                  className="w-7 h-7 rounded-full bg-slate-700/60 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Item Summary */}
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 flex items-center gap-3.5 shadow-inner">
                  <span className="text-3xl filter drop-shadow">{checkoutItem.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wide">{checkoutItem.title}</h4>
                    <p className="text-[9.5px] text-slate-300 leading-normal mt-0.5">{checkoutItem.desc}</p>
                    <div className="mt-1.5 inline-block bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[9.5px] px-2 py-0.5 rounded-lg">
                      {checkoutItem.price}
                    </div>
                  </div>
                </div>

                {/* Account details */}
                <div className="space-y-2 bg-slate-850/50 rounded-xl p-3 border border-slate-800 text-[10px]">
                  <div className="flex justify-between text-slate-400 font-mono">
                    <span>Account:</span>
                    <span className="text-slate-200">mehergalaxy001@gmail.com</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-mono">
                    <span>Payment Method:</span>
                    <span className="text-sky-400 font-bold flex items-center gap-1">📱 Google Pay Balance</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-mono">
                    <span>Demo Sandboxing:</span>
                    <span className="text-amber-400 font-bold">Preview Environment</span>
                  </div>
                </div>

                {/* Error / Refusal Message when BUY clicked */}
                {checkoutError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-rose-500/20 border-2 border-rose-500/60 rounded-2xl p-3 text-center text-rose-200 text-[10.5px] font-bold leading-relaxed whitespace-pre-line shadow-lg font-mono"
                  >
                    {checkoutError}
                  </motion.div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="p-4 pt-0 flex gap-2.5">
                <button
                  onClick={() => { audio.playClick(); setCheckoutItem(null); setCheckoutError(null); }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-2xl text-[10px] uppercase tracking-wider transition border border-slate-700 active:scale-95 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    audio.playClick();
                    setCheckoutError("❌ PURCHASE REFUSED (DEMO MODE):\n\nReal money transactions (Coins & No Ads packages) cannot be purchased in this preview version.");
                  }}
                  className="flex-[1.5] py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black rounded-2xl text-[11px] uppercase tracking-wider transition shadow-lg shadow-emerald-900/40 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>🔒</span>
                  <span>1-TAP BUY</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
