import { configureStore } from "@reduxjs/toolkit";
import notesReducer from "./features/notesSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      notes: notesReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
