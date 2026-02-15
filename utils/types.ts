
import { Language } from './translations';

export type Point = {
  x: number;
  y: number;
};

export type ThemeMode = 'system' | 'light' | 'dark';

export interface LevelSetMetadata {
  name: string;
  version: string;
  grid: string; // e.g. "3x5" or "10x10"
}

export type LevelData = {
  lvl: number;
  grid: string; 
  type: 'normal' | 'portal' | 'wall' | 'mirror' | 'noBound';
  path: string; 
  points: { [key: string]: string };
  
  // Internal calculated fields
  width: number;
  height: number;
  checkpoints: { [key: number]: Point };
  totalCheckpoints: number;
  solutionPath: Point[];
};

export type View = 'home' | 'game' | 'levels' | 'daily' | 'shop' | 'settings';

export interface UserStats {
  completedLevels: { 
    [key: string]: { [levelIdx: number]: number } // Maps level ID -> { levelIndex: stars }
  };
  dailyStreak: number;
  lastDailyDate: string | null;
  stars: number;
  hints: number;
  language: Language;
  theme: ThemeMode;
}
