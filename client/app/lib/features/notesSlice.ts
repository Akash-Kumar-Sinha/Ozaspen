import { createSlice } from "@reduxjs/toolkit";

export interface NotesState {
  id: number;
  color: string;
}

const initialState: NotesState[] = [];

export const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addNote: (state, action) => {
      state.push(action.payload);
    },
    removeNote: (state, action) => {
      return state.filter(note => note.id !== action.payload);
    },
  },
});

export const { addNote, removeNote } = notesSlice.actions;
export default notesSlice.reducer;