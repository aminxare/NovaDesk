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

interface SystemState {
  openWindows: WindowState[];
  focusedWindow: string | null;
  isStartMenuOpen: boolean;
  highestZIndex: number;

  // Actions
  openApp: (app: Omit<WindowState, 'isMinimized' | 'isMaximized' | 'zIndex'>) => void;
  closeApp: (id: string) => void;
  minimizeApp: (id: string) => void;
  maximizeApp: (id: string) => void;
  restoreApp: (id: string) => void;
  focusApp: (id: string) => void;
  toggleStartMenu: () => void;
  closeStartMenu: () => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  openWindows: [],
  focusedWindow: null,
  isStartMenuOpen: false,
  highestZIndex: 10,

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
