import React from "react";

import { X, GripVertical, Maximize2, Minimize2 } from "lucide-react";
import clsx from "clsx";
import { useAppDispatch } from "@/app/lib/hooks";
import { ConnectionStatus } from "./ConnectionStatus";
import { AdaptiveButton } from "../Button/AdaptiveButton";
import GenerateLink from "./GenerateLink";
import CreationTime from "../Shared/CreationTime";
import { deleteStickyNote } from "@/app/lib/features/notesSlice";

interface HeadersProps {
  isDarkBackground: boolean;
  isMaximized: boolean;
  CreatedAt?: string;
  NoteColors: string;
  isConnected: boolean;
  isAutoSaving: boolean;
  isSaving: boolean;
  saveBlocks: () => void;
  toggleMaximize: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  ID: string;
}
const Headers = ({
  isDarkBackground,
  isMaximized,
  CreatedAt,
  NoteColors,
  isConnected,
  isAutoSaving,
  isSaving,
  saveBlocks,
  toggleMaximize,
  handleMouseDown,
  ID,
}: HeadersProps) => {
  const dispatch = useAppDispatch();
  return (
    <header
      className={clsx("relative flex-shrink-0")}
      style={{ height: "48px" }}
    >
      {/* Curved Tab Container */}
      <div
        className={clsx(
          "absolute top-0 left-3 right-3 h-10",
          "rounded-t-xl backdrop-blur-sm",
          "flex items-center justify-between px-3",
          "transition-all duration-300",
          isDarkBackground
            ? "bg-white/5 hover:bg-white/10"
            : "bg-black/3 hover:bg-black/5"
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Drag Handle */}
        <button
          type="button"
          className={clsx(
            "flex items-center gap-2 transition-all",
            "px-2 py-1.5 rounded-lg touch-none",
            !isMaximized && "cursor-move",
            isDarkBackground
              ? "text-white/70 hover:text-white hover:bg-white/10"
              : "text-black/70 hover:text-black hover:bg-black/10"
          )}
        >
          <GripVertical className="w-3.5 h-3.5 flex-shrink-0" />
          {CreatedAt && (
            <span className="text-[11px] font-medium">
              <CreationTime CreatedAt={CreatedAt} noteColor={NoteColors} />
            </span>
          )}
        </button>

        {/* Toolbar */}
        <div className="flex items-center gap-1" role="toolbar">
          <ConnectionStatus
            color={isConnected ? "green" : "red"}
            autoSave={isAutoSaving}
            noteColor={NoteColors}
            onClick={saveBlocks}
            isSaving={isSaving}
          />

          <AdaptiveButton
            onClick={toggleMaximize}
            noteColor={NoteColors}
            aria-label={isMaximized ? "Restore note" : "Maximize note"}
            className="h-7 w-7"
          >
            {isMaximized ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </AdaptiveButton>

            <GenerateLink NoteColors={NoteColors} />

          <AdaptiveButton
            onClick={() => dispatch(deleteStickyNote(ID))}
            noteColor={NoteColors}
            variant="destructive"
            aria-label="Delete note"
            className="h-7 w-7"
          >
            <X className="w-3.5 h-3.5" />
          </AdaptiveButton>
        </div>
      </div>
    </header>
  );
};

export default Headers;
