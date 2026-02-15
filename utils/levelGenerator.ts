
import { LevelData, Point } from './types';

export const isAdjacent = (p1: Point, p2: Point) => {
  const dx = Math.abs(p1.x - p2.x);
  const dy = Math.abs(p1.y - p2.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
};

/**
 * Genererer en bane ved hjælp af en randomiseret DFS.
 * Håndterer "parity" for ulige grids (f.eks. 7x7), da stien SKAL starte 
 * på en bestemt farve for at kunne dække alle felter.
 */
export const generateLevel = (index: number, width: number = 5, height: number = 5): LevelData => {
  const totalCells = width * height;
  const isOdd = totalCells % 2 !== 0;
  
  const seed = index * 133.7;
  const random = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  let currentSeed = seed;
  const getNextRand = () => {
    currentSeed += 0.123;
    return random(currentSeed);
  };

  const path: Point[] = [];
  const visited = new Set<string>();
  const toKey = (p: Point) => `${p.x},${p.y}`;

  const buildPath = (p: Point): boolean => {
    path.push(p);
    visited.add(toKey(p));
    if (path.length === totalCells) return true;
    
    const neighbors = [
      { x: p.x + 1, y: p.y }, 
      { x: p.x - 1, y: p.y }, 
      { x: p.x, y: p.y + 1 }, 
      { x: p.x, y: p.y - 1 }
    ].filter(n => n.x >= 0 && n.x < width && n.y >= 0 && n.y < height && !visited.has(toKey(n)));
    
    // Shuffle neighbors
    for (let i = neighbors.length - 1; i > 0; i--) {
      const j = Math.floor(getNextRand() * (i + 1));
      [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
    }
    
    for (const next of neighbors) { 
      if (buildPath(next)) return true; 
    }
    
    path.pop();
    visited.delete(toKey(p));
    return false;
  };

  // PARITY LOGIK:
  // På et ulige grid (f.eks. 7x7) SKAL man starte på et felt hvor (x+y) er lige
  // hvis man antager (0,0) er sort, da der er flere sorte end hvide felter.
  let startX = Math.floor(getNextRand() * width);
  let startY = Math.floor(getNextRand() * height);
  
  if (isOdd && (startX + startY) % 2 !== 0) {
    // Flyt til et nabo-felt for at ramme den rigtige "farve"
    if (startX + 1 < width) startX++;
    else if (startX - 1 >= 0) startX--;
    else if (startY + 1 < height) startY++;
    else startY--;
  }

  buildPath({ x: startX, y: startY });

  const checkpoints: { [key: number]: Point } = {};
  const totalCP = Math.min(Math.floor(totalCells / 4), 10); // Dynamisk antal checkpoints baseret på størrelse
  
  checkpoints[1] = path[0];
  for (let i = 1; i < totalCP; i++) {
    const idx = Math.floor((path.length - 1) * (i / totalCP));
    if (idx > 0 && idx < path.length - 1) {
      checkpoints[i + 1] = path[idx];
    }
  }
  checkpoints[Object.keys(checkpoints).length + 1] = path[path.length - 1];

  const pathStr = path.map(p => `${p.x+1}:${p.y+1}`).join(',');
  const pointsStr: { [key: string]: string } = {};
  Object.entries(checkpoints).forEach(([val, p]) => {
    pointsStr[val] = `${p.x+1}:${p.y+1}`;
  });

  return {
    lvl: index,
    grid: `${width}x${height}`,
    type: 'normal',
    path: pathStr,
    points: pointsStr,
    width,
    height,
    checkpoints,
    totalCheckpoints: Object.keys(checkpoints).length,
    solutionPath: [...path]
  };
};
