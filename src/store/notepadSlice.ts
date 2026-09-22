import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fileService } from '../services/fileService';
import { DBFileItem } from '../db/db';

export interface NotepadState {
  currentFile: DBFileItem | null;
  content: string;
  isModified: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotepadState = {
  currentFile: null,
  content: '',
  isModified: false,
  isLoading: false,
  error: null,
};

// Async thunk to load a file from Dexie via fileService
export const loadFileContent = createAsyncThunk(
  'notepad/loadFileContent',
  async (fileId: string) => {
    const file = await fileService.getFileById(fileId);
    if (!file) throw new Error('File not found');
    return file;
  }
);

// Async thunk to save file content to Dexie via fileService
export const saveFileContent = createAsyncThunk(
  'notepad/saveFileContent',
  async (_, { getState }) => {
    const state = getState() as { notepad: NotepadState };
    const { currentFile, content } = state.notepad;
    if (!currentFile) return null;
    await fileService.updateFileContent(currentFile.id, content);
    return { id: currentFile.id, content };
  }
);

export const notepadSlice = createSlice({
  name: 'notepad',
  initialState,
  reducers: {
    setOpenNoticeFile: (state, action: PayloadAction<DBFileItem>) => {
      state.currentFile = action.payload;
      state.content = action.payload.content || '';
      state.isModified = false;
    },
    setContent: (state, action: PayloadAction<string>) => {
      state.content = action.payload;
      state.isModified = true;
    },
    newDocument: (state) => {
      state.currentFile = null;
      state.content = '';
      state.isModified = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFileContent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadFileContent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFile = action.payload;
        state.content = action.payload.content || '';
        state.isModified = false;
      })
      .addCase(loadFileContent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load file';
      })
      .addCase(saveFileContent.fulfilled, (state) => {
        state.isModified = false;
      });
  },
});

export const { setOpenNoticeFile, setContent, newDocument } = notepadSlice.actions;
export default notepadSlice.reducer;
