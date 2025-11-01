import React, { useState, useEffect, useRef } from "react";
import { Pencil, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Role } from "@/app/types/StickyNotesTypes";
import axios from "axios";
import { BACKEND_STICKYNOTES_DOMAIN } from "@/app/lib/constant";

interface TitleProps {
  stickyNoteId: string;
  title: string;
  isDarkBackground: boolean;
  role?: Role;
}

const StickyNoteTitle = ({
  title,
  isDarkBackground,
  stickyNoteId,
  role,
}: TitleProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [editedTitle, setEditedTitle] = useState(title);
  const pencilRef = useRef<HTMLButtonElement>(null);
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (role === "viewer") return;
    if (role === "editor") return;
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

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

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

  const handleSaveTitle = async () => {
    if (editedTitle.trim() && editedTitle !== title) {
      const { data } = await axios.put(
        `${BACKEND_STICKYNOTES_DOMAIN}/change_title`,
        {
          sticky_note_id: stickyNoteId,
          sticky_note_title: editedTitle,
        },
        {
          withCredentials: true,
        }
      );
      setEditedTitle(data.Title);
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
      setEditedTitle(title);
      setIsEditingTitle(false);
    }
  };
  return (
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
            title={editedTitle}
          >
            {editedTitle}
          </span>
          {role?.toLowerCase() === "owner" && (
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
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyNoteTitle;
