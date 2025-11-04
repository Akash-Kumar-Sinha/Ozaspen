import { configureStore } from "@reduxjs/toolkit";
import notesReducer from "./features/notesSlice";
import socketReducer from "./features/socketSlice";
import actionNoteReducer from "./features/actionNoteSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      notes: notesReducer,
      socket: socketReducer,
      actionNote: actionNoteReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ["socket/setConnected"],
          ignoredPaths: ["socket.socket"],
        },
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
