import { configureStore } from '@reduxjs/toolkit';
import notepadReducer from './notepadSlice';

export const store = configureStore({
  reducer: {
    notepad: notepadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
