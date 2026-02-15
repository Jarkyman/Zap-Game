
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lightbulb, X, Check } from 'lucide-react';
import { LevelData, Point, UserStats } from '../utils/types';
import { isAdjacent } from '../utils/levelGenerator';

interface GameBoardProps {
  level: LevelData;
  stats: UserStats;
  onWin: (stars: number) => void;
  onUseHint: (cost: number) => boolean;
  t: (key: string) => string;
}

const GameBoard: React.FC<GameBoardProps> = ({ level, stats, onWin, onUseHint, t }) => {
  const [path, setPath] = useState<Point[]>([{ ...level.checkpoints[1] }]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStarts, setDrawStarts] = useState(0);
  const [showHintMenu, setShowHintMenu] = useState(false);
  
  // Hint visualizations
  const [tempShowFull, setTempShowFull] = useState(false);
  const [highlightedPoints, setHighlightedPoints] = useState<Point[]>([]);
  const [nextStepPoint, setNextStepPoint] = useState<Point | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const winTriggered = useRef(false);

  useEffect(() => {
    setPath([{ ...level.checkpoints[1] }]);
    winTriggered.current = false;
    setDrawStarts(0);
    setHighlightedPoints([]);
    setNextStepPoint(null);
    setTempShowFull(false);
  }, [level]);

  const getPointFromEvent = (e: React.TouchEvent | React.MouseEvent): Point | null => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const cellWidth = rect.width / level.width;
    const cellHeight = rect.height / level.height;
    const x = Math.floor((clientX - rect.left) / cellWidth);
    const y = Math.floor((clientY - rect.top) / cellHeight);
    if (x >= 0 && x < level.width && y >= 0 && y < level.height) return { x, y };
    return null;
  };

  const checkWin = (currentPath: Point[]) => {
    const lastPoint = currentPath[currentPath.length - 1];
    const finalCheckpoint = level.checkpoints[level.totalCheckpoints];
    if (lastPoint.x !== finalCheckpoint.x || lastPoint.y !== finalCheckpoint.y) return false;
    if (currentPath.length !== level.width * level.height) return false;

    let lastCheckpointFound = 1;
    for (const p of currentPath) {
      const cpVal = (Object.entries(level.checkpoints) as [string, Point][]).find(([val, point]) => point.x === p.x && point.y === p.y)?.[0];
      if (cpVal) {
        const val = parseInt(cpVal);
        if (val === lastCheckpointFound + 1) lastCheckpointFound = val;
        else if (val > lastCheckpointFound + 1) return false;
      }
    }
    return lastCheckpointFound === level.totalCheckpoints;
  };

  const handleInteraction = (p: Point) => {
    if (winTriggered.current) return;
    const last = path[path.length - 1];
    const existingIndex = path.findIndex(pt => pt.x === p.x && pt.y === p.y);
    
    if (existingIndex !== -1 && existingIndex < path.length - 1) {
      setPath(path.slice(0, existingIndex + 1));
      return;
    }

    if (isAdjacent(last, p) && existingIndex === -1) {
      const newPath = [...path, p];
      const cpValue = (Object.entries(level.checkpoints) as [string, Point][]).find(([_, pt]) => pt.x === p.x && pt.y === p.y)?.[0];
      if (cpValue) {
        const val = parseInt(cpValue);
        let maxCPFoundInPath = 0;
        for (const pt of path) {
           const v = (Object.entries(level.checkpoints) as [string, Point][]).find(([_, cpPt]) => cpPt.x === pt.x && cpPt.y === pt.y)?.[0];
           if (v) maxCPFoundInPath = Math.max(maxCPFoundInPath, parseInt(v));
        }
        if (val !== maxCPFoundInPath + 1) return;
      }
      setPath(newPath);
      
      // Clear hints on move
      if (nextStepPoint && p.x === nextStepPoint.x && p.y === nextStepPoint.y) setNextStepPoint(null);
      if (highlightedPoints.some(hp => hp.x === p.x && hp.y === p.y)) setHighlightedPoints([]);

      if (checkWin(newPath)) {
        winTriggered.current = true;
        const starsEarned = drawStarts <= 1 ? 3 : drawStarts === 2 ? 2 : 1;
        onWin(starsEarned);
      }
    }
  };

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (winTriggered.current) return;
    const p = getPointFromEvent(e);
    if (p) {
      setDrawStarts(prev => prev + 1);
      const idx = path.findIndex(pt => pt.x === p.x && pt.y === p.y);
      if (idx !== -1) setPath(path.slice(0, idx + 1));
      setIsDrawing(true);
    }
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || winTriggered.current) return;
    const p = getPointFromEvent(e);
    if (p) handleInteraction(p);
  };

  // Hint Actions
  const handleHintNext = () => {
    if (onUseHint(1)) {
      const next = level.solutionPath[path.length];
      if (next) {
        setNextStepPoint(next);
        setShowHintMenu(false);
      }
    }
  };

  const handleHintPath = () => {
    if (onUseHint(3)) {
      const next5 = level.solutionPath.slice(path.length, path.length + 5);
      setHighlightedPoints(next5);
      setShowHintMenu(false);
      setTimeout(() => setHighlightedPoints([]), 3000);
    }
  };

  const handleHintFull = () => {
    if (onUseHint(5)) {
      setTempShowFull(true);
      setShowHintMenu(false);
      setTimeout(() => setTempShowFull(false), 4000);
    }
  };

  const maxCells = Math.max(level.width, level.height);
  const gap = maxCells > 10 ? 1 : 2;
  const fontSize = maxCells > 11 ? 'text-[8px]' : maxCells > 8 ? 'text-xs' : maxCells > 6 ? 'text-lg' : 'text-2xl';
  const radius = maxCells > 10 ? 'rounded-[2px]' : maxCells > 7 ? 'rounded-md' : 'rounded-2xl';
  const strokeWidth = Math.max(2, (400 / maxCells) * 0.2);

  return (
    <div className="relative flex flex-col items-center gap-6 select-none">
      <div 
        ref={containerRef}
        className="relative grid p-1 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-[1.5rem] shadow-inner border-2 border-pink-100/50 dark:border-white/10"
        style={{
          gridTemplateColumns: `repeat(${level.width}, 1fr)`,
          gridTemplateRows: `repeat(${level.height}, 1fr)`,
          gap: `${gap}px`,
          width: 'min(92vw, 420px)',
          aspectRatio: `${level.width}/${level.height}`,
          touchAction: 'none'
        }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={() => setIsDrawing(false)}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={() => setIsDrawing(false)}
      >
        {Array.from({ length: level.width * level.height }).map((_, i) => {
          const x = i % level.width;
          const y = Math.floor(i / level.width);
          const checkpointValue = (Object.entries(level.checkpoints) as [string, Point][]).find(([_, cpPt]) => cpPt.x === x && cpPt.y === y)?.[0];
          const isSelected = path.some(p => p.x === x && p.y === y);
          const isLast = path[path.length - 1]?.x === x && path[path.length - 1]?.y === y;
          const isNextStep = nextStepPoint?.x === x && nextStepPoint?.y === y;
          const isHighlighted = highlightedPoints.some(hp => hp.x === x && hp.y === y);

          return (
            <div 
              key={`${x}-${y}`}
              className={`
                relative flex items-center justify-center font-black ${fontSize} ${radius} transition-all duration-100 border w-full h-full
                ${isSelected 
                  ? 'bg-pink-400 dark:bg-pink-500 text-white border-pink-500 dark:border-pink-400' 
                  : isHighlighted 
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-500 text-indigo-500'
                    : 'bg-white/90 dark:bg-[#2A2A4E] text-pink-200 dark:text-pink-900 border-pink-100/60 dark:border-white/5 shadow-sm'}
                ${isLast && !winTriggered.current ? 'ring-2 ring-pink-300 dark:ring-pink-500 ring-offset-1 dark:ring-offset-[#1A1A2E]' : ''}
              `}
            >
              {checkpointValue && <span className="pointer-events-none">{checkpointValue}</span>}
              {isNextStep && (
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1.2 }}
                  className="absolute inset-0 border-4 border-indigo-400 dark:border-indigo-500 rounded-full animate-pulse pointer-events-none"
                />
              )}
            </div>
          );
        })}

        {/* Hint Ghost Paths */}
        <svg className="absolute inset-0 pointer-events-none p-1 z-20" viewBox={`0 0 ${level.width * 100} ${level.height * 100}`}>
          {tempShowFull && level.solutionPath && (
            <path
              d={`M ${level.solutionPath.map(p => `${p.x * 100 + 50} ${p.y * 100 + 50}`).join(' L ')}`}
              fill="none" stroke="#818CF8" strokeWidth={strokeWidth} strokeDasharray={`${strokeWidth * 2} ${strokeWidth * 2}`} strokeLinecap="round" className="opacity-40"
            />
          )}
          {highlightedPoints.length > 0 && (
             <path
              d={`M ${[path[path.length-1], ...highlightedPoints].map(p => `${p.x * 100 + 50} ${p.y * 100 + 50}`).join(' L ')}`}
              fill="none" stroke="#818CF8" strokeWidth={strokeWidth * 1.2} strokeLinecap="round" strokeDasharray={`${strokeWidth} ${strokeWidth}`} className="opacity-60"
            />
          )}
        </svg>

        {/* User Active Path */}
        <svg className="absolute inset-0 pointer-events-none p-1 z-30" viewBox={`0 0 ${level.width * 100} ${level.height * 100}`}>
          {path.length > 1 && (
            <path
              d={`M ${path.map(p => `${p.x * 100 + 50} ${p.y * 100 + 50}`).join(' L ')}`}
              fill="none" stroke="white" strokeWidth={strokeWidth * 1.5} strokeLinecap="round" strokeLinejoin="round" className={`${winTriggered.current ? 'opacity-80' : 'opacity-40'} drop-shadow-sm transition-opacity`}
            />
          )}
        </svg>
      </div>
      
      {/* Controls */}
      <div className="flex gap-4 items-center">
        <button 
          onClick={() => setShowHintMenu(true)}
          className="w-16 h-16 bg-white dark:bg-[#2A2A4E] rounded-full flex items-center justify-center text-indigo-400 shadow-lg border-2 border-indigo-100 dark:border-indigo-500/20 active:scale-90 transition-all"
        >
          <Lightbulb size={28} />
        </button>

        <div className="px-6 py-3 bg-white/80 dark:bg-[#2A2A4E] rounded-full text-[10px] font-black tracking-[0.2em] text-pink-400 border border-pink-100 dark:border-white/5 shadow-sm">
          LIFTS: {Math.max(0, drawStarts - 1)}
        </div>
      </div>

      {/* Hint Selection Popup */}
      <AnimatePresence>
        {showHintMenu && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowHintMenu(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#2A2A4E] rounded-[2.5rem] p-8 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-indigo-500 uppercase tracking-tight">{t('hints')}</h3>
                <button onClick={() => setShowHintMenu(false)} className="p-2 bg-gray-50 dark:bg-black/20 rounded-full text-gray-400"><X size={20}/></button>
              </div>

              <HintOption 
                label={t('hint_next')} cost={1} disabled={stats.hints < 1} 
                onClick={handleHintNext} icon={<Sparkles size={18} />} 
              />
              <HintOption 
                label={t('hint_path')} cost={3} disabled={stats.hints < 3} 
                onClick={handleHintPath} icon={<Sparkles size={20} />} 
              />
              <HintOption 
                label={t('hint_reveal')} cost={5} disabled={stats.hints < 5} 
                onClick={handleHintFull} icon={<Sparkles size={22} />} 
              />
              
              <div className="pt-2 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {stats.hints} {t('hints')} AVAILABLE
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HintOption = ({ label, cost, disabled, onClick, icon }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border-2 ${
      disabled 
        ? 'bg-gray-50 dark:bg-[#1A1A2E] border-transparent opacity-40 grayscale cursor-not-allowed' 
        : 'bg-white dark:bg-[#1A1A2E] border-indigo-50 dark:border-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 active:scale-[0.98]'
    }`}
  >
    <div className="flex items-center gap-4 text-left">
      <div className="text-indigo-400">{icon}</div>
      <span className="font-bold text-sm uppercase text-gray-700 dark:text-gray-200">{label}</span>
    </div>
    <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-500/20">
      <span className="text-xs font-black text-indigo-500 dark:text-indigo-400">{cost}</span>
      <Sparkles size={12} className="text-indigo-400" />
    </div>
  </button>
);

export default GameBoard;
