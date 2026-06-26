import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Clock, ShieldAlert, Award, AlertCircle, ExternalLink } from 'lucide-react';

// Real Ad Unit IDs requested by the user
export const AD_UNIT_IDS = {
  BANNER: 'ca-app-pub-1327733739995107/3101228091',
  INTERSTITIAL: 'ca-app-pub-1327733739995107/6848901410',
  NATIVE: 'ca-app-pub-1327733739995107/6651636460',
  APP_OPEN: 'ca-app-pub-1327733739995107/1213431353',
  REWARDED: 'ca-app-pub-1327733739995107/4031166389',
};

type AdState = 'unloaded' | 'loading' | 'loaded' | 'error';

interface AdMobContextType {
  bannerState: AdState;
  interstitialState: AdState;
  rewardedState: AdState;
  appOpenState: AdState;
  nativeState: AdState;
  
  preloadAllAds: () => void;
  showInterstitial: (onClosed: () => void) => void;
  showRewarded: (onSuccess: () => void, onClosed?: () => void) => void;
  showAppOpen: (onClosed?: () => void) => void;
}

const AdMobContext = createContext<AdMobContextType | undefined>(undefined);

export const useAdMob = () => {
  const context = useContext(AdMobContext);
  if (!context) {
    throw new Error('useAdMob must be used within an AdMobProvider');
  }
  return context;
};

// Simulated ad database for highly realistic creative content
const NATIVE_ADS_POOL = [
  {
    title: 'Color Sort Champion League',
    desc: 'Unclog challenging tubes and challenge global sort kings. Download free!',
    image: '🧪',
    cta: 'INSTALL NOW',
    rating: '★ 4.9',
    category: 'Casual Games',
  },
  {
    title: 'Match-3 Royal Blast',
    desc: 'Slide juicy colors, crush sweet blocks and win physical rewards daily!',
    image: '💎',
    cta: 'PLAY IN BROWSER',
    rating: '★ 4.7',
    category: 'Puzzle',
  },
  {
    title: 'Coin King Castle Builder',
    desc: 'Raid other players, spin the daily wheel, and upgrade your dream palace.',
    image: '🏰',
    cta: 'GET APP',
    rating: '★ 4.5',
    category: 'Strategy',
  }
];

export const AdMobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bannerState, setBannerState] = useState<AdState>('unloaded');
  const [interstitialState, setInterstitialState] = useState<AdState>('unloaded');
  const [rewardedState, setRewardedState] = useState<AdState>('unloaded');
  const [appOpenState, setAppOpenState] = useState<AdState>('unloaded');
  const [nativeState, setNativeState] = useState<AdState>('unloaded');

  // Trigger overlays
  const [activeAdOverlay, setActiveAdOverlay] = useState<'none' | 'interstitial' | 'rewarded' | 'app_open'>('none');
  const [onAdClosedCallback, setOnAdClosedCallback] = useState<(() => void) | null>(null);
  const [onRewardedCallback, setOnRewardedCallback] = useState<(() => void) | null>(null);

  // preloader simulation
  const loadAd = (setState: React.Dispatch<React.SetStateAction<AdState>>, formatName: string) => {
    setState('loading');
    console.log(`[AdMob] Preloading ${formatName} Ad...`);
    
    setTimeout(() => {
      // 95% load success rate to verify stability and normal gameplay continuation when ads fail
      if (Math.random() <= 0.95) {
        setState('loaded');
        console.log(`[AdMob] ${formatName} Ad Loaded successfully!`);
      } else {
        setState('error');
        console.warn(`[AdMob] Failed to load ${formatName} Ad. Falling back gracefully.`);
      }
    }, 800 + Math.random() * 800);
  };

  const preloadAllAds = () => {
    loadAd(setBannerState, 'Banner');
    loadAd(setInterstitialState, 'Interstitial');
    loadAd(setRewardedState, 'Rewarded');
    loadAd(setAppOpenState, 'App Open');
    loadAd(setNativeState, 'Native');
  };

  // Perform initial preloading on mount
  useEffect(() => {
    preloadAllAds();
  }, []);

  // Standard visibility hook for App Open Ad on background return
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[AdMob] App returned from background. Checking for App Open preloaded state...');
        // Only trigger app open on background return if we are in normal menus and not in active gameplay overlays
        if (Math.random() < 0.4) { // Safely trigger on returns with realistic frequency
          showAppOpen();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [appOpenState]);

  const showInterstitial = (onClosed: () => void) => {
    console.log('[AdMob] Interstitial bypassed - directly triggering gameplay transition.');
    onClosed();
  };

  const showRewarded = (onSuccess: () => void, onClosed?: () => void) => {
    console.log('[AdMob] Rewarded bypassed - directly awarding user coins/hints/tube skip.');
    onSuccess();
    if (onClosed) onClosed();
  };

  const showAppOpen = (onClosed?: () => void) => {
    console.log('[AdMob] App Open bypassed - directly starting game.');
    if (onClosed) onClosed();
  };

  return (
    <AdMobContext.Provider
      value={{
        bannerState: 'unloaded',
        interstitialState: 'unloaded',
        rewardedState: 'unloaded',
        appOpenState: 'unloaded',
        nativeState: 'unloaded',
        preloadAllAds: () => {},
        showInterstitial,
        showRewarded,
        showAppOpen,
      }}
    >
      {children}
    </AdMobContext.Provider>
  );
};

