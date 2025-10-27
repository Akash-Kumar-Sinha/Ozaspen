"use client";

import { Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createStickyNote } from "../../app/lib/features/notesSlice";
import { useAppDispatch } from "../../app/lib/hooks";
import UserProfile from "../Profiles/UserProfile";
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
      initial={{ scale: 0, opacity: 0, rotate: -180 }}
      animate={{
        scale: 1,
        opacity: 1,
        rotate: 0,
        transition: {
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: index * 0.04,
        },
      }}
      exit={{
        scale: 0,
        opacity: 0,
        rotate: 180,
        transition: {
          duration: 0.2,
          delay: (7 - index) * 0.02,
        },
      }}
      whileHover={{
        scale: 1.1,
        rotate: [0, -2, 2, 0],
        transition: { duration: 0.3 },
      }}
      whileTap={{
        scale: 0.9,
        rotate: 180,
        transition: { duration: 0.3 },
      }}
      className="relative w-8 h-8 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border/30 flex-shrink-0 touch-manipulation"
      style={{
        backgroundColor: colorMap[color],
        borderColor:
          color === "white" ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)",
      }}
      onClick={handleClick}
      title={`Create ${color} note`}
    >
      <motion.div
        className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
};

const NotesSidebar = () => {
  const dispatch = useAppDispatch();
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedColor, setSelectedColor] = useState<
    keyof typeof colorMap | null
  >(null);
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleAddNote = (color: keyof typeof colorMap) => {
    setIsCreating(true);
    setSelectedColor(color);
    dispatch(createStickyNote({ color }));
    setTimeout(() => {
      setIsCreating(false);
      setSelectedColor(null);
    }, 600);
  };

  const getRandomColor = () => {
    const colors = Object.values(colorMap);
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const createRandomNote = () => {
    const colors = Object.keys(colorMap) as (keyof typeof colorMap)[];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    handleAddNote(randomColor);
  };

  const isDesktop = width >= 1024;

  return (
    <>
      {isDesktop ? (
        <motion.aside
          className="h-full bg-gradient-to-b from-sidebar to-sidebar/90 text-sidebar-foreground relative flex flex-col z-[9999] border-r border-border/50 flex-shrink-0 overflow-hidden backdrop-blur-xl"
          initial={{ width: "5rem", opacity: 0 }}
          animate={{
            width: showColorPalette ? "7rem" : "5rem",
            opacity: 1,
            transition: {
              width: {
                type: "spring",
                stiffness: 300,
                damping: 30,
              },
              opacity: { duration: 0.3 },
            },
          }}
          onMouseEnter={() => setShowColorPalette(true)}
          onMouseLeave={() => setShowColorPalette(false)}
        >
          {/* Floating orbs background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full blur-2xl"
                style={{
                  width: `${60 + i * 20}px`,
                  height: `${60 + i * 20}px`,
                  background: `radial-gradient(circle, ${getRandomColor()} 0%, transparent 70%)`,
                  left: `${10 + (i % 2) * 60}%`,
                  top: `${15 + i * 18}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  x: [0, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>

          <div className="flex-1 flex flex-col relative z-10 py-6 overflow-y-auto">
            {/* Main trigger button */}
            <div className="px-4 mb-6 flex-shrink-0">
              <motion.div
                className="relative w-full aspect-square rounded-3xl bg-gradient-to-br from-primary/80 via-purple-500/80 to-pink-500/80 flex items-center justify-center cursor-pointer overflow-hidden group shadow-lg"
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={createRandomNote}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />

                <AnimatePresence mode="wait">
                  <span>
                    {!showColorPalette ? (
                      <motion.div
                        key="plus"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Palette
                          className="w-8 h-8 text-white"
                          strokeWidth={2.5}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="palette"
                        initial={{ scale: 0, rotate: 90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: -90 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Palette
                          className="w-7 h-7 text-white"
                          strokeWidth={2}
                        />
                      </motion.div>
                    )}
                  </span>
                </AnimatePresence>

                {/* Ripple effect on create */}
                {isCreating && (
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      backgroundColor: selectedColor
                        ? colorMap[selectedColor]
                        : "transparent",
                    }}
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{
                      scale: 2.5,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </motion.div>
            </div>

            {/* Color palette */}
            <AnimatePresence>
              {showColorPalette && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: {
                      duration: 0.3,
                      staggerChildren: 0.05,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                    transition: { duration: 0.2 },
                  }}
                  className="px-4 flex-1 overflow-y-auto"
                >
                  <div className="space-y-3 pb-4">
                    {Object.keys(colorMap).map((color, index) => (
                      <motion.div
                        key={color}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex justify-center"
                      >
                        <ColorSwatch
                          color={color as keyof typeof colorMap}
                          onClick={() =>
                            handleAddNote(color as keyof typeof colorMap)
                          }
                          index={index}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User section */}
          <motion.div
            className="p-4 border-t border-border/30 relative z-10 flex-shrink-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <UserProfile />
          </motion.div>
        </motion.aside>
      ) : (
        <>
          {/* Mobile & Tablet floating button */}
          <motion.div
            className="fixed bottom-6 right-6 z-[9999] sm:bottom-8 sm:right-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <motion.button
              onClick={() => setShowColorPalette((s) => !s)}
              className="p-4 sm:p-5 bg-gradient-to-br from-primary/90 via-purple-500/90 to-pink-500/90 rounded-full shadow-2xl backdrop-blur-lg border border-border/20 touch-manipulation"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              style={{
                background: showColorPalette
                  ? "linear-gradient(135deg, rgba(147, 51, 234, 0.95), rgba(168, 85, 247, 0.95), rgba(236, 72, 153, 0.95))"
                  : "linear-gradient(135deg, rgba(147, 51, 234, 0.9), rgba(168, 85, 247, 0.9), rgba(236, 72, 153, 0.9))",
              }}
            >
              <motion.div
                animate={{ rotate: showColorPalette ? 45 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Palette
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                  strokeWidth={2}
                />
              </motion.div>
            </motion.button>
          </motion.div>

          {/* Mobile & Tablet color palette overlay */}
          <AnimatePresence>
            {showColorPalette && (
              <motion.div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] flex items-end justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowColorPalette(false)}
              >
                <motion.div
                  className="bg-sidebar/95 backdrop-blur-lg border border-border/30 rounded-3xl shadow-2xl p-4 sm:p-6 w-full max-w-sm mx-4"
                  initial={{ y: 100, scale: 0.9 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: 100, scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-sm sm:text-base font-semibold text-sidebar-foreground/80 mb-4 text-center">
                    Choose Color
                  </h3>
                  <div className="grid grid-cols-4 gap-3 sm:gap-4">
                    {Object.keys(colorMap).map((color, index) => (
                      <motion.div
                        key={color}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex justify-center"
                      >
                        <ColorSwatch
                          color={color as keyof typeof colorMap}
                          onClick={() => {
                            handleAddNote(color as keyof typeof colorMap);
                            setShowColorPalette(false);
                          }}
                          index={index}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
};

export default NotesSidebar;
