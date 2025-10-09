import { X } from "lucide-react";
import { NotesState, removeNote } from "../lib/features/notesSlice";
import { colorMap } from "./types";

const StickyNotes = ({ id, color }: NotesState) => {
  return (
    <div
      className="absolute p-4 rounded-lg shadow-lg w-64 h-64 text-zinc-900"
      style={{
        backgroundColor: colorMap[color as keyof typeof colorMap],
        top: `${Math.random() * 300 + 50}px`,
        left: `${Math.random() * 400 + 100}px`,
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-zinc-800">Note #{id}</h3>
        <button
          onClick={() => removeNote(id)}
          className="text-zinc-700 hover:text-zinc-900 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <textarea
        placeholder="Write something..."
        className="w-full h-full bg-transparent outline-none resize-none text-sm text-zinc-800"
      />
    </div>
  );
};

export default StickyNotes;
