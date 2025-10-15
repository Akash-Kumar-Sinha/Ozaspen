import { X, GripVertical, Maximize2, Minimize2, Forward } from "lucide-react";
import {
  NotesState,
  removeNote,
  updateNotePosition,
  updateNoteSize,
} from "../app/lib/features/notesSlice";
import { colorMap } from "./types";
import { useAppDispatch } from "../app/lib/hooks";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import { useRef, useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import Editor from "./Editor";

const StickyNotes = ({
  id,
  color,
  x,
  y,
  width,
  height,
  zIndex,
}: NotesState) => {
  const dispatch = useAppDispatch();
  const editor = useCreateBlockNote();
  const noteRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x, y });
  const [size, setSize] = useState({ width, height });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isArchiving] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, startWidth: 0, startHeight: 0 });

  useEffect(() => {
    setPosition({ x, y });
    setSize({ width, height });
  }, [x, y, width, height, zIndex]);

  const customTheme = {
    colors: {
      editor: {
        text: "#18181b",
        background: colorMap[color as keyof typeof colorMap],
      },
      menu: {
        text: "#ffffff",
        background: "#000000",
      },
      tooltip: {
        text: "#ffffff",
        background: "#000000",
      },
      hovered: {
        text: "#ffffff",
        background: "#9333ea",
      },
      selected: {
        text: "#ffffff",
        background: "rgba(255, 255, 255, 0.1)",
      },
      disabled: {
        text: "#71717a",
        background: "rgba(255, 255, 255, 0.05)",
      },
      shadow: "rgba(255, 255, 255, 0.1)",
      border: "rgba(255, 255, 255, 0.1)",
      sideMenu: "#18181b",
      highlightColors: {
        gray: { text: "#18181b", background: "#e4e4e7" },
        brown: { text: "#18181b", background: "#d4a574" },
        red: { text: "#18181b", background: "#fca5a5" },
        orange: { text: "#18181b", background: "#fdba74" },
        yellow: { text: "#18181b", background: "#fde047" },
        green: { text: "#18181b", background: "#86efac" },
        blue: { text: "#18181b", background: "#93c5fd" },
        purple: { text: "#18181b", background: "#c4b5fd" },
        pink: { text: "#18181b", background: "#f9a8d4" },
      },
    },
    borderRadius: 4,
    fontFamily: "Inter, sans-serif",
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest(".bn-editor")
    ) {
      return;
    }
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        const newX = Math.max(0, dragStart.current.startX + deltaX);
        const newY = Math.max(0, dragStart.current.startY + deltaY);
        setPosition({ x: newX, y: newY });
      }
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.current.x;
        const deltaY = e.clientY - resizeStart.current.y;
        const newWidth = Math.max(250, resizeStart.current.startWidth + deltaX);
        const newHeight = Math.max(
          280,
          resizeStart.current.startHeight + deltaY
        );
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        dispatch(updateNotePosition({ id, x: position.x, y: position.y }));
      }
      if (isResizing) {
        setIsResizing(false);
        dispatch(
          updateNoteSize({ id, width: size.width, height: size.height })
        );
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, position, size, id, dispatch]);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <motion.div
      ref={noteRef}
      animate={controls}
      initial={{
        scale: 0,
        opacity: 0,
        rotate: -15,
        x: 0,
        y: 0,
      }}
      exit={{
        scale: 0,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
      whileInView={{
        scale: isMaximized ? 1.5 : 1,
        opacity: 1,
        rotate: 0,
        x: 0,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 18,
          mass: 0.8,
        },
      }}
      className="absolute rounded-lg shadow-2xl flex flex-col overflow-hidden group hover:shadow-xl transition-shadow duration-200"
      style={{
        backgroundColor: colorMap[color as keyof typeof colorMap],
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMaximized ? `${size.width * 1.3}px` : `${size.width}px`,
        height: isMaximized ? `${size.height * 1.3}px` : `${size.height}px`,
        cursor: isDragging ? "grabbing" : "default",
        boxShadow:
          "0 10px 30px rgba(0, 0, 0, 0.15), 0 3px 8px rgba(0, 0, 0, 0.1)",
        pointerEvents: isArchiving ? "none" : "auto",
      }}
    >
      <div
        className="flex justify-between items-center px-4 py-2 flex-shrink-0 bg-gradient-to-b from-black/5 to-transparent"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 cursor-move text-muted-foreground/50 hover:text-muted-foreground transition">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMaximize}
            className="text-background hover:text-foreground hover:bg-muted/20 rounded-full p-1.5 transition-all duration-200"
            aria-label={isMaximized ? "Minimize note" : "Maximize note"}
          >
            {isMaximized ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          <button className="text-background hover:text-foreground hover:bg-muted/20 rounded-full p-1.5 transition-all duration-200">
            <Forward className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              dispatch(removeNote(id));
            }}
            className="text-background hover:text-destructive hover:bg-muted/20 rounded-full p-1.5 transition-all duration-200"
            aria-label="Delete note"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Editor editor={editor} customTheme={customTheme} />
      </div>

      <div
        className="absolute bottom-0 right-0 w-full h-4 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeMouseDown}
        style={{
          background:
            "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.2) 50%)",
        }}
      />
    </motion.div>
  );
};

export default StickyNotes;
