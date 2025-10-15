"use client";

import { StickyNote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useRef, useState } from "react";
import { addNote } from "../app/lib/features/notesSlice";
import { useAppDispatch } from "../app/lib/hooks";
import UserProfile from "./UserProfile";

interface ColorCircleProps {
  onClick: () => void;
  color: keyof typeof colorMap;
}

const colorMap = {
  yellow: "#facc15",
  green: "#4ade80",
  orange: "#fb923c",
  purple: "#a855f7",
  blue: "#3b82f6",
} as const;

const ColorCircle = ({ onClick, color }: ColorCircleProps) => {
  const circleRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (circleRef.current) {
      gsap.to(circleRef.current, {
        scale: 1.4,
        boxShadow: `0 0 20px ${colorMap[color]}`,
        duration: 0.3,
        ease: "elastic.out(1, 0.5)",
      });
    }
  };

  const handleMouseLeave = () => {
    if (circleRef.current) {
      gsap.to(circleRef.current, {
        scale: 1,
        boxShadow: "0 0 0px rgba(0,0,0,0)",
        duration: 0.3,
        ease: "elastic.out(1, 0.5)",
      });
    }
  };

  const handleClick = () => {
    if (circleRef.current) {
      gsap.to(circleRef.current, {
        scale: 0.8,
        duration: 0.1,
        onComplete: () => {
          gsap.to(circleRef.current, {
            scale: 1,
            duration: 0.2,
            ease: "elastic.out(1, 0.5)",
          });
        },
      });
      onClick();
    }
  };

  return (
    <div
      ref={circleRef}
      role="button"
      className="w-6 h-6 rounded-full cursor-pointer"
      style={{ backgroundColor: colorMap[color] }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    />
  );
};

const NotesSidebar = () => {
  const dispatch = useAppDispatch();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const plusButtonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddNote = (color: keyof typeof colorMap) => {
    console.log("handleAddNote called with color:", color);
    const newNote = {
      id: Date.now(),
      color,
      x: Math.random() * (window.innerWidth - 400) + 150,
      y: Math.random() * (window.innerHeight - 400) + 100,
      width: 360,
      height: 420,
      zIndex: Date.now(),
    };
    console.log("Dispatching new note:", newNote);
    dispatch(addNote(newNote));
  };

  return (
    <motion.aside
      ref={sidebarRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group/sidebar h-full bg-sidebar text-sidebar-foreground relative flex w-32 flex-col z-[9999] items-center transition-all border-r border-border"
      initial={{ x: 0 }}
      animate={{ x: 0 }}
    >
      <div className="flex flex-col items-center flex-1">
        <motion.div
          className="mt-4 relative z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-primary font-semibold">OzasPen</p>
        </motion.div>

        <motion.div
          className="mt-10 relative z-10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            type: "spring",
            stiffness: 100,
          }}
        >
          <button
            ref={plusButtonRef}
            className="bg-muted p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition"
          >
            <StickyNote className="w-6 h-6" />
          </button>
        </motion.div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="p-4 mt-6 w-full flex items-center relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="flex flex-col items-center w-full gap-6">
                {["yellow", "green", "purple", "blue", "orange"].map(
                  (col, idx) => (
                    <motion.li
                      key={col}
                      initial={{ opacity: 0, scale: 0, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0, x: -20 }}
                      transition={{
                        duration: 0.3,
                        delay: idx * 0.05,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      <ColorCircle
                        onClick={() =>
                          handleAddNote(col as keyof typeof colorMap)
                        }
                        color={col as keyof typeof colorMap}
                      />
                    </motion.li>
                  )
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto w-full relative z-20 mb-2 flex justify-center">
        <UserProfile />
      </div>
    </motion.aside>
  );
};

export default NotesSidebar;