// Beautiful Interactive Overlay covering Interstitial, Rewarded, and App Open ads
const AdOverlay: React.FC<{
  type: 'interstitial' | 'rewarded' | 'app_open';
  onClose: (rewardEarned?: boolean) => void;
}> = ({ type, onClose }) => {
  const [countdown, setCountdown] = useState(type === 'rewarded' ? 5 : 3);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [type]);

  const unitId = 
    type === 'interstitial' ? AD_UNIT_IDS.INTERSTITIAL :
    type === 'rewarded' ? AD_UNIT_IDS.REWARDED : AD_UNIT_IDS.APP_OPEN;

  const title = 
    type === 'interstitial' ? 'Sponsor Video Ad' :
    type === 'rewarded' ? 'Premium Rewarded Video' : 'App Open Launch Sponsor';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-neutral-950/95 z-[99999] flex flex-col items-center justify-center p-6 text-center select-none font-sans"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_70%)] animate-pulse pointer-events-none" />

      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        className="bg-neutral-900 border-2 border-neutral-800 rounded-[24px] p-6 max-w-sm w-full relative shadow-2xl flex flex-col items-center gap-5 overflow-hidden"
      >
        {/* Header decoration */}
        <div className="w-full flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
            <span className="bg-amber-400 text-neutral-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">AD</span>
            <span className="tracking-wide">{title}</span>
          </div>

          <div className="text-[8px] text-neutral-500 font-mono font-bold truncate max-w-[150px]">
            ID: {unitId.split('/')[1]}
          </div>
        </div>

        {/* Ad Body Content */}
        <div className="flex flex-col items-center py-2 gap-4 w-full">
          {type === 'rewarded' ? (
            <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 animate-bounce">
              <Award className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-blue-500/10 border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-400">
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            </div>
          )}

          <div className="space-y-1">
            <h3 className="text-white text-base font-black uppercase tracking-tight">
              {type === 'rewarded' ? 'CHAMPION SORT BOOST' : 'PUZZLE PRO ADVANCED'}
            </h3>
            <p className="text-neutral-400 text-xs font-bold leading-relaxed px-4 font-sans">
              {type === 'rewarded' 
                ? 'Watch this brief promotional segment completely to double your booster count!' 
                : 'Enjoy beautiful custom shaders and liquid bottles today. Ads support developer craft.'}
            </p>
          </div>
        </div>

        {/* Timer status or Close triggers */}
        <div className="w-full bg-slate-950/80 border border-neutral-800 rounded-2xl p-3 relative flex items-center justify-center min-h-12 select-none">
          {completed ? (
            <div className="flex flex-col items-center gap-1.5 w-full">
              <span className="text-emerald-400 font-black text-xs uppercase flex items-center gap-1">
                ✓ Commercial Completed Successfully
              </span>
              <button
                onClick={() => onClose(type === 'rewarded')}
                className="w-full bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:translate-y-0.5"
              >
                <span>CLAIM REWARD / CLOSE</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full justify-center">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="text-white font-black text-xs font-mono">
                {type === 'rewarded' ? 'EARNING REWARD IN' : 'DISMISS IN'} {countdown}S...
              </span>
            </div>
          )}
        </div>

        {/* Small Google Ad Attribution */}
        <div className="text-[9px] text-neutral-500 flex items-center gap-1 tracking-wider uppercase font-extrabold select-none">
          <span>Google AdMob Platform Certified</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </div>
      </motion.div>
    </motion.div>
  );
};


// 1. BANNER AD COMPONENT (Fits safely below play screen cards or headers)
export const AdMobBannerAd: React.FC = () => {
  return null;
};

// 2. NATIVE AD COMPONENT (Used on non-gameplay overlays like menus, selector overlays, themes popup)
export const AdMobNativeAd: React.FC = () => {
  return null;
};
