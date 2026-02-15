
import { LevelData, LevelSetMetadata } from '../utils/types';
import { loadLevelFromJson, parseGridSize, LevelSetResponse, LevelRegistryEntry } from '../utils/levelLoader';

const levelSetCache: Record<string, LevelSetResponse> = {};
let levelRegistry: LevelRegistryEntry[] = [];

/**
 * Henter listen over alle tilgængelige banepakker fra levels.json
 */
export const fetchLevelRegistry = async (): Promise<LevelRegistryEntry[]> => {
  if (levelRegistry.length > 0) return levelRegistry;
  try {
    const response = await fetch('./data/levels.json');
    if (!response.ok) throw new Error("Failed to load level registry");
    levelRegistry = await response.json();
    return levelRegistry;
  } catch (error) {
    console.error("Registry load error:", error);
    return [];
  }
};

/**
 * Henter en hel banepakke baseret på registry entry.
 * Håndterer både rå arrays og objekter med metadata.
 */
export const fetchLevelSet = async (registryEntry: LevelRegistryEntry): Promise<LevelSetResponse | null> => {
  if (levelSetCache[registryEntry.id]) return levelSetCache[registryEntry.id];

  try {
    const fetchPromises = registryEntry.files.map(async (filePath) => {
      try {
        const response = await fetch(`./${filePath}`);
        if (!response.ok) {
          console.warn(`Kunne ikke finde filen: ${filePath}`);
          return null;
        }
        return await response.json();
      } catch (e) {
        console.error(`Fejl ved fetch af ${filePath}:`, e);
        return null;
      }
    });

    const fileContents = await Promise.all(fetchPromises);
    const validFiles = fileContents.filter(content => content !== null);

    if (validFiles.length === 0) {
      console.error(`Ingen gyldige filer fundet for pakke: ${registryEntry.id}`);
      return null;
    }

    let allLevels: LevelData[] = [];
    let firstMetadata: LevelSetMetadata | null = null;

    validFiles.forEach((data) => {
      // Håndter om data er et råt array eller et objekt med levels property
      const levelsArray = Array.isArray(data) ? data : (data.levels || []);
      if (levelsArray.length === 0) return;

      // Find grid størrelse: enten fra metadata eller fra første level i filen
      const gridStr = (!Array.isArray(data) && data.metadata?.grid) 
        ? data.metadata.grid 
        : (levelsArray[0].grid || "5x5");
      
      const grid = parseGridSize(gridStr);
      
      if (!firstMetadata) {
        firstMetadata = (!Array.isArray(data) && data.metadata) 
          ? data.metadata 
          : { name: registryEntry.name['en'], version: "1.0", grid: gridStr };
      }

      const processedLevels = levelsArray.map((l: any) => loadLevelFromJson(l, grid));
      allLevels = [...allLevels, ...processedLevels];
    });

    if (allLevels.length === 0) return null;

    const result: LevelSetResponse = {
      metadata: firstMetadata || { name: registryEntry.id, version: "1.0", grid: "5x5" },
      levels: allLevels
    };
    
    levelSetCache[registryEntry.id] = result;
    return result;
  } catch (error) {
    console.error("Fejl ved indlæsning af banepakke:", error);
    return null;
  }
};

export const isSetUnlocked = (id: string, completedLevels: { [key: string]: number[] }, registry: LevelRegistryEntry[]): boolean => {
  // All sets are now unlocked by default
  return true;
};
