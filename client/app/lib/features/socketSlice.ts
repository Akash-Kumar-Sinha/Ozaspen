import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import { WEBSOCKET_STICKYNOTES_DOMAIN } from "../constant";

let globalSocket: WebSocket | null = null;

export interface SocketState {
  isConnected: boolean;
  socket: WebSocket | null;
}

const initialState: SocketState = { isConnected: false, socket: null };

export const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      state.socket = globalSocket;
    },
    disconnect: (state) => {
      globalSocket?.close();
      globalSocket = null;
      state.isConnected = false;
      state.socket = null;
    },
  },
});

export const { setConnected, disconnect } = socketSlice.actions;

export const connect = () => (dispatch: AppDispatch) => {
  if (globalSocket) {
    console.log("WebSocket already exists, skipping connection");
    return;
  }

  const url = WEBSOCKET_STICKYNOTES_DOMAIN;
  if (!url) {
    console.error(
      "WebSocket URL is not defined. Check your environment variables."
    );
    return;
  }

  globalSocket = new WebSocket(url);

  globalSocket.addEventListener("open", () => {
    console.log("✅ WebSocket Connected successfully");
    dispatch(setConnected(true));
  });

  globalSocket.addEventListener("close", (event) => {
    console.log(
      "❌ WebSocket Disconnected. Code:",
      event.code,
      "Reason:",
      event.reason
    );
    dispatch(setConnected(false));
    globalSocket = null;
  });

  globalSocket.addEventListener("error", (error) => {
    console.error("❌ WebSocket error:", error);
    dispatch(setConnected(false));
  });
};

export const getSocket = () => globalSocket;
export default socketSlice.reducer;
