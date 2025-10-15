"use client";

import StickyNotes from "@/components/StickyNotes";
import { NotesState } from "@/app/lib/features/notesSlice";
import { useAppSelector } from "@/app/lib/hooks";
import { AnimatePresence } from "framer-motion";

const Notes = () => {
  const notes = useAppSelector((state) => state.notes);

  return (
    <div className="h-full relative">
      <AnimatePresence mode="popLayout">
        {notes.map((note: NotesState) => (
          <StickyNotes key={note.id} {...note} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Notes;
