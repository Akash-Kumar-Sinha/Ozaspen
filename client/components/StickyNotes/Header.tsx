import React, { useRef } from "react";
import { X, Maximize2, Minimize2, Eye, Users, Trash } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { useAppDispatch } from "@/app/lib/hooks";
import { ConnectionStatus } from "./ConnectionStatus";
import { AdaptiveButton } from "../Button/AdaptiveButton";
import GenerateLink from "./GenerateLink";
import Collaborator from "./Collaborator";
import StickyNoteTitle from "./StickyNoteTitle";
import { deleteStickyNote } from "@/app/lib/features/notesSlice";
import { Role } from "@/app/types/StickyNotesTypes";

interface HeaderProps {
  isDarkBackground: boolean;
  isMaximized?: boolean;
  CreatedAt?: string;
  NoteColors: string;
  isConnected?: boolean;
  isSaving?: boolean;
  Title: string;
  saveBlocks?: () => void;
  toggleMaximize?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleBringForward?: (e: React.MouseEvent) => void;
  ID: string;
  Role: Role;
  CanEdit?: boolean;
  badgeRef?: React.RefObject<HTMLDivElement>;
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
  handleClose?: () => void;
  primaryColor?: string;
  page: string;
}

const Header = ({
  isDarkBackground,
  isMaximized = false,
  NoteColors,
  isConnected = false,
  isSaving = false,
  Title,
  saveBlocks,
  toggleMaximize,
  handleMouseDown,
  handleBringForward,
  ID,
  Role,
  CanEdit = false,
  badgeRef,
  closeButtonRef,
  handleClose,
  primaryColor = "#9333ea",
  page,
}: HeaderProps) => {
  const dispatch = useAppDispatch();
  const titleContainerRef = useRef<HTMLDivElement>(null);

  const isSharedPage = page === "shared-sticky-note";
  const isStickyNote = page === "sticky-note";

  const isOwner = Role === "owner";
  const isEditor = Role === "editor" || CanEdit;
  const isOwnerOrEditor = isOwner || isEditor;

  const showDelete = isOwner && isStickyNote;
  const showMaximize = isOwnerOrEditor && toggleMaximize && isStickyNote;
  const showCloseButton = Boolean(closeButtonRef && handleClose);

  const enableDragging = !isMaximized && !isSharedPage;

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

  const getRoleIcon = () => {
    if (Role === "owner") return <Users className="h-3.5 w-3.5" />;
    if (CanEdit || Role === "editor") return <Users className="h-3.5 w-3.5" />;
    return <Eye className="h-3.5 w-3.5" />;
  };

  const getRoleText = () => {
    if (Role === "owner") return "Owner";
    if (CanEdit || Role === "editor") return "Edit Access";
    return "View Access";
  };
  return (
    <header
      className={clsx(
        "flex-shrink-0 px-2 py-2.5",
        "border-b backdrop-blur-sm transition-colors duration-300",
        "[border-color:var(--note-header-border)]",
        "[background-color:var(--note-header-bg)]",
        !isMaximized && "cursor-move"
      )}
      onMouseDown={enableDragging ? handleMouseDown : undefined}
      onClick={enableDragging ? handleBringForward : undefined}
    >
      <div className="flex  items-center justify-between gap-1">
        <StickyNoteTitle
          stickyNoteId={ID}
          title={Title}
          isDarkBackground={isDarkBackground}
          role={Role}
        />

        <div className="flex items-center gap-0 flex-shrink-0">
          {isSharedPage && (
            <div
              ref={badgeRef}
              className={clsx(
                "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                "transition-all duration-300",
                `${
                  isDarkBackground
                    ? "bg-white/5 text-white"
                    : "bg-black/5 text-black"
                }`
              )}
            >
              {getRoleIcon()}
              <span className="hidden sm:inline">{getRoleText()}</span>
            </div>
          )}

          {isOwnerOrEditor && (
            <>
              <AnimatePresence>
                <Collaborator
                  noteId={ID}
                  noteColor={NoteColors}
                  isDarkBackground={isDarkBackground}
                  role={Role}
                />
              </AnimatePresence>

              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <GenerateLink NoteColors={NoteColors} ID={ID} role={Role} />
              </motion.div>
            </>
          )}

          <ConnectionStatus
            color={isConnected ? "green" : "red"}
            noteColor={NoteColors}
            onClick={saveBlocks}
            isSaving={isSaving}
          />

          {showMaximize && toggleMaximize && (
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
          )}

          {showDelete && (
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <AdaptiveButton
                onClick={handleDelete}
                noteColor={NoteColors}
                variant="destructive"
                aria-label="Delete note"
                className="h-7 w-7"
              >
                <Trash className="w-3.5 h-3.5" />
              </AdaptiveButton>
            </motion.div>
          )}

          {showCloseButton && (
            <button
              ref={closeButtonRef}
              onClick={handleClose}
              className={clsx(
                "flex-shrink-0 p-1.5 rounded-lg transition-all duration-300",
                "hover:scale-110 active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                `${isDarkBackground ? "text-white/80 hover:bg-white/10" : "text-black/80 hover:bg-black/10"}`
              )}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  boxShadow: `0 0 20px 5px ${primaryColor}55`,
                  duration: 0.3,
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  boxShadow: `0 0 0 0 ${primaryColor}`,
                  duration: 0.3,
                });
              }}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
