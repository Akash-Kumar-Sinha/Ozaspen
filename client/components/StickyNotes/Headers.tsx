import React, { useState, useRef, useEffect } from "react";
import {
  X,
  GripVertical,
  Maximize2,
  Minimize2,
  Pencil,
  Check,
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
  onTitleChange?: (newTitle: string) => void;
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
  onTitleChange,
}: HeadersProps) => {
  const dispatch = useAppDispatch();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(Title);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const pencilRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setEditedTitle(Title);
  }, [Title]);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();

      gsap.fromTo(
        inputRef.current,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(1.7)" }
      );
    }
  }, [isEditingTitle]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingTitle(true);

    if (pencilRef.current) {
      gsap.to(pencilRef.current, {
        rotation: 15,
        scale: 1.1,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== Title) {
      onTitleChange?.(editedTitle.trim());
    } else {
      setEditedTitle(Title);
    }
    setIsEditingTitle(false);

    if (pencilRef.current) {
      gsap.to(pencilRef.current, {
        rotation: 0,
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setEditedTitle(Title);
      setIsEditingTitle(false);
    }
  };

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
            <AnimatePresence>
              <Collaborator noteId={ID} noteColor={NoteColors} isDarkBackground={isDarkBackground} />
            </AnimatePresence>
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
          <AnimatePresence mode="wait">
            {isEditingTitle ? (
              <motion.div
                key="input"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveTitle}
                  className={clsx(
                    "px-2.5 py-1 text-xs font-semibold rounded-lg border-2 outline-none w-36",
                    "transition-all duration-200",
                    isDarkBackground
                      ? "bg-white/15 border-white/30 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/50"
                      : "bg-black/10 border-black/20 text-black placeholder-black/50 focus:bg-black/15 focus:border-black/40"
                  )}
                  placeholder="Enter title..."
                  maxLength={50}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSaveTitle}
                  className={clsx(
                    "p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200",
                    isDarkBackground ? "text-white/80" : "text-black/80"
                  )}
                >
                  <Check className="w-3.5 h-3.5" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <span
                  className={clsx(
                    "text-sm font-bold tracking-tight truncate max-w-[160px]",
                    isDarkBackground ? "text-white/95" : "text-black/95"
                  )}
                  title={Title}
                >
                  {Title}
                </span>
                <motion.button
                  ref={pencilRef}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleEditClick}
                  className={clsx(
                    "p-1.5 rounded-lg transition-all duration-200 flex-shrink-0",
                    isDarkBackground
                      ? "text-white/60 hover:text-white/90 hover:bg-white/10"
                      : "text-black/60 hover:text-black/90 hover:bg-black/10"
                  )}
                  aria-label="Edit title"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </header>
  );
};

export default Headers;
