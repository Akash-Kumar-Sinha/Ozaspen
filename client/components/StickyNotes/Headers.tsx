import React, { useRef } from "react";
import {
  X,
  GripVertical,
  Maximize2,
  Minimize2,
} from "lucide-react";
import clsx from "clsx";
import { useAppDispatch } from "@/app/lib/hooks";
import { ConnectionStatus } from "./ConnectionStatus";
import { AdaptiveButton } from "../Button/AdaptiveButton";
import GenerateLink from "./GenerateLink";
import CreationTime from "../Shared/CreationTime";
import { deleteStickyNote } from "@/app/lib/features/notesSlice";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import Collaborator from "./Collaborator";
import StickyNoteTitle from "./StickyNoteTitle";
import { Role } from "@/app/types/StickyNotesTypes";

interface HeadersProps {
  isDarkBackground: boolean;
  isMaximized: boolean;
  CreatedAt?: string;
  NoteColors: string;
  isConnected: boolean;
  isAutoSaving: boolean;
  isSaving: boolean;
  Title: string;
  saveBlocks: () => void;
  toggleMaximize: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  ID: string;
  Role: Role;
}

const Headers = ({
  isDarkBackground,
  isMaximized,
  CreatedAt,
  NoteColors,
  isConnected,
  isAutoSaving,
  isSaving,
  Title,
  saveBlocks,
  toggleMaximize,
  handleMouseDown,
  ID,
  Role,
}: HeadersProps) => {
  const dispatch = useAppDispatch();
  const titleContainerRef = useRef<HTMLDivElement>(null);

  const handleDelete = () => {
    const headerElement = titleContainerRef.current?.closest("header");
    if (headerElement) {
      gsap.to(headerElement, {
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          dispatch(deleteStickyNote(ID));
        },
      });
    } else {
      dispatch(deleteStickyNote(ID));
    }
  };

  return (
    <header
      className={clsx("relative flex-shrink-0")}
      style={{ height: "52px" }}
    >
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={clsx(
          "absolute top-0 left-0 right-0 h-full",
          "rounded-t-xl backdrop-blur-md",
          "flex flex-col justify-center gap-1.5",
          "transition-all duration-300 px-3 py-2",
          isDarkBackground
            ? "bg-white/8 hover:bg-white/12"
            : "bg-black/4 hover:bg-black/6"
        )}
        style={{
          boxShadow: isDarkBackground
            ? "0 1px 3px rgba(255, 255, 255, 0.1)"
            : "0 1px 3px rgba(0, 0, 0, 0.1)",
          borderBottom: isDarkBackground
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : "1px solid rgba(0, 0, 0, 0.05)",
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              type="button"
              className={clsx(
                "flex items-center gap-1.5 transition-all duration-200",
                "px-2 py-1 rounded-lg touch-none",
                !isMaximized && "cursor-move hover:scale-105",
                isDarkBackground
                  ? "text-white/70 hover:text-white/90 hover:bg-white/10"
                  : "text-black/70 hover:text-black/90 hover:bg-black/10"
              )}
            >
              <GripVertical className="w-3.5 h-3.5 flex-shrink-0" />
              {CreatedAt && (
                <span className="text-[10px] font-medium whitespace-nowrap">
                  <CreationTime CreatedAt={CreatedAt} noteColor={NoteColors} />
                </span>
              )}
            </button>
          </div>

          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center gap-1.5 flex-shrink-0"
            role="toolbar"
          >
            <ConnectionStatus
              color={isConnected ? "green" : "red"}
              autoSave={isAutoSaving}
              noteColor={NoteColors}
              onClick={saveBlocks}
              isSaving={isSaving}
            />
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
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
            </motion.div>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <GenerateLink NoteColors={NoteColors} ID={ID} />
            </motion.div>
            <AnimatePresence>
              <Collaborator
                noteId={ID}
                noteColor={NoteColors}
                isDarkBackground={isDarkBackground}
                role={Role}
              />
            </AnimatePresence>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <AdaptiveButton
                onClick={handleDelete}
                noteColor={NoteColors}
                variant="destructive"
                aria-label="Delete note"
                className="h-7 w-7"
              >
                <X className="w-3.5 h-3.5" />
              </AdaptiveButton>
            </motion.div>
          </motion.div>
        </div>

        <div
          ref={titleContainerRef}
          className="flex items-center justify-between"
        >
          <StickyNoteTitle
            stickyNoteId={ID}
            title={Title}
            isDarkBackground={isDarkBackground}
            role={Role}
          />
        </div>
      </motion.div>
    </header>
  );
};

export default Headers;
