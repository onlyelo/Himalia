export const defaultVisuals = {
  mainLogo: '/images/himalia-logo.svg',
  homeHero: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
  organizationHero: 'https://images.unsplash.com/photo-1581822261290-991b38693d1b',
  fleetHero: 'https://images.unsplash.com/photo-1457364559154-aa2644600ebb',
  toolsHero: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa',
  knowledgeHero: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679',
  blogHero: 'https://images.unsplash.com/photo-1581822261290-991b38693d1b'
};

export type VisualConfig = typeof defaultVisuals;

// Split storage keys to avoid quota issues
const STORAGE_KEYS = {
  mainLogo: 'himalia-visual-mainLogo',
  homeHero: 'himalia-visual-homeHero',
  organizationHero: 'himalia-visual-organizationHero',
  fleetHero: 'himalia-visual-fleetHero',
  toolsHero: 'himalia-visual-toolsHero',
  knowledgeHero: 'himalia-visual-knowledgeHero',
  blogHero: 'himalia-visual-blogHero'
};

export interface ColorHistory {
  timestamp: number;
  color: string;
  page: string;
}

const COLOR_HISTORY_KEY = 'himalia-color-history';

export const getVisuals = (): VisualConfig => {
  try {
    const visuals = { ...defaultVisuals };
    
    // Load each visual separately
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        visuals[key as keyof VisualConfig] = saved;
      }
    });
    
    return visuals;
  } catch (error) {
    console.error('Error loading visuals:', error);
    return defaultVisuals;
  }
};

export const setVisuals = (updates: Partial<VisualConfig>): void => {
  try {
    // Save each visual separately
    Object.entries(updates).forEach(([key, value]) => {
      const storageKey = STORAGE_KEYS[key as keyof VisualConfig];
      if (storageKey && value) {
        localStorage.setItem(storageKey, value);
      }
    });
    
    window.dispatchEvent(new Event('visualsUpdated'));
  } catch (error) {
    console.error('Error saving visuals:', error);
    throw new Error('Failed to save visuals configuration');
  }
};

export const resetVisuals = (): void => {
  try {
    // Clear all visual storage keys
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    window.dispatchEvent(new Event('visualsUpdated'));
  } catch (error) {
    console.error('Error resetting visuals:', error);
    throw new Error('Failed to reset visuals configuration');
  }
};

export const getColorHistory = (): ColorHistory[] => {
  try {
    const saved = localStorage.getItem(COLOR_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading color history:', error);
    return [];
  }
};

export const addColorToHistory = (color: string, page: string): void => {
  try {
    const history = getColorHistory();
    history.unshift({
      timestamp: Date.now(),
      color,
      page
    });
    
    // Keep only last 50 colors
    const trimmedHistory = history.slice(0, 50);
    localStorage.setItem(COLOR_HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving color history:', error);
  }
};

export const clearColorHistory = (): void => {
  localStorage.removeItem(COLOR_HISTORY_KEY);
};