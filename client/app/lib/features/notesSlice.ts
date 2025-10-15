import { createSlice } from "@reduxjs/toolkit";

export interface NotesState {
  id: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}



const initialState: NotesState [] = [];

export const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addNote: (state, action) => {
      state.push(action.payload);
      console.log("Updated state length:", state.length);
    },
    removeNote: (state, action) => {
      return state.filter((note) => note.id !== action.payload);
    },
    updateNotePosition: (state, action) => {
      const { id, x, y } = action.payload;
      const note = state.find((note) => note.id === id);
      if (note) {
        note.x = x;
        note.y = y;
      }
    },
    updateNoteSize: (state, action) => {
      const { id, width, height } = action.payload;
      const note = state.find((note) => note.id === id);
      if (note) {
        note.width = width;
        note.height = height;
      }
    },
   
  },
});

export const {
  addNote,
  removeNote,
  updateNotePosition,
  updateNoteSize,
} = notesSlice.actions;

export default notesSlice.reducer;