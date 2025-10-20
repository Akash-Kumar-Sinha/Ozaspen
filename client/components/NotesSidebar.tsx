"use client";

import { StickyNote, Plus, Palette, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { createStickyNote } from "../app/lib/features/notesSlice";
import { useAppDispatch } from "../app/lib/hooks";
import UserProfile from "./UserProfile";
import { colorMap } from "@/app/types/types";

interface ColorSwatchProps {
  onClick: () => void;
  color: keyof typeof colorMap;
  index: number;
}

const ColorSwatch = ({ onClick, color, index }: ColorSwatchProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 17,
          delay: index * 0.05,
        },
      }}
      exit={{
        scale: 0,
        opacity: 0,
        y: 20,
        transition: {
          duration: 0.2,
          delay: (7 - index) * 0.03,
        },
      }}
      whileHover={{
        scale: 1.15,
        rotate: [0, -10, 10, 0],
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.95 }}
      className="relative group w-8 h-8 rounded-xl shadow-lg border-2 border-white/20 backdrop-blur-sm"
      style={{ backgroundColor: colorMap[color] }}
      onClick={handleClick}
      title={`Create ${color} sticky note`}
    >
      <motion.div
        className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.2 }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Plus className="w-3 h-3 text-black/60 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.button>
  );
};

const NotesSidebar = () => {
  const dispatch = useAppDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);

  const handleAddNote = (color: keyof typeof colorMap) => {
    dispatch(createStickyNote({ color }));
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMouseEnter = () => {
    setShowColorPalette(true);
  };

  const handleMouseLeave = () => {
    setShowColorPalette(false);
  };

  return (
    <motion.aside
      className="h-full bg-gradient-to-b from-sidebar to-sidebar/90 text-sidebar-foreground relative flex flex-col z-[9999] border-r border-border/50 flex-shrink-0 overflow-hidden backdrop-blur-xl"
      initial={{ width: "4rem" }}
      animate={{
        width: isExpanded ? "16rem" : "4rem",
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 30,
        },
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between p-3 border-b border-border/30">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                OzasPen
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={toggleExpanded}
          className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-3">
          <motion.div
            className={`w-full h-12 rounded-xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 flex items-center justify-center gap-3 transition-all group relative overflow-hidden ${
              !isExpanded ? "px-0" : "px-4"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <motion.div
              animate={{ rotate: showColorPalette ? 45 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Plus className="w-5 h-5 text-primary" />
            </motion.div>

            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-medium text-foreground"
                >
                  Hover to Create
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <AnimatePresence>
          {showColorPalette && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: "auto",
                transition: {
                  height: { type: "spring", stiffness: 400, damping: 30 },
                  opacity: { delay: 0.1 },
                },
              }}
              exit={{
                opacity: 0,
                height: 0,
                transition: {
                  height: { type: "spring", stiffness: 400, damping: 30 },
                  opacity: { duration: 0.1 },
                },
              }}
              className="px-3 pb-3 overflow-hidden"
            >
              <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
                <AnimatePresence>
                  {isExpanded && (
                    <motion.h3
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2"
                    >
                      <Palette className="w-3 h-3" />
                      Choose Color
                    </motion.h3>
                  )}
                </AnimatePresence>

                <div
                  className={`grid gap-2 ${
                    isExpanded
                      ? "grid-cols-4"
                      : "grid-cols-1 justify-items-center"
                  }`}
                >
                  {Object.keys(colorMap).map((color, index) => (
                    <ColorSwatch
                      key={color}
                      color={color as keyof typeof colorMap}
                      onClick={() =>
                        handleAddNote(color as keyof typeof colorMap)
                      }
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
              className="px-3 mt-auto mb-4"
            >
              <div className="bg-muted/10 rounded-lg p-3 border border-border/20">
                <div className="flex items-center gap-2 mb-2">
                  <StickyNote className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Quick Stats
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ready to create amazing notes ✨
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-3 border-t border-border/30">
        <UserProfile />
      </div>
    </motion.aside>
  );
};

export default NotesSidebar;
