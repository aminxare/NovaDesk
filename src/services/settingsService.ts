import { db } from '../db/db';
import { DesktopBackgroundConfig, DEFAULT_BACKGROUND, DEFAULT_TASKBAR_COLOR } from '../store/useSystemStore';

export class SettingsService {
  async getBackground(): Promise<DesktopBackgroundConfig> {
    try {
      const saved = await db.settings.get('desktopBackground');
      if (saved && saved.value) {
        return saved.value;
      }
    } catch (err) {
      console.error('SettingsService: Failed to get background:', err);
    }
    return DEFAULT_BACKGROUND;
  }

  async setBackground(bg: DesktopBackgroundConfig): Promise<void> {
    await db.settings.put({ key: 'desktopBackground', value: bg });
  }

  async getTaskbarColor(): Promise<string> {
    try {
      const saved = await db.settings.get('taskbarColor');
      if (saved && saved.value) {
        return saved.value;
      }
    } catch (err) {
      console.error('SettingsService: Failed to get taskbar color:', err);
    }
    return DEFAULT_TASKBAR_COLOR;
  }

  async setTaskbarColor(color: string): Promise<void> {
    await db.settings.put({ key: 'taskbarColor', value: color });
  }

  async resetSettings(): Promise<void> {
    await db.settings.delete('desktopBackground');
    await db.settings.delete('taskbarColor');
  }
}

export const settingsService = new SettingsService();
