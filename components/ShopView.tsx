
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, ShoppingBag, Palette, HelpCircle, Lock, Video, EyeOff, Unlock, RefreshCcw, Sparkles, Zap } from 'lucide-react';
import { UserStats } from '../utils/types';

interface ShopViewProps {
  stats: UserStats;
  onBack: () => void;
  t: (key: string) => string;
}

const ShopView: React.FC<ShopViewProps> = ({ stats, onBack, t }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex-1 w-full flex flex-col p-6 bg-[#FDFCFD] dark:bg-[#1A1A2E] overflow-hidden transition-colors duration-500"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white dark:bg-[#2A2A4E] rounded-xl shadow-sm active:scale-90 border border-transparent dark:border-white/5">
            <ArrowLeft size={24} className="text-pink-500" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-pink-500 uppercase tracking-tight">
            {t('shop').toUpperCase()}
          </h1>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1 bg-white dark:bg-[#2A2A4E] px-3 py-2 rounded-full shadow-sm border border-indigo-50 dark:border-white/5">
            <Sparkles size={14} fill="#818CF8" className="text-indigo-400" />
            <span className="font-black text-indigo-500 dark:text-indigo-400 text-xs">{stats.hints}</span>
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-[#2A2A4E] px-3 py-2 rounded-full shadow-sm border border-pink-50 dark:border-white/5">
            <Star size={14} fill="#FACC15" className="text-yellow-400" />
            <span className="font-black text-pink-500 dark:text-pink-400 text-xs">{stats.stars}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-12">
        
        {/* FULL GAME BUNDLE - Featured at top */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            <Zap size={14} className="text-yellow-500" />
            {t('upgrades')}
          </div>
          <button className="w-full relative overflow-hidden bg-gradient-to-br from-pink-50 to-indigo-50 dark:from-pink-900/20 dark:to-indigo-900/20 p-6 rounded-[2.5rem] border-2 border-pink-200 dark:border-pink-500/30 flex flex-col gap-4 active:scale-[0.98] transition-all group">
            <div className="absolute top-4 right-4 bg-yellow-400 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm animate-pulse">
              {t('best_value')}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#2A2A4E] flex items-center justify-center border-2 border-yellow-200 dark:border-yellow-500/40 shadow-md group-hover:scale-110 transition-transform">
                <Zap size={32} fill="#FBBF24" className="text-yellow-500" />
              </div>
              <div className="text-left">
                <div className="font-black text-gray-800 dark:text-white text-lg uppercase tracking-tight leading-none mb-1">{t('full_game')}</div>
                <div className="text-[11px] text-pink-500 dark:text-pink-400 font-bold uppercase leading-tight max-w-[200px]">
                  {t('full_game_desc')}
                </div>
              </div>
            </div>

            <div className="w-full h-12 bg-white dark:bg-[#2A2A4E] rounded-2xl flex items-center justify-center font-black text-pink-500 dark:text-pink-400 text-lg shadow-sm border border-transparent dark:border-white/5">
              $9.99
            </div>
          </button>
        </section>

        {/* FREE STUFF */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            <Video size={14} />
            {t('free_hints')}
          </div>
          <button className="w-full bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-[2rem] border-2 border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between active:scale-[0.98] transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#2A2A4E] flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-sm group-hover:rotate-12 transition-transform">
                <Video className="text-indigo-400" />
              </div>
              <div className="text-left">
                <div className="font-black text-indigo-900 dark:text-indigo-200 text-sm">{t('watch_ad')}</div>
                <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-tight">+3 {t('hints')}</div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#2A2A4E] px-4 py-2 rounded-full font-black text-indigo-500 text-xs shadow-sm border border-transparent dark:border-white/5">
              GET
            </div>
          </button>
        </section>

        {/* THEMES - Cost STARS */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            <Palette size={14} />
            {t('themes')}
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-pink-50/50 dark:bg-pink-900/20 p-4 rounded-[2rem] border-2 border-pink-100 dark:border-pink-500/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#2A2A4E] flex items-center justify-center border border-pink-100 dark:border-pink-500/20 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-pink-400 shadow-sm shadow-pink-200" />
                </div>
                <div>
                  <div className="font-black text-gray-700 dark:text-gray-200 text-sm uppercase tracking-tight">Pastel Pink</div>
                  <div className="text-[10px] text-pink-400 font-bold uppercase">{t('owned')}</div>
                </div>
              </div>
            </div>
            
            <ShopItem 
              icon={<div className="w-6 h-6 rounded-full bg-blue-400 shadow-sm shadow-blue-200" />} 
              name="Ice Blue" price="500" t={t} 
            />
            <ShopItem 
              icon={<div className="w-6 h-6 rounded-full bg-green-400 shadow-sm shadow-green-200" />} 
              name="Forest Mint" price="1000" t={t} 
            />
          </div>
        </section>

        {/* HINTS - Cost MONEY */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            <Sparkles size={14} />
            {t('hints')}
          </div>
          <div className="grid grid-cols-1 gap-3">
             <ShopItem icon={<Sparkles className="text-indigo-400" />} name="12 Hints" price="$0.99" isMoney t={t} />
             <ShopItem icon={<Sparkles className="text-indigo-500" />} name="50 Hints" price="$2.99" isMoney t={t} />
             <ShopItem icon={<Sparkles className="text-indigo-600 animate-pulse" />} name="Infinite Hints" price="$7.99" isMoney t={t} />
          </div>
        </section>

        <div className="text-center pt-8 opacity-20">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            Secure Checkout with App Store & Google Play
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const ShopItem = ({ icon, name, price, isMoney, t }: any) => (
  <div className="bg-white dark:bg-[#2A2A4E] p-4 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between group active:scale-[0.99] transition-all cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#1A1A2E] flex items-center justify-center border border-gray-100 dark:border-white/5">
        {icon}
      </div>
      <div>
        <div className="font-black text-gray-700 dark:text-gray-200 text-sm uppercase tracking-tight">{name}</div>
        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">{t('buy')}</div>
      </div>
    </div>
    <div className={`flex items-center gap-1.5 ${isMoney ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-500/20' : 'bg-pink-50 dark:bg-pink-900/20 border-pink-100 dark:border-pink-500/20'} px-4 py-2 rounded-full border`}>
      <span className={`font-black ${isMoney ? 'text-green-600 dark:text-green-400' : 'text-pink-500 dark:text-pink-400'} text-xs uppercase tracking-tight`}>{price}</span>
      {!isMoney && <Star size={12} fill="currentColor" className="text-pink-400 dark:text-pink-500" />}
    </div>
  </div>
);

export default ShopView;
