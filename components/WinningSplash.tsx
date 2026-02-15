
import React from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight, ArrowLeft, Share2, RotateCcw } from 'lucide-react';

interface WinningSplashProps {
  onNext: () => void;
  onRetry: () => void;
  onBack: () => void;
  levelId: number;
  earnedStars: number;
  t: (key: string) => string;
}

const WinningSplash: React.FC<WinningSplashProps> = ({ onNext, onRetry, onBack, levelId, earnedStars, t }) => {
  const handleShare = () => {
    const text = `I just beat Level ${levelId} in Zip Connect with ${earnedStars} stars! ✨🔥 #ZipConnect`;
    const shareUrl = window.location.origin;
    
    if (navigator.share) {
      navigator.share({ 
        title: 'Zip Connect', 
        text, 
        url: shareUrl 
      }).catch(err => {
        console.error("Share failed:", err);
      });
    } else {
      navigator.clipboard.writeText(`${text} ${shareUrl}`);
      alert("Score copied to clipboard!");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-500/20 dark:bg-black/80 backdrop-blur-[2px]"
    >
      <motion.div 
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-[#2A2A4E] p-6 sm:p-8 rounded-[2.5rem] shadow-2xl text-center max-w-[320px] w-full relative overflow-hidden select-none border border-transparent dark:border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300" />
        
        <div className="flex justify-center gap-1.5 mb-4">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 + s * 0.1, type: "spring", stiffness: 200 }}
            >
              <Star 
                size={s === 2 ? 48 : 36} 
                className={`${s <= earnedStars ? 'text-yellow-400 fill-current' : 'text-gray-100 dark:text-gray-800'} ${s === 2 ? 'animate-bounce' : ''}`} 
              />
            </motion.div>
          ))}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-pink-500 mb-0.5 leading-tight uppercase tracking-tight">
          {t('amazing')}
        </h2>
        <p className="text-gray-400 dark:text-gray-500 mb-6 font-bold uppercase tracking-widest text-[9px]">
          {t('level')} {levelId} {t('completed')}
        </p>

        <div className="flex flex-col gap-2.5">
          <button 
            onClick={onNext}
            className="group w-full py-4 bg-pink-400 text-white rounded-2xl font-black text-lg shadow-lg shadow-pink-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-pink-500"
          >
            {t('next').toUpperCase()}
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button 
            onClick={onRetry}
            className="w-full py-3 bg-white dark:bg-white/5 text-pink-400 border-2 border-pink-100 dark:border-pink-500/20 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RotateCcw size={18} />
            {t('retry').toUpperCase()}
          </button>
          
          <div className="grid grid-cols-2 gap-2.5 mt-1">
            <button 
              onClick={onBack} 
              className="flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300 py-3.5 rounded-xl font-black text-[10px] uppercase border border-gray-100 dark:border-white/5 active:scale-95 transition-all"
            >
              <ArrowLeft size={14} />
              {t('back')}
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 py-3.5 rounded-xl font-black text-[10px] uppercase border border-blue-100 dark:border-blue-500/10 active:scale-95 transition-all"
            >
              <Share2 size={14} />
              {t('share_score')}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WinningSplash;
