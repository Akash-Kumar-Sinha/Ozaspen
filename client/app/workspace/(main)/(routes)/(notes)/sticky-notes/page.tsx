"use client";

import StickyNotes from "@/components/StickyNotes/StickyNotes";
import {
  fetchStickyNotes,
  NotesState,
  reorganizeNotes,
} from "@/app/lib/features/notesSlice";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import LoadingStickyNotes from "@/components/StickyNotes/LoadingStickyNotes";

const Notes = () => {
  const { notes, isLoading, error } = useAppSelector((state) => state.notes);
  const dispatch = useAppDispatch();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current && notes.length === 0 && !isLoading) {
      hasFetched.current = true;
      dispatch(fetchStickyNotes());
    }
  }, [dispatch, notes.length, isLoading]);

  useEffect(() => {
    const handleResize = () => {
      if (notes.length > 0) {
        const timeoutId = setTimeout(() => {
          dispatch(reorganizeNotes());
        }, 150);

        return () => clearTimeout(timeoutId);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch, notes.length]);

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
    <div className="h-full w-full overflow-auto relative">
      <div className="absolute inset-0">
        <div className="hidden lg:block relative">
          <AnimatePresence mode="wait">
            {notes.map((note: NotesState) => (
              <StickyNotes key={note.ID} {...note} />
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:hidden p-2 sm:p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 md:gap-6 auto-rows-max">
            <AnimatePresence mode="wait">
              {notes.map((note: NotesState) => (
                <div key={note.ID} className="w-full">
                  <StickyNotes {...note} />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
