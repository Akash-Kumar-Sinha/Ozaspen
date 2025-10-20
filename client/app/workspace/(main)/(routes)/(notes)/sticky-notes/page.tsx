"use client";

import StickyNotes from "@/components/StickyNotes";
import { fetchStickyNotes, NotesState } from "@/app/lib/features/notesSlice";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import LoadingStickyNotes from "@/components/Loading/LoadingStickyNotes";

const Notes = () => {
  const { notes, isLoading, error } = useAppSelector((state) => state.notes);
  const dispatch = useAppDispatch();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      dispatch(fetchStickyNotes());
    }
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="h-full w-screen flex items-center justify-center">
        <LoadingStickyNotes />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-full w-screen overflow-auto relative">
      <div className="absolute inset-0">
        <div
          className="relative"
          style={{
            minHeight: "100vh",
            height: "200vh",
          }}
        >
          <AnimatePresence mode="wait">
            {notes.map((note: NotesState) => (
              <StickyNotes key={note.ID} {...note} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Notes;
