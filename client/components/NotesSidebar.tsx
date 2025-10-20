"use client";

import { Palette, Wand2, Circle } from "lucide-react";
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
      initial={{ scale: 0, opacity: 0, x: -20 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: 0,
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
        x: -20,
        transition: {
          duration: 0.2,
          delay: (7 - index) * 0.03,
        },
      }}
      whileHover={{
        scale: 1.15,
        rotate: [0, -8, 8, 0],
        transition: { duration: 0.4 },
      }}
      whileTap={{
        scale: 0.9,
        rotate: 180,
        transition: { duration: 0.3 },
      }}
      className="relative group w-8 h-8 rounded-2xl shadow-lg border-2 border-white/20 backdrop-blur-sm overflow-hidden"
      style={{ backgroundColor: colorMap[color] }}
      onClick={handleClick}
      title={`Create ${color} sticky note`}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="absolute top-0 right-0 w-2 h-2 bg-white/30 rounded-bl-full opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};

const NotesSidebar = () => {
  const dispatch = useAppDispatch();
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddNote = (color: keyof typeof colorMap) => {
    setIsCreating(true);
    dispatch(createStickyNote({ color }));
    setTimeout(() => setIsCreating(false), 800);
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
      initial={{ width: "4rem", x: -64 }}
      animate={{
        width: "4rem",
        x: 0,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 30,
        },
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-12 h-12 bg-primary/5 rounded-full blur-xl"
            style={{
              left: `${20 + (i % 2) * 60}%`,
              top: `${20 + i * 15}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col relative z-10">
        <div className="p-3">
          <motion.div
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 flex items-center justify-center gap-3 transition-all group relative overflow-hidden cursor-pointer"
            whileHover={{
              scale: 1.05,
              borderColor: "rgba(147, 51, 234, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />

            <AnimatePresence>
              {showColorPalette && (
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="absolute left-2"
                >
                  <Wand2 className="w-4 h-4 text-purple-400" />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              <motion.div
                initial={{ scale: 0, x: 10 }}
                animate={{ scale: 1, x: 0 }}
                exit={{ scale: 0, x: -10 }}
                transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                className="absolute right-2"
              >
                <Palette className="w-4 h-4 text-blue-400" />
              </motion.div>
            </AnimatePresence>

            {isCreating && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                    }}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos((i * 45 * Math.PI) / 180) * 30,
                      y: Math.sin((i * 45 * Math.PI) / 180) * 30,
                    }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  >
                    <Circle
                      className="w-1 h-1 text-yellow-400"
                      fill="currentColor"
                    />
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {showColorPalette && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                height: "auto",
                scale: 1,
                transition: {
                  height: { type: "spring", stiffness: 400, damping: 30 },
                  opacity: { delay: 0.1 },
                  scale: { type: "spring", stiffness: 400, delay: 0.2 },
                },
              }}
              exit={{
                opacity: 0,
                height: 0,
                scale: 0.8,
                transition: {
                  height: { type: "spring", stiffness: 400, damping: 30 },
                  opacity: { duration: 0.1 },
                  scale: { duration: 0.2 },
                },
              }}
              className="px-3 pb-3 overflow-hidden"
            >
              <motion.div
                className="bg-muted/20 rounded-2xl p-4 border border-border/30 backdrop-blur-sm"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 400, delay: 0.3 }}
              >
                <div className="grid gap-3 grid-cols-1 justify-items-center">
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="p-3 border-t border-border/30 relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <UserProfile />
      </motion.div>
    </motion.aside>
  );
};

export default NotesSidebar;
