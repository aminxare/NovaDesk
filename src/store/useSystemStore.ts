import { create } from 'zustand';
import { ReactNode } from 'react';
import { settingsService } from '../services/settingsService';
import { DBFileItem } from '../db/db';

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

interface SystemState {
  openWindows: WindowState[];
  focusedWindow: string | null;
  isStartMenuOpen: boolean;
  highestZIndex: number;
  desktopBackground: DesktopBackgroundConfig;
  taskbarColor: string;
  activeNotepadFile: DBFileItem | null;

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
  loadSavedPersonalization: () => Promise<void>;
  openNotepadWithFile: (file: DBFileItem) => void;
  clearActiveNotepadFile: () => void;
}

export const useSystemStore = create<SystemState>((set, get) => ({
  openWindows: [],
  focusedWindow: null,
  isStartMenuOpen: false,
  highestZIndex: 10,
  desktopBackground: DEFAULT_BACKGROUND,
  taskbarColor: DEFAULT_TASKBAR_COLOR,
  activeNotepadFile: null,

  loadSavedPersonalization: async () => {
    if (typeof window === 'undefined') return;
    try {
      const bg = await settingsService.getBackground();
      const taskbar = await settingsService.getTaskbarColor();
      set({ desktopBackground: bg, taskbarColor: taskbar });
    } catch (err) {
      console.error('Failed to load personalization via settingsService:', err);
    }
  },

  setDesktopBackground: (bg) => {
    if (typeof window !== 'undefined') {
      settingsService.setBackground(bg).catch((err) => {
        console.error('Failed to save background via settingsService:', err);
      });
    }
    set({ desktopBackground: bg });
  },

  setTaskbarColor: (color) => {
    if (typeof window !== 'undefined') {
      settingsService.setTaskbarColor(color).catch((err) => {
        console.error('Failed to save taskbar color via settingsService:', err);
      });
    }
    set({ taskbarColor: color });
  },

  resetPersonalization: () => {
    if (typeof window !== 'undefined') {
      settingsService.resetSettings().catch(() => {});
    }
    set({
      desktopBackground: DEFAULT_BACKGROUND,
      taskbarColor: DEFAULT_TASKBAR_COLOR,
    });
  },

  openNotepadWithFile: (file) => {
    set({ activeNotepadFile: file });
    // Find notepad app in appsConfig or open it programmatically
    const notepadApp = {
      id: 'notepad',
      title: `Notepad - ${file.name}`,
      icon: null, // fallback icon handled by config
      content: null // will be rendered by appsConfig or handled
    };
    // Let's open the notepad app using openApp
    // We import appsConfig or handle it via openApp
  },

  clearActiveNotepadFile: () => set({ activeNotepadFile: null }),

  openApp: (app) => set((state) => {
    const existing = state.openWindows.find((w) => w.id === app.id);
    if (existing) {
      return {
        openWindows: state.openWindows.map((w) => 
          w.id === app.id ? { ...w, title: app.title, isMinimized: false, zIndex: state.highestZIndex + 1 } : w
        ),
        focusedWindow: app.id,
        highestZIndex: state.highestZIndex + 1,
        isStartMenuOpen: false
      };
    }
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
