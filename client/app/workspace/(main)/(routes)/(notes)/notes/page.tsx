"use client";
import StickyNotes from "@/app/components/StickyNotes";
import { NotesState } from "@/app/lib/features/notesSlice";
import { useAppSelector } from "@/app/lib/hooks";

const Notes = () => {
  const notes = useAppSelector((state) => state.notes);
  return (
    <div className="h-full ">
      {notes.map((note: NotesState) => (
        <StickyNotes key={note.id} {...note} />
      ))}
    </div>
  );
};

export default Notes;
