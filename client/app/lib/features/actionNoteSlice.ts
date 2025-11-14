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
import {
  Block,
  BlockNoteEditor,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
} from "@blocknote/core";
import { TrackEditor } from "@/lib/TrackEditor";

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
  async (
    {
      blocks,
      ID,
      editor,
    }: {
      blocks: Block[];
      ID: string;
      editor: BlockNoteEditor<
        DefaultBlockSchema,
        DefaultInlineContentSchema,
        DefaultStyleSchema
      >;
    },
    thunkAPI
  ) => {
    const socket = getSocket();
    const state = thunkAPI.getState() as RootState;
    const isConnected = state.socket.isConnected;
    if (!isConnected || !socket) {
      return;
    }

    if (blocks.length > 1) {
      const blocksToSave = blocks.map((block, index) => ({
        number: index + 1,
        lineContent: block,
      }));

      socket.send(
        JSON.stringify({
          type: "save_sticky_note",
          data: {
            sticky_note_id: ID,
            blocks: blocksToSave,
          },
        })
      );
    } else {
      const tracks = TrackEditor(editor);
      if (!tracks) {
        return;
      }
      const { block, lineNumber } = tracks;

      socket.send(
        JSON.stringify({
          type: "save_sticky_note",
          data: {
            sticky_note_id: ID,
            blocks: [
              {
                number: lineNumber,
                lineContent: block,
              },
            ],
          },
        })
      );
    }

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
