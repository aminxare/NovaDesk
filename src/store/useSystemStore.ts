import { create } from 'zustand';
import { ReactNode } from 'react';

export interface WindowState {
  id: string;
  title: string;
  icon?: ReactNode;
  content: ReactNode;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export type BackgroundType = 'image' | 'color' | 'gradient';

export interface DesktopBackgroundConfig {
  type: BackgroundType;
  value: string;
  name?: string;
}

export const DEFAULT_BACKGROUND: DesktopBackgroundConfig = {
  type: 'image',
  value: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80',
  name: 'Windows Bloom'
};

export const DEFAULT_TASKBAR_COLOR = 'rgba(28, 28, 28, 0.9)';

const STORAGE_KEY_BG = 'novadesk_desktop_background';
const STORAGE_KEY_TASKBAR = 'novadesk_taskbar_color';

interface SystemState {
  openWindows: WindowState[];
  focusedWindow: string | null;
  isStartMenuOpen: boolean;
  highestZIndex: number;
  desktopBackground: DesktopBackgroundConfig;
  taskbarColor: string;

  // Actions
  openApp: (app: Omit<WindowState, 'isMinimized' | 'isMaximized' | 'zIndex'>) => void;
  closeApp: (id: string) => void;
  minimizeApp: (id: string) => void;
  maximizeApp: (id: string) => void;
  restoreApp: (id: string) => void;
  focusApp: (id: string) => void;
  toggleStartMenu: () => void;
  closeStartMenu: () => void;
  setDesktopBackground: (bg: DesktopBackgroundConfig) => void;
  setTaskbarColor: (color: string) => void;
  resetPersonalization: () => void;
  loadSavedPersonalization: () => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  openWindows: [],
  focusedWindow: null,
  isStartMenuOpen: false,
  highestZIndex: 10,
  desktopBackground: DEFAULT_BACKGROUND,
  taskbarColor: DEFAULT_TASKBAR_COLOR,

  loadSavedPersonalization: () => {
    if (typeof window === 'undefined') return;
    try {
      const savedBg = localStorage.getItem(STORAGE_KEY_BG);
      const savedTaskbar = localStorage.getItem(STORAGE_KEY_TASKBAR);
      const updates: Partial<SystemState> = {};
      if (savedBg) {
        updates.desktopBackground = JSON.parse(savedBg);
      }
      if (savedTaskbar) {
        updates.taskbarColor = savedTaskbar;
      }
      if (Object.keys(updates).length > 0) {
        set(updates);
      }
    } catch {
      // Ignore storage errors
    }
  },

  setDesktopBackground: (bg) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_BG, JSON.stringify(bg));
      } catch {}
    }
    set({ desktopBackground: bg });
  },

  setTaskbarColor: (color) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_TASKBAR, color);
      } catch {}
    }
    set({ taskbarColor: color });
  },

  resetPersonalization: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY_BG);
        localStorage.removeItem(STORAGE_KEY_TASKBAR);
      } catch {}
    }
    set({
      desktopBackground: DEFAULT_BACKGROUND,
      taskbarColor: DEFAULT_TASKBAR_COLOR,
    });
  },

  openApp: (app) => set((state) => {
    const existing = state.openWindows.find((w) => w.id === app.id);
    if (existing) {
      // If already open, just focus and restore it
      return {
        openWindows: state.openWindows.map((w) => 
          w.id === app.id ? { ...w, isMinimized: false, zIndex: state.highestZIndex + 1 } : w
        ),
        focusedWindow: app.id,
        highestZIndex: state.highestZIndex + 1,
        isStartMenuOpen: false
      };
    }
    // Otherwise open a new window
    return {
      openWindows: [
        ...state.openWindows,
        {
          ...app,
          isMinimized: false,
          isMaximized: false,
          zIndex: state.highestZIndex + 1
        }
      ],
      focusedWindow: app.id,
      highestZIndex: state.highestZIndex + 1,
      isStartMenuOpen: false
    };
  }),

  closeApp: (id) => set((state) => ({
    openWindows: state.openWindows.filter((w) => w.id !== id),
    focusedWindow: state.focusedWindow === id ? null : state.focusedWindow
  })),

  minimizeApp: (id) => set((state) => ({
    openWindows: state.openWindows.map((w) => w.id === id ? { ...w, isMinimized: true } : w),
    focusedWindow: state.focusedWindow === id ? null : state.focusedWindow
  })),

  maximizeApp: (id) => set((state) => ({
    openWindows: state.openWindows.map((w) => w.id === id ? { ...w, isMaximized: true } : w)
  })),

  restoreApp: (id) => set((state) => ({
    openWindows: state.openWindows.map((w) => w.id === id ? { ...w, isMaximized: false, isMinimized: false } : w)
  })),

  focusApp: (id) => set((state) => ({
    openWindows: state.openWindows.map((w) => 
      w.id === id ? { ...w, isMinimized: false, zIndex: state.highestZIndex + 1 } : w
    ),
    focusedWindow: id,
    highestZIndex: state.highestZIndex + 1,
    isStartMenuOpen: false
  })),

  toggleStartMenu: () => set((state) => ({ isStartMenuOpen: !state.isStartMenuOpen })),
  
  closeStartMenu: () => set({ isStartMenuOpen: false })
}));
