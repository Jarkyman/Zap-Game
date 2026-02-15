
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, UserStats, LevelData, ThemeMode } from './utils/types';
import GameBoard from './components/GameBoard';
import LevelMenu from './components/LevelMenu';
import DailyView from './components/DailyView';
import WinningSplash from './components/WinningSplash';
import ShopView from './components/ShopView';
import SettingsView from './components/SettingsView';
import { generateLevel } from './utils/levelGenerator';
import { fetchLevelSet, fetchLevelRegistry } from './data/levels';
import { LevelRegistryEntry } from './utils/levelLoader';
import { Trophy, Calendar, LayoutGrid, Play, Star, Loader2, Globe, Check, ShoppingBag, ArrowLeft, RotateCcw, Settings, Sparkles, Flame, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, LANGUAGES, translations } from './utils/translations';
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isDailyWin, setIsDailyWin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registry, setRegistry] = useState<LevelRegistryEntry[]>([]);
  const [earnedStars, setEarnedStars] = useState(1);
  const [retryKey, setRetryKey] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('zip_stats_v8'); 
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error("Failed to parse stats", e); }
    }
    const browserLang = navigator.language.split('-')[0] as any;
    const defaultLang = LANGUAGES.find(l => l.code === browserLang) ? browserLang : 'en';

    return { 
      completedLevels: {}, 
      dailyStreak: 0, 
      lastDailyDate: null, 
      stars: 0,
      hints: 5,
      language: defaultLang,
      theme: 'system'
    };
  });

  const t = (key: string) => translations[stats.language][key] || translations['en'][key] || key;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      const diff = tomorrow.getTime() - now.getTime();
      if (diff <= 0) return '00:00:00';
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      return [hours, minutes, seconds].map(v => v.toString().padStart(2, '0')).join(':');
    };

    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    setTimeLeft(calculateTimeLeft());
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = stats.theme === 'dark' || 
      (stats.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [stats.theme]);

  const [activeSetId, setActiveSetId] = useState<string>("");
  const [activeLevelIndex, setActiveLevelIndex] = useState<number>(0);
  const [currentLevels, setCurrentLevels] = useState<LevelData[]>([]);
  const [showWin, setShowWin] = useState(false);

  useEffect(() => {
    const loadRegistry = async () => {
      const reg = await fetchLevelRegistry();
      setRegistry(reg);
      if (reg.length > 0 && !activeSetId) setActiveSetId(reg[0].id);
    };
    loadRegistry();
  }, []);

  useEffect(() => {
    const load = async () => {
      const entry = registry.find(r => r.id === activeSetId);
      if (!entry) return;
      
      setIsLoading(true);
      const data = await fetchLevelSet(entry);
      if (data) {
        setCurrentLevels(data.levels);
      } else {
        setCurrentLevels([]);
      }
      setIsLoading(false);
    };
    if (activeSetId && (currentView === 'game' || currentView === 'levels')) {
      load();
    }
  }, [activeSetId, currentView, registry]);

  useEffect(() => {
    localStorage.setItem('zip_stats_v8', JSON.stringify(stats));
  }, [stats]);

  const memoizedLevel = useMemo(() => {
    if (currentView === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      return generateLevel(9999 + parseInt(today.replace(/-/g, '')) % 1000, 5, 5);
    }
    return currentLevels[activeLevelIndex];
  }, [activeLevelIndex, currentView, currentLevels]);

  const triggerConfetti = () => {
    const defaults = { startVelocity: 45, spread: 70, ticks: 60, zIndex: 100, particleCount: 60 };
    confetti({ ...defaults, angle: 60, origin: { x: 0, y: 1 }, colors: ['#FF8FAB', '#8ECAE6', '#B7E4C7', '#FFD166'] });
    confetti({ ...defaults, angle: 120, origin: { x: 1, y: 1 }, colors: ['#FF8FAB', '#8ECAE6', '#B7E4C7', '#FFD166'] });
  };

  const handleLevelComplete = useCallback((stars: number) => {
    triggerConfetti();
    const isDaily = currentView === 'daily';
    setIsDailyWin(isDaily);
    setEarnedStars(stars);

    if (!isDaily) {
      setStats(prev => {
        const currentCategory = prev.completedLevels[activeSetId] || {};
        const oldStars = currentCategory[activeLevelIndex] || 0;
        const newStars = Math.max(oldStars, stars);
        const starsToAdd = Math.max(0, newStars - oldStars);

        return {
          ...prev,
          completedLevels: { 
            ...prev.completedLevels, 
            [activeSetId]: { ...currentCategory, [activeLevelIndex]: newStars } 
          },
          stars: prev.stars + starsToAdd
        };
      });
      
      setTimeout(() => {
        setShowWin(true);
      }, 500);
    }
  }, [activeSetId, activeLevelIndex, currentView]);

  const nextLevel = () => {
    setShowWin(false);
    setRetryKey(0);
    if (isDailyWin) {
      setCurrentView('home');
    } else {
      if (activeLevelIndex < currentLevels.length - 1) {
        setActiveLevelIndex(activeLevelIndex + 1);
      } else {
        const currentIndex = registry.findIndex(r => r.id === activeSetId);
        if (currentIndex < registry.length - 1) {
          setActiveSetId(registry[currentIndex + 1].id);
          setActiveLevelIndex(0);
        } else {
          setCurrentView('levels');
        }
      }
    }
  };

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
    setShowWin(false);
  };

  const handleUpdateStats = (updates: Partial<UserStats>) => {
    setStats(prev => ({ ...prev, ...updates }));
  };

  const useHint = (cost: number) => {
    if (stats.hints >= cost) {
      setStats(prev => ({ ...prev, hints: prev.hints - cost }));
      return true;
    }
    return false;
  };

  const isTodayDailyDone = useMemo(() => {
    return currentView === 'daily' && stats.lastDailyDate === new Date().toISOString().split('T')[0];
  }, [currentView, stats.lastDailyDate]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-between overflow-hidden text-[#4A4E69] dark:text-gray-200 select-none transition-colors duration-500">
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-between py-6 px-8 w-full max-w-md relative"
          >
            <div className="w-full flex justify-end">
              <button 
                onClick={() => setCurrentView('settings')}
                className="p-2.5 bg-white/80 dark:bg-[#2A2A4E] rounded-2xl shadow-sm active:scale-95 transition-all text-pink-400 border border-transparent dark:border-white/5"
              >
                <Settings size={22} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-8 sm:gap-12 w-full">
              <motion.div 
                animate={{ rotate: [0, 3, -3, 0] }} 
                transition={{ repeat: Infinity, duration: 4 }} 
                className="text-7xl sm:text-8xl font-black text-pink-400 drop-shadow-xl"
              >
                ZIP
              </motion.div>

              <button 
                onClick={() => setCurrentView('levels')} 
                className="group relative w-full aspect-square max-h-[25vh] max-w-[140px] sm:max-w-[180px] flex items-center justify-center rounded-full bg-pink-400 text-white shadow-xl hover:scale-105 transition-transform active:scale-95"
              >
                <Play size={64} fill="currentColor" className="ml-1.5 sm:ml-2" />
                <div className="absolute inset-0 rounded-full border-4 border-pink-200 animate-ping opacity-20" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full px-2 mt-4">
              <NavCard 
                icon={<ShoppingBag size={20} />} 
                label={t('shop')} 
                onClick={() => setCurrentView('shop')} 
                color="bg-blue-100 dark:bg-blue-900/30"
                badge={
                  <div className="flex items-center gap-0.5">
                    <Star size={10} fill="#FACC15" className="text-yellow-400" />
                    <span>{stats.stars}</span>
                  </div>
                }
                badgeColor="text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500/20"
              />
              
              <button 
                onClick={() => setCurrentView('daily')} 
                className="bg-green-100 dark:bg-green-900/30 h-20 sm:h-24 rounded-[1.75rem] flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md transition-all active:scale-95 border border-transparent dark:border-white/5 relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-white/70 dark:bg-black/40 px-1.5 py-0.5 rounded-full shadow-sm border border-orange-100 dark:border-orange-500/20">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Flame size={10} fill="#F97316" className="text-orange-500" />
                  </motion.div>
                  <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 tabular-nums">{stats.dailyStreak}</span>
                </div>

                <div className="text-pink-400">
                  <Calendar size={20} />
                </div>
                
                <div className="flex flex-col items-center">
                  <span className="font-black text-[11px] text-green-700 dark:text-green-300 uppercase tracking-widest leading-none">{t('daily')}</span>
                  <div className="tabular-nums flex items-center gap-1 text-[8px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                    <Clock size={7} /> {timeLeft}
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {(currentView === 'game' || currentView === 'daily') && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 w-full h-full flex flex-col">
            <div className="p-4 flex items-center justify-between">
              <button 
                onClick={() => setCurrentView(currentView === 'daily' ? 'home' : 'levels')} 
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#2A2A4E] rounded-2xl shadow-sm hover:shadow-md active:scale-90 transition-all text-pink-400 border border-transparent dark:border-white/5"
              >
                <ArrowLeft size={20} />
                <span className="text-[10px] font-black uppercase">{t('back')}</span>
              </button>
              
              <div className="flex flex-col items-center">
                <div className="text-[9px] font-bold text-pink-300 uppercase tracking-widest leading-none mb-1">
                  {currentView === 'daily' ? t('challenge') : memoizedLevel?.grid}
                </div>
                <div className="text-base font-black text-pink-500 uppercase leading-none">
                  {currentView === 'daily' ? t('daily').toUpperCase() : `${t('level').toUpperCase()} ${activeLevelIndex + 1}`}
                </div>
              </div>

              {/* Retry button hidden if Daily is finished */}
              <div className="min-w-[70px] flex justify-end">
                {!isTodayDailyDone && (
                  <button 
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#2A2A4E] rounded-2xl shadow-sm hover:shadow-md active:scale-90 transition-all text-pink-400 border border-transparent dark:border-white/5"
                  >
                    <RotateCcw size={20} />
                    <span className="text-[10px] font-black uppercase">{t('retry')}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="px-4 mb-2 flex justify-center gap-4">
              <div className="flex items-center gap-1 bg-pink-50/50 dark:bg-pink-900/20 px-3 py-1 rounded-full border border-pink-100 dark:border-pink-500/20">
                <Star size={12} fill="#FACC15" className="text-yellow-400" />
                <span className="text-xs font-black text-pink-500 dark:text-pink-400">{stats.stars}</span>
              </div>
              <div className="flex items-center gap-1 bg-indigo-50/50 dark:bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                <Sparkles size={12} fill="#818CF8" className="text-indigo-400" />
                <span className="text-xs font-black text-indigo-500 dark:text-indigo-400">{stats.hints}</span>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-pink-400" size={40} />
                  <p className="font-bold text-pink-300">{t('loading')}</p>
                </div>
              ) : memoizedLevel ? (
                currentView === 'daily' ? (
                  <DailyView 
                    key={`daily-${retryKey}`}
                    stats={stats}
                    level={memoizedLevel}
                    onBack={() => setCurrentView('home')}
                    onComplete={() => {
                      const today = new Date().toISOString().split('T')[0];
                      const isNewDay = stats.lastDailyDate !== today;
                      setStats(s => ({
                        ...s,
                        dailyStreak: isNewDay ? s.dailyStreak + 1 : s.dailyStreak,
                        lastDailyDate: today,
                        stars: s.stars + (isNewDay ? 3 : 0) 
                      }));
                      handleLevelComplete(3); 
                    }}
                    onUseHint={useHint}
                    t={t}
                    timeLeft={timeLeft}
                  />
                ) : (
                  <div className="p-4 w-full flex justify-center max-h-full">
                    <GameBoard 
                      key={`${activeSetId}-${activeLevelIndex}-${retryKey}`}
                      level={memoizedLevel} 
                      onWin={handleLevelComplete} 
                      stats={stats}
                      onUseHint={useHint}
                      t={t} 
                    />
                  </div>
                )
              ) : (
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-3xl text-red-400 font-bold">
                  {t('error_load')}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {currentView === 'levels' && (
          <LevelMenu 
            stats={stats} 
            registry={registry}
            activeSetId={activeSetId}
            onPackSelect={setActiveSetId}
            onSelect={(id, idx) => { 
              setActiveSetId(id); 
              setActiveLevelIndex(idx); 
              setRetryKey(0);
              setCurrentView('game'); 
            }} 
            onBack={() => {
              if (activeSetId) setActiveSetId("");
              else setCurrentView('home');
            }} 
            t={t}
          />
        )}

        {currentView === 'shop' && (
          <ShopView 
            stats={stats} 
            onBack={() => setCurrentView('home')} 
            t={t}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView 
            stats={stats} 
            onUpdateStats={handleUpdateStats}
            onBack={() => setCurrentView('home')} 
            t={t}
          />
        )}
      </AnimatePresence>

      {showWin && !isDailyWin && (
        <WinningSplash 
          onNext={nextLevel} 
          onRetry={handleRetry}
          onBack={() => { setShowWin(false); setCurrentView('levels'); }} 
          levelId={activeLevelIndex + 1} 
          earnedStars={earnedStars}
          t={t}
        />
      )}
    </div>
  );
};

const NavCard = ({ icon, label, onClick, color, badge, badgeColor }: { icon: React.ReactNode, label: string, onClick: () => void, color: string, badge?: React.ReactNode, badgeColor?: string }) => (
  <button onClick={onClick} className={`${color} h-20 sm:h-24 rounded-[1.75rem] flex flex-col items-center justify-center gap-0.5 shadow-sm hover:shadow-md transition-all active:scale-95 border border-transparent dark:border-white/5 relative overflow-hidden`}>
    {badge && (
      <div className={`absolute top-2 right-2 flex items-center gap-0.5 bg-white/70 dark:bg-black/40 px-1.5 py-0.5 rounded-full shadow-sm border ${badgeColor || ''}`}>
        <span className="text-[9px] font-black tabular-nums">{badge}</span>
      </div>
    )}
    <div className="text-pink-400 mb-0.5">{icon}</div>
    <span className="font-black text-[10px] dark:text-gray-300 uppercase tracking-widest leading-none">{label}</span>
  </button>
);

export default App;
