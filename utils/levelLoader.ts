
import { Point, LevelData, LevelSetMetadata } from './types';

export interface LevelRegistryEntry {
  id: string;
  name: { [key: string]: string };
  files: string[]; // Changed from file: string to files: string[]
}

export const parseCoord = (coordStr: string): Point => {
  const [x, y] = coordStr.split(':').map(n => parseInt(n) - 1);
  return { x, y };
};

export const parseGridSize = (gridStr: string): { width: number; height: number } => {
  const parts = gridStr.split('x');
  const width = parseInt(parts[0]);
  const height = parts.length > 1 ? parseInt(parts[1]) : width;
  return { width, height };
};

export const loadLevelFromJson = (jsonData: any, gridInfo: { width: number, height: number }): LevelData => {
  const checkpoints: { [key: number]: Point } = {};
  Object.entries(jsonData.points).forEach(([val, coord]) => {
    checkpoints[parseInt(val)] = parseCoord(coord as string);
  });

  const solutionPath = jsonData.path.split(',').map(parseCoord);

  return {
    ...jsonData,
    grid: `${gridInfo.width}x${gridInfo.height}`,
    width: gridInfo.width,
    height: gridInfo.height,
    checkpoints,
    totalCheckpoints: Object.keys(checkpoints).length,
    solutionPath
  };
};

export interface LevelSetResponse {
  metadata: LevelSetMetadata;
  levels: LevelData[];
}
