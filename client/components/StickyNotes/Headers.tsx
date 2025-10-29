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
      style={{ height: "48px" }}
    >
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={clsx(
          "absolute top-0 left-0 right-0 h-12",
          "rounded-t-xl backdrop-blur-sm",
          "flex flex-col justify-center",
          "transition-all duration-300",
          isDarkBackground
            ? "bg-white/5 hover:bg-white/10"
            : "bg-black/3 hover:bg-black/5"
        )}
        style={{
          boxShadow: isDarkBackground
            ? "0 2px 8px rgba(255, 255, 255, 0.1)"
            : "0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          ref={titleContainerRef}
          className="flex items-center gap-1.5 justify-center px-2"
        >
          <AnimatePresence mode="wait">
            {isEditingTitle ? (
              <motion.div
                key="input"
                initial={{ width: 0 }}
                animate={{ width: "auto" }}
                exit={{ width: 0 }}
                className="flex items-center gap-1"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveTitle}
                  className={clsx(
                    "px-2 py-0.5 text-xs font-medium rounded border-2 outline-none w-32",
                    isDarkBackground
                      ? "bg-white/10 border-white/30 text-white placeholder-white/50"
                      : "bg-black/5 border-black/20 text-black placeholder-black/50"
                  )}
                  placeholder="Enter title..."
                  maxLength={50}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSaveTitle}
                  className={clsx(
                    "p-1 rounded hover:bg-white/10 transition-colors",
                    isDarkBackground ? "text-white/70" : "text-black/70"
                  )}
                >
                  <Check className="w-3 h-3" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <span
                  className={clsx(
                    "text-xs font-semibold truncate max-w-[150px]",
                    isDarkBackground ? "text-white/90" : "text-black/90"
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
                    "p-1 rounded-lg transition-colors flex-shrink-0",
                    isDarkBackground
                      ? "text-white/50 hover:text-white/80 hover:bg-white/10"
                      : "text-black/50 hover:text-black/80 hover:bg-black/10"
                  )}
                  aria-label="Edit title"
                >
                  <Pencil className="w-3 h-3" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              type="button"
              className={clsx(
                "flex items-center gap-2 transition-all",
                "px-2 py-1 rounded-lg touch-none",
                !isMaximized && "cursor-move",
                isDarkBackground
                  ? "text-white/70 hover:text-white hover:bg-white/10"
                  : "text-black/70 hover:text-black hover:bg-black/10"
              )}
            >
              <GripVertical className="w-3.5 h-3.5 flex-shrink-0" />
              {CreatedAt && (
                <span className="text-[11px] font-medium whitespace-nowrap">
                  <CreationTime CreatedAt={CreatedAt} noteColor={NoteColors} />
                </span>
              )}
            </button>
          </div>

          <motion.div
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center gap-1 flex-shrink-0"
            role="toolbar"
          >
          <ConnectionStatus
            color={isConnected ? "green" : "red"}
            autoSave={isAutoSaving}
            noteColor={NoteColors}
            onClick={saveBlocks}
            isSaving={isSaving}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <GenerateLink NoteColors={NoteColors} ID={ID} />
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
      </motion.div>
    </header>
  );
};

export default Headers;