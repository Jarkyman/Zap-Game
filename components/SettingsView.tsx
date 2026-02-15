
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Globe, Moon, Sun, Share2, StarHalf, RotateCcw, Check, ChevronRight } from 'lucide-react';
import { UserStats, ThemeMode } from '../utils/types';
import { LANGUAGES } from '../utils/translations';

interface SettingsViewProps {
  stats: UserStats;
  onUpdateStats: (updates: Partial<UserStats>) => void;
  onBack: () => void;
  t: (key: string) => string;
}

const SettingsView: React.FC<SettingsViewProps> = ({ stats, onUpdateStats, onBack, t }) => {
  const [showLangModal, setShowLangModal] = useState(false);

  // Determine which theme looks active if it's currently on 'system'
  const effectiveTheme = stats.theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : stats.theme;

  const currentLangLabel = LANGUAGES.find(l => l.code === stats.language);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex-1 w-full flex flex-col p-6 bg-[#FDFCFD] dark:bg-[#1A1A2E] overflow-hidden transition-colors duration-500"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="p-2 bg-white dark:bg-[#2A2A4E] rounded-2xl shadow-sm active:scale-90 transition-all border border-transparent dark:border-white/5">
          <ArrowLeft size={24} className="text-pink-500" />
        </button>
        <h1 className="text-2xl font-black text-pink-500 uppercase tracking-tight">
          {t('settings')}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6 pb-12">
        
        {/* Theme Section */}
        <section>
          <div className="px-1 mb-3 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            {t('theme')}
          </div>
          <div className="flex gap-3">
            <ThemeOption 
              active={effectiveTheme === 'light'} 
              icon={<Sun size={20} />} 
              label={t('light')} 
              onClick={() => onUpdateStats({ theme: 'light' })} 
            />
            <ThemeOption 
              active={effectiveTheme === 'dark'} 
              icon={<Moon size={20} />} 
              label={t('dark')} 
              onClick={() => onUpdateStats({ theme: 'dark' })} 
            />
          </div>
        </section>

        {/* Language Section */}
        <section>
          <div className="px-1 mb-3 text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            {t('language')}
          </div>
          <button 
            onClick={() => setShowLangModal(true)}
            className="w-full h-16 flex items-center justify-between px-5 bg-white dark:bg-[#2A2A4E] rounded-[1.5rem] border border-gray-100 dark:border-white/5 shadow-sm active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4 text-gray-700 dark:text-gray-200">
              <span className="text-xl leading-none">{currentLangLabel?.flag}</span>
              <span className="font-bold text-sm uppercase tracking-tight">{currentLangLabel?.label}</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        </section>

        {/* Action Buttons */}
        <section className="space-y-3 pt-4 border-t border-gray-100 dark:border-white/5">
          <ActionItem 
            icon={<Share2 size={20} />} 
            label={t('share_app')} 
            onClick={() => {}} 
          />
          <ActionItem 
            icon={<StarHalf size={20} />} 
            label={t('rate_app')} 
            onClick={() => {}} 
          />
          <ActionItem 
            icon={<RotateCcw size={20} />} 
            label={t('restore_purchases')} 
            onClick={() => {}} 
          />
        </section>

        <div className="text-center pt-8 opacity-30">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
            ZIP {t('app_version')} 1.0.0
          </p>
        </div>
      </div>

      {/* Language Selection Modal */}
      <AnimatePresence>
        {showLangModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLangModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#2A2A4E] w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-pink-500 uppercase tracking-tight">{t('language')}</h3>
                <button onClick={() => setShowLangModal(false)} className="p-2 bg-gray-50 dark:bg-black/20 rounded-full text-gray-400 hover:text-pink-500 transition-colors">
                   <Check size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {LANGUAGES.map(lang => (
                  <button 
                    key={lang.code}
                    onClick={() => {
                      onUpdateStats({ language: lang.code });
                      setShowLangModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                      stats.language === lang.code 
                        ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 font-bold' 
                        : 'hover:bg-gray-50 dark:hover:bg-black/10 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-sm font-bold uppercase tracking-tight">{lang.label}</span>
                    </div>
                    {stats.language === lang.code && <Check size={18} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ThemeOption = ({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex-1 h-16 flex items-center justify-center gap-3 rounded-[1.5rem] transition-all border-2 ${
      active 
        ? 'bg-pink-50 dark:bg-pink-900/30 border-pink-200 dark:border-pink-500 text-pink-500 dark:text-pink-400 shadow-sm' 
        : 'bg-white dark:bg-[#2A2A4E] border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-500'
    }`}
  >
    <span className={active ? 'text-pink-500 dark:text-pink-400' : 'text-gray-300 dark:text-gray-600'}>
      {icon}
    </span>
    <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const ActionItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full h-16 flex items-center justify-between px-5 bg-white dark:bg-[#2A2A4E] rounded-[1.5rem] text-gray-600 dark:text-gray-300 shadow-sm active:scale-[0.98] transition-all border border-gray-100 dark:border-white/5"
  >
    <div className="flex items-center gap-4">
      <div className="text-pink-400/80">{icon}</div>
      <span className="font-bold text-sm uppercase tracking-tight">{label}</span>
    </div>
    <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
  </button>
);

export default SettingsView;
