
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, ChevronRight, Loader2, Trophy, Lock } from 'lucide-react';
import { UserStats, LevelData } from '../utils/types';
import { fetchLevelSet } from '../data/levels';
import { LevelRegistryEntry } from '../utils/levelLoader';

interface LevelMenuProps {
  stats: UserStats;
  registry: LevelRegistryEntry[];
  activeSetId: string;
  onPackSelect: (id: string) => void;
  onSelect: (id: string, index: number) => void;
  onBack: () => void;
  t: (key: string) => string;
}

const LevelMenu: React.FC<LevelMenuProps> = ({ stats, registry, activeSetId, onPackSelect, onSelect, onBack, t }) => {
  const [categoryLevels, setCategoryLevels] = useState<LevelData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [levelCounts, setLevelCounts] = useState<Record<string, number>>({});

  const selectedEntry = useMemo(() => 
    registry.find(r => r.id === activeSetId) || null
  , [registry, activeSetId]);

  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      for (const entry of registry) {
        const data = await fetchLevelSet(entry);
        if (data) {
          counts[entry.id] = data.levels.length;
        }
      }
      setLevelCounts(counts);
    };
    fetchCounts();
  }, [registry]);

  useEffect(() => {
    if (selectedEntry) {
      const load = async () => {
        setIsLoading(true);
        const data = await fetchLevelSet(selectedEntry);
        if (data) {
          setCategoryLevels(data.levels);
        } else {
          setCategoryLevels([]);
        }
        setIsLoading(false);
      };
      load();
    }
  }, [selectedEntry]);

  const getPackName = (entry: LevelRegistryEntry) => {
    return entry.name[stats.language] || entry.name['en'] || entry.id;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 w-full flex flex-col p-6 bg-[#FDFCFD] dark:bg-[#1A1A2E] overflow-hidden transition-colors duration-500"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-white dark:bg-[#2A2A4E] rounded-xl shadow-sm active:scale-90 transition-transform border border-transparent dark:border-white/5">
          <ArrowLeft size={24} className="text-pink-500" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-pink-500 uppercase tracking-tight">
          {selectedEntry ? getPackName(selectedEntry) : t('levels').toUpperCase()}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="wait">
          {!selectedEntry ? (
            <motion.div 
              key="sets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 gap-4 pb-12"
            >
              {registry.map(entry => {
                const completedData = stats.completedLevels[entry.id] || {};
                const completedCount = Object.keys(completedData).length;
                const totalCount = levelCounts[entry.id] || 0;
                const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

                return (
                  <button
                    key={entry.id}
                    onClick={() => onPackSelect(entry.id)}
                    className="group relative w-full p-6 rounded-[2.5rem] bg-white dark:bg-[#2A2A4E] border-2 border-pink-50 dark:border-white/5 shadow-sm hover:border-pink-200 dark:hover:border-pink-500/30 transition-all active:scale-[0.98] overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-left">
                        <div className="font-black text-xl text-gray-700 dark:text-gray-200 uppercase leading-none mb-1">
                          {getPackName(entry)}
                        </div>
                        <div className="text-[10px] font-bold text-pink-300 dark:text-pink-500/80 uppercase tracking-[0.2em]">
                          {totalCount > 0 ? `${completedCount} / ${totalCount} ${t('completed')}` : t('loading')}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-400 group-hover:bg-pink-400 group-hover:text-white transition-colors">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                    
                    <div className="w-full h-2 bg-pink-50/50 dark:bg-pink-900/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className="h-full bg-pink-400"
                      />
                    </div>
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="levels"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center w-full"
            >
              {isLoading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-pink-400" size={40} />
                  <p className="font-bold text-pink-200">{t('loading')}</p>
                </div>
              ) : categoryLevels.length > 0 ? (
                <div className="grid grid-cols-4 gap-4 pb-12 w-full">
                  {categoryLevels.map((level, idx) => {
                    const stars = stats.completedLevels[selectedEntry.id]?.[idx] || 0;
                    const isCompleted = stars > 0;
                    const isUnlocked = idx === 0 || (stats.completedLevels[selectedEntry.id]?.[idx - 1] || 0) > 0;

                    return (
                      <button
                        key={idx}
                        disabled={!isUnlocked}
                        onClick={() => onSelect(selectedEntry.id, idx)}
                        className={`
                          aspect-square rounded-[2rem] flex flex-col items-center justify-center relative transition-all active:scale-90 border-2
                          ${isCompleted 
                            ? 'bg-pink-400 dark:bg-pink-500 border-pink-500 dark:border-pink-400 shadow-md transform scale-100' 
                            : isUnlocked 
                              ? 'bg-white dark:bg-[#2A2A4E] border-pink-50 dark:border-white/5 shadow-sm hover:border-pink-200'
                              : 'bg-gray-50 dark:bg-[#1A1A2E] border-gray-100 dark:border-white/5 opacity-60 cursor-not-allowed'}
                        `}
                      >
                        {!isUnlocked ? (
                          <Lock size={20} className="text-gray-300 dark:text-gray-600" />
                        ) : (
                          <>
                            <span className={`text-2xl font-black ${isCompleted ? 'text-white' : 'text-pink-200 dark:text-pink-900'} mb-1`}>
                              {idx + 1}
                            </span>
                            <div className="flex gap-1">
                              {[1, 2, 3].map(s => (
                                <Star 
                                  key={s} 
                                  size={12} 
                                  fill={s <= stars ? "#FACC15" : "transparent"} 
                                  className={s <= stars ? "text-yellow-400" : (isCompleted ? "text-pink-200 dark:text-pink-900" : "text-pink-100 dark:text-pink-950")}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-10 text-pink-300 font-bold uppercase tracking-widest">
                  {t('error_load')}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LevelMenu;
