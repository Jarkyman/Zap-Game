
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flame, CheckCircle2, Clock, Share2, Home } from 'lucide-react';
import { UserStats, LevelData } from '../utils/types';
import GameBoard from './GameBoard';

interface DailyViewProps {
  stats: UserStats;
  level: LevelData;
  onBack: () => void;
  onComplete: () => void;
  onUseHint: (cost: number) => boolean;
  t: (key: string) => string;
  timeLeft: string;
}

const DailyView: React.FC<DailyViewProps> = ({ stats, level, onBack, onComplete, onUseHint, t, timeLeft }) => {
  const today = new Date().toISOString().split('T')[0];
  const isAlreadyDone = stats.lastDailyDate === today;

  const handleShare = () => {
    const text = `I just completed the Zip Connect Daily Puzzle! My current streak is ${stats.dailyStreak} days! 🔥✨ #ZipConnect`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      navigator.share({ 
        title: 'Zip Connect', 
        text, 
        url: shareUrl 
      }).catch(err => console.error("Share failed", err));
    } else {
      navigator.clipboard.writeText(`${text} ${shareUrl}`);
      alert("Streak copied to clipboard!");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 w-full flex flex-col p-2 sm:p-4 overflow-hidden select-none"
    >
      {/* Header Info - Highly Compact */}
      <div className="text-center mb-2 sm:mb-4 flex flex-col items-center">
        <h2 className="text-lg sm:text-xl font-black text-pink-500 mb-0.5 uppercase tracking-tight">
          {t('daily_puzzle')}
        </h2>
        
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 text-orange-500 font-black text-[10px] uppercase">
            <Flame size={12} fill="currentColor" />
            <span>{stats.dailyStreak}</span>
          </div>
          <div className="w-1 h-1 bg-gray-200 rounded-full" />
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
            {new Date().toLocaleDateString(stats.language, { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-2 overflow-hidden">
        {isAlreadyDone ? (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#2A2A4E] p-5 sm:p-6 rounded-[2rem] shadow-xl text-center max-w-[320px] w-full border border-green-50 dark:border-green-500/10"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} className="text-green-500" />
            </div>
            <h3 className="text-base font-black mb-0.5 text-gray-700 dark:text-gray-200 uppercase">{t('completed')}</h3>
            <p className="text-[9px] text-gray-400 mb-4 font-bold uppercase tracking-widest">{t('come_back_tomorrow')}</p>
            
            <div className="bg-gray-50 dark:bg-[#1A1A2E] rounded-2xl p-3 mb-5 border border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-center gap-1.5 text-pink-400 mb-0.5">
                <Clock size={12} />
                <span className="text-[8px] font-black uppercase">Next In</span>
              </div>
              <div className="text-xl font-black text-gray-700 dark:text-gray-200 tabular-nums">
                {timeLeft}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleShare}
                className="w-full py-4 bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Share2 size={16} />
                {t('share_score')}
              </button>
              
              <button 
                onClick={onBack} 
                className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Home size={16} />
                {t('home')}
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="w-full flex flex-col items-center gap-4">
            <GameBoard 
              level={level} 
              stats={stats}
              onWin={onComplete} 
              onUseHint={onUseHint}
              t={t}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DailyView;
