import {
  LoadingErrorTypes,
  Role,
  StickyNoteTypes,
} from "@/app/types/StickyNotesTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_STICKYNOTES_DOMAIN } from "../constant";
import { getSocket } from "./socketSlice";
import { RootState } from "../store";
import { Block } from "@blocknote/core";

export interface stickyNotePermission {
  CanEdit: boolean;
  Role: Role;
}
export interface StickyNotesDetails extends LoadingErrorTypes {
  stickyNoteDetails: StickyNoteTypes | null;
  permission: stickyNotePermission | null;
  isSaving: boolean;
}

const initialState: StickyNotesDetails = {
  isLoading: false,
  error: null,
  stickyNoteDetails: null,
  permission: null,
  isSaving: false,
};

export const fetchStickyNotesUsingSharedToken = createAsyncThunk(
  "actionNote/fetchStickyNotesUsingSharedToken",
  async (token: string) => {
    const response = await axios.get(
      `${BACKEND_STICKYNOTES_DOMAIN}/get_sticky_note_by_share_link/${token}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

export const autoSaveBlocks = createAsyncThunk(
  "actionNote/autoSaveBlocks",
  async ({ blocks, ID }: { blocks: Block[]; ID: string }, thunkAPI) => {
    console.log("Auto-saving blocks...");
    const socket = getSocket();
    const state = thunkAPI.getState() as RootState;
    const isConnected = state.socket.isConnected;
    if (!isConnected || !socket) {
      console.warn("WebSocket is not connected. Auto-save aborted.");
      return;
    }

    const currentBlocksString = JSON.stringify(blocks);

    if (
      currentBlocksString ===
      JSON.stringify(state.actionNote.stickyNoteDetails?.Content?.Blocks)
    ) {
      console.log("No changes detected in blocks. Auto-save skipped.");
      return;
    }
    socket.send(
      JSON.stringify({
        type: "save_sticky_note",
        data: {
          sticky_note_id: ID,
          blocks: blocks,
        },
      })
    );
    await new Promise((resolve) => setTimeout(resolve, 100));

    return;
  }
);

const actionNoteSlice = createSlice({
  name: "actionNote",
  initialState,
  reducers: {
    setStickyNoteDetails(state, action) {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStickyNotesUsingSharedToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStickyNotesUsingSharedToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.permission = {
          CanEdit: action.payload.CanEdit,
          Role: action.payload.Role,
        };
        state.stickyNoteDetails = action.payload.stickyNoteDetails;
      })
      .addCase(fetchStickyNotesUsingSharedToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch sticky note";
      })
      .addCase(autoSaveBlocks.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(autoSaveBlocks.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(autoSaveBlocks.rejected, (state) => {
        state.isSaving = false;
      });
  },
});

export const { setStickyNoteDetails } = actionNoteSlice.actions;

export default actionNoteSlice.reducer;
