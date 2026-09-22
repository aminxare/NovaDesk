import { db, DBFileItem } from '../db/db';

export class FileService {
  async initializeDefaults(): Promise<void> {
    try {
      const count = await db.files.count();
      if (count === 0) {
        const defaults: DBFileItem[] = [
          { id: 'projects', name: 'Projects', type: 'folder', parentId: null, date: '2026-09-22 14:30' },
          { id: 'proj-1', name: 'NovaDesk App.tsx', type: 'file', parentId: 'projects', size: '24 KB', date: '2026-09-22 12:15', extension: 'tsx', content: '// NovaDesk App component\nexport const App = () => {\n  return <div>Hello NovaDesk</div>;\n};' },
          { id: 'proj-2', name: 'systemStore.ts', type: 'file', parentId: 'projects', size: '4.2 KB', date: '2026-09-21 18:40', extension: 'ts', content: '// System store state management\nexport const useSystemStore = () => {};' },
          { id: 'proj-3', name: 'tailwind.config.mjs', type: 'file', parentId: 'projects', size: '1.8 KB', date: '2026-09-20 09:10', extension: 'mjs', content: '// Tailwind configuration' },
          { id: 'proj-4', name: 'README.md', type: 'file', parentId: 'projects', size: '3.5 KB', date: '2026-09-19 15:20', extension: 'md', content: '# NovaDesk Project\nAdvanced Web Desktop Environment.' },
          
          { id: 'documents', name: 'Documents', type: 'folder', parentId: null, date: '2026-09-22 10:12' },
          { id: 'doc-1', name: 'Meeting Notes.txt', type: 'file', parentId: 'documents', size: '1.2 KB', date: '2026-09-22 09:30', extension: 'txt', content: 'Meeting Notes:\n1. Review Dexie.js persistence.\n2. Verify offline support.' },
          { id: 'doc-2', name: 'Project Roadmap.md', type: 'file', parentId: 'documents', size: '8.4 KB', date: '2026-09-21 16:00', extension: 'md', content: '# Roadmap 2026\n- IndexedDB storage\n- Advanced Notepad\n- File Explorer' },
          { id: 'doc-3', name: 'Budget 2026.csv', type: 'file', parentId: 'documents', size: '15.6 KB', date: '2026-09-18 11:25', extension: 'csv', content: 'Category,Q1,Q2\nSoftware,100,200\nHardware,300,400' },

          { id: 'pictures', name: 'Pictures', type: 'folder', parentId: null, date: '2026-09-21 20:15' },
          { id: 'pic-1', name: 'Windows Bloom.png', type: 'file', parentId: 'pictures', size: '2.4 MB', date: '2026-09-21 20:15', extension: 'png' },
          { id: 'pic-2', name: 'Desktop Wallpaper.jpg', type: 'file', parentId: 'pictures', size: '3.8 MB', date: '2026-09-20 14:10', extension: 'jpg' },
          { id: 'pic-3', name: 'Logo Concept.svg', type: 'file', parentId: 'pictures', size: '45 KB', date: '2026-09-19 17:50', extension: 'svg' },

          { id: 'downloads', name: 'Downloads', type: 'folder', parentId: null, date: '2026-09-22 15:00' },
          { id: 'dl-1', name: 'NodeJS v22 Installer.pkg', type: 'file', parentId: 'downloads', size: '48.2 MB', date: '2026-09-22 14:55', extension: 'pkg' },
          { id: 'dl-2', name: 'Font Bundle.zip', type: 'file', parentId: 'downloads', size: '12.4 MB', date: '2026-09-21 11:00', extension: 'zip' },
          { id: 'dl-3', name: 'Report Q3.pdf', type: 'file', parentId: 'downloads', size: '1.9 MB', date: '2026-09-20 16:30', extension: 'pdf' },
        ];
        await db.files.bulkAdd(defaults);
      }
    } catch (err) {
      console.error('FileService: Failed to initialize defaults:', err);
    }
  }

  async getAllFiles(): Promise<DBFileItem[]> {
    return await db.files.toArray();
  }

  async getFileById(id: string): Promise<DBFileItem | undefined> {
    return await db.files.get(id);
  }

  async getFilesByParent(parentId: string | null): Promise<DBFileItem[]> {
    return await db.files.where('parentId').equals(parentId || '').toArray();
  }

  async searchFiles(query: string): Promise<DBFileItem[]> {
    const q = query.toLowerCase();
    const all = await db.files.toArray();
    return all.filter((item) => item.name.toLowerCase().includes(q));
  }

  async createFolder(name: string, parentId: string | null): Promise<DBFileItem> {
    const newItem: DBFileItem = {
      id: `folder-${Date.now()}`,
      name,
      type: 'folder',
      parentId,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    await db.files.add(newItem);
    return newItem;
  }

  async createFile(name: string, parentId: string | null, content: string = ''): Promise<DBFileItem> {
    const extension = name.split('.').pop() || 'txt';
    const newItem: DBFileItem = {
      id: `file-${Date.now()}`,
      name,
      type: 'file',
      parentId: parentId || 'documents',
      size: `${Math.max(1, Math.round(content.length / 1024))} KB`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      extension,
      content,
    };
    await db.files.add(newItem);
    return newItem;
  }

  async updateFileContent(id: string, content: string): Promise<void> {
    await db.files.update(id, {
      content,
      size: `${Math.max(1, Math.round(content.length / 1024))} KB`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });
  }

  async deleteItem(id: string): Promise<void> {
    const children = await db.files.where('parentId').equals(id).toArray();
    for (const child of children) {
      await this.deleteItem(child.id);
    }
    await db.files.delete(id);
  }
}

export const fileService = new FileService();
