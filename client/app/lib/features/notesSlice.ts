import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BACKEND_STICKYNOTES_DOMAIN } from "../constant";
import axios from "axios";
import {
  LoadingErrorTypes,
  StickyNoteTypes,
} from "@/app/types/StickyNotesTypes";
import { Block } from "@blocknote/core";

export const DEFAULT_NOTE_WIDTH = 360;
export const DEFAULT_NOTE_HEIGHT = 300;

export interface NotesState extends StickyNoteTypes {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

interface NotesSliceState extends LoadingErrorTypes {
  notes: NotesState[];
}

const initialState: NotesSliceState = {
  notes: [],
  isLoading: false,
  error: null,
};

const calculateGridPosition = (
  index: number,
  noteWidth: number = DEFAULT_NOTE_WIDTH,
  noteHeight: number = DEFAULT_NOTE_HEIGHT
) => {
  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;

  let padding: number;
  let startX: number;
  let startY: number;

  if (windowWidth < 640) {
    padding = 0;
    startX = 0;
    startY = 20;
  } else if (windowWidth < 768) {
    padding = 10;
    startX = 10;
    startY = 30;
  } else if (windowWidth < 1024) {
    padding = 15;
    startX = 25;
    startY = 35;
  } else {
    padding = 20;
    startX = 50;
    startY = 40;
  }

  const sidebarWidth = windowWidth >= 768 ? 144 : 0;
  const availableWidth = Math.max(
    300,
    windowWidth - sidebarWidth - startX - padding
  );

  let responsiveNoteWidth = noteWidth;
  let responsiveNoteHeight = noteHeight;

  if (windowWidth < 640) {
    responsiveNoteWidth = Math.min(DEFAULT_NOTE_WIDTH, windowWidth - 20);
    responsiveNoteHeight = DEFAULT_NOTE_HEIGHT;
  } else if (windowWidth < 768) {
    responsiveNoteWidth = Math.min(DEFAULT_NOTE_WIDTH, (windowWidth - 40) / 2);
    responsiveNoteHeight = DEFAULT_NOTE_HEIGHT;
  } else if (windowWidth < 1024) {
    responsiveNoteWidth = Math.min(
      DEFAULT_NOTE_WIDTH,
      (windowWidth - sidebarWidth - 60) / 2
    );
    responsiveNoteHeight = DEFAULT_NOTE_HEIGHT;
  }

  const notesPerRow = Math.max(
    1,
    Math.floor(availableWidth / (responsiveNoteWidth + padding))
  );

  const row = Math.floor(index / notesPerRow);
  const col = index % notesPerRow;

  return {
    x: startX + col * (responsiveNoteWidth + padding),
    y: startY + row * (responsiveNoteHeight + padding),
    width: responsiveNoteWidth,
    height: responsiveNoteHeight,
  };
};

const fetchNotes = async () => {
  try {
    const { data } = await axios.get(
      `${BACKEND_STICKYNOTES_DOMAIN}/get_sticky_notes`,
      {
        withCredentials: true,
      }
    );

    const sortedNotes = (data.sticky_notes || []).reverse();
    const transformedNotes = sortedNotes.map(
      (backendNote: StickyNoteTypes, index: number) => {
        const position = calculateGridPosition(index);

        return {
          ID: backendNote.ID,
          CreatedAt: backendNote.CreatedAt,
          UpdatedAt: backendNote.UpdatedAt,
          DeletedAt: backendNote.DeletedAt,
          OwnerID: backendNote.OwnerID,
          Owner: backendNote.Owner,
          Title: backendNote.Title,
          NoteColors: backendNote.NoteColors,
          ContentID: backendNote.ContentID,
          ShareLinkID: backendNote.ShareLinkID,
          ShareLink: backendNote.ShareLink,
          x: position.x,
          y: position.y,
          width: position.width,
          height: position.height,
          zIndex: 1000 + index,
        };
      }
    );

    return transformedNotes;
  } catch {
    return [];
  }
};

export const fetchStickyNotes = createAsyncThunk(
  "notes/fetchNotes",
  async () => {
    const stickyNotes = await fetchNotes();
    return stickyNotes;
  }
);

export const createStickyNote = createAsyncThunk(
  "notes/createNote",
  async ({
    noteData,
    blocks,
  }: {
    noteData: { color: string };
    blocks: Block[];
  }) => {
    try {
      const block = blocks[0];
      const { data } = await axios.post(
        `${BACKEND_STICKYNOTES_DOMAIN}/create_new_sticky_note`,
        {
          note_colors: noteData.color,
          id: block.id,
          type: block.type,
          props: block.props,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        const position = calculateGridPosition(0);

        return {
          ID: data.sticky_note?.ID || Date.now().toString(),
          CreatedAt: data.sticky_note?.CreatedAt || new Date().toISOString(),
          UpdatedAt: data.sticky_note?.UpdatedAt || new Date().toISOString(),
          DeletedAt: data.sticky_note?.DeletedAt || null,
          OwnerID: data.sticky_note?.OwnerID || "",
          Owner: data.sticky_note?.Owner || {
            ID: "",
            CreatedAt: "",
            UpdatedAt: "",
            DeletedAt: null,
            Email: "",
            Username: "",
            FirstName: "",
            MiddleName: "",
            LastName: "",
            Avatar: "",
          },
          Title: data.sticky_note.Title,
          NoteColors: noteData.color,
          ContentID: data.sticky_note?.ContentID,
          ShareLinkID: data.sticky_note?.ShareLinkID || null,
          ShareLink: data.sticky_note?.ShareLink || null,
          x: position.x,
          y: position.y,
          width: position.width,
          height: position.height,
          zIndex: 1000,
        };
      } else {
        throw new Error(data.message || "Failed to create sticky note");
      }
    } catch (error) {
      throw error;
    }
  }
);

export const deleteStickyNote = createAsyncThunk(
  "notes/deleteNote",
  async (noteId: string) => {
    try {
      const { data } = await axios.delete(
        `${BACKEND_STICKYNOTES_DOMAIN}/delete_sticky_note/${noteId}`,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        return noteId;
      } else {
        throw new Error(data.message || "Failed to delete sticky note");
      }
    } catch (error) {
      throw error;
    }
  }
);

export const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addNote: (state, action) => {
      state.notes.push(action.payload);
    },
    fetchNotes: (state, action) => {
      state.notes = action.payload;
    },
    reorganizeNotes: (state) => {
      state.notes.forEach((note, index) => {
        const position = calculateGridPosition(index);
        note.x = position.x;
        note.y = position.y;
        note.width = position.width;
        note.height = position.height;
        note.zIndex = 1000 + index;
      });
    },
    updateNotePosition: (state, action) => {
      const { ID, x, y } = action.payload;
      const note = state.notes.find((note) => note.ID === ID);
      if (note) {
        note.x = x;
        note.y = y;
      }
    },
    updateNoteSize: (state, action) => {
      const { ID, width, height } = action.payload;
      const note = state.notes.find((note) => note.ID === ID);
      if (note) {
        note.width = width;
        note.height = height;
      }
    },
    bringNoteForward: (state, action) => {
      const { ID } = action.payload;
      const note = state.notes.find((note) => note.ID === ID);
      if (note) {
        const maxZIndex = Math.max(...state.notes.map((n) => n.zIndex));
        note.zIndex = maxZIndex + 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStickyNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStickyNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notes = action.payload;
        state.error = null;
      })
      .addCase(fetchStickyNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch notes";
      })
      .addCase(createStickyNote.fulfilled, (state, action) => {
        state.notes.unshift(action.payload);
        state.notes.forEach((note, index) => {
          const position = calculateGridPosition(index);
          note.x = position.x;
          note.y = position.y;
          note.width = position.width;
          note.height = position.height;
          note.zIndex = 1000 + index;
        });
        state.error = null;
      })
      .addCase(createStickyNote.rejected, (state, action) => {
        state.error = action.error.message || "Failed to create note";
      })
      .addCase(deleteStickyNote.pending, (state, action) => {
        const noteId = action.meta.arg;
        state.notes = state.notes.filter((note) => note.ID !== noteId);
        state.notes.forEach((note, index) => {
          const position = calculateGridPosition(index);
          note.x = position.x;
          note.y = position.y;
          note.width = position.width;
          note.height = position.height;
          note.zIndex = 1000 + index;
        });
      })
      .addCase(deleteStickyNote.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(deleteStickyNote.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete note";
      });
  },
});

export const {
  addNote,
  reorganizeNotes,
  updateNotePosition,
  updateNoteSize,
  bringNoteForward,
} = notesSlice.actions;

export default notesSlice.reducer;
