import { X, GripVertical, Maximize2, Minimize2, Forward } from "lucide-react";
import {
  deleteStickyNote,
  NotesState,
  updateNotePosition,
  updateNoteSize,
  bringNoteForward,
} from "../app/lib/features/notesSlice";
import { useAppDispatch } from "../app/lib/hooks";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import { useRef, useState, useEffect, memo } from "react";
import gsap from "gsap";
import { clsx } from "clsx";
import Editor from "./Editor";
import { colorMap } from "@/app/types/types";
import CreationTime from "./CreationTime";

const StickyNotes = memo(
  ({ ID, color, x, y, width, height, zIndex, CreatedAt }: NotesState) => {
    const dispatch = useAppDispatch();
    const editor = useCreateBlockNote();
    const noteRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [position, setPosition] = useState({ x, y });
    const [size, setSize] = useState({ width, height });
    const [isMaximized, setIsMaximized] = useState(false);
    const [isArchiving] = useState(false);
    const [originalPosition, setOriginalPosition] = useState({ x, y });
    const [originalSize, setOriginalSize] = useState({ width, height });
    const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });
    const resizeStart = useRef({ x: 0, y: 0, startWidth: 0, startHeight: 0 });

    useEffect(() => {
      setPosition({ x, y });
      setSize({ width, height });
    }, [x, y, width, height, zIndex, ID]);

    useEffect(() => {
      if (noteRef.current) {
        gsap.fromTo(
          noteRef.current,
          {
            y: -100,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }
        );
      }
    }, [ID]);

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
        (e.target as HTMLElement).closest(".bn-editor") ||
        isMaximized
      ) {
        return;
      }
      setIsDragging(true);
      handleBringForward(e);
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

          if (noteRef.current) {
            gsap.set(noteRef.current, { left: newX, top: newY });
          }
        }
        if (isResizing) {
          const deltaX = e.clientX - resizeStart.current.x;
          const deltaY = e.clientY - resizeStart.current.y;
          const newWidth = Math.max(
            250,
            resizeStart.current.startWidth + deltaX
          );
          const newHeight = Math.max(
            280,
            resizeStart.current.startHeight + deltaY
          );
          setSize({ width: newWidth, height: newHeight });

          if (noteRef.current) {
            gsap.set(noteRef.current, { width: newWidth, height: newHeight });
          }
        }
      };

      const handleMouseUp = () => {
        if (isDragging) {
          setIsDragging(false);
          dispatch(updateNotePosition({ ID, x: position.x, y: position.y }));
        }
        if (isResizing) {
          setIsResizing(false);
          dispatch(
            updateNoteSize({ ID, width: size.width, height: size.height })
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
    }, [isDragging, isResizing, position, size, ID, dispatch]);

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

    const toggleMaximize = (e: React.MouseEvent) => {
      if (!isMaximized) {
        setOriginalPosition({ x: position.x, y: position.y });
        setOriginalSize({ width: size.width, height: size.height });

        const windowWidth =
          typeof window !== "undefined" ? window.innerWidth : 1200;
        const windowHeight =
          typeof window !== "undefined" ? window.innerHeight : 800;

        const maxWidth = 1152;
        const maxHeight = windowHeight * 0.9;

        const centerX = windowWidth / 2 - maxWidth / 2;
        const centerY = windowHeight / 2 - maxHeight / 2;

        if (noteRef.current) {
          gsap.set(noteRef.current, { position: "fixed", zIndex: 9999 });

          gsap.to(noteRef.current, {
            left: centerX,
            top: centerY,
            width: maxWidth,
            height: maxHeight,
            duration: 0.5,
            ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            onComplete: () => {
              setSize({ width: maxWidth, height: maxHeight });
              setIsMaximized(true);
            },
          });
        }
      } else {
        if (noteRef.current) {
          gsap.set(noteRef.current, {
            transform: "none",
            left: "50%",
            top: "50%",
            marginLeft: -size.width / 2,
            marginTop: -size.height / 2,
          });

          gsap.to(noteRef.current, {
            width: originalSize.width,
            height: originalSize.height,
            marginLeft: -originalSize.width / 2,
            marginTop: -originalSize.height / 2,
            duration: 0.35,
            ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            onComplete: () => {
              setPosition(originalPosition);
              setSize(originalSize);
              setIsMaximized(false);

              gsap.set(noteRef.current, {
                position: "absolute",
                left: "auto",
                top: "auto",
                marginLeft: 0,
                marginTop: 0,
                zIndex: "auto",
                clearProps: "left,top,zIndex",
              });
            },
          });
        }
      }
      handleBringForward(e);
    };

    const handleBringForward = (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(bringNoteForward({ ID }));

      if (noteRef.current) {
        gsap.to(noteRef.current, {
          scale: isMaximized ? 1.65 : 1.05,
          duration: 0.2,
          ease: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          onComplete: () => {
            gsap.to(noteRef.current, {
              scale: isMaximized ? 1.5 : 1,
              duration: 0.2,
              ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            });
          },
        });
      }
    };

    return (
      <div
        ref={noteRef}
        className={clsx(
          "rounded-lg flex flex-col overflow-hidden group transition-all duration-300",
          {
            "fixed z-[9999]": isMaximized,
            absolute: !isMaximized,
            "shadow-[0_25px_50px_rgba(0,0,0,0.25),0_10px_20px_rgba(0,0,0,0.15)]":
              isMaximized,
            "shadow-[0_10px_30px_rgba(0,0,0,0.15),0_3px_8px_rgba(0,0,0,0.1)] hover:shadow-xl":
              !isMaximized,
            "cursor-grabbing": isDragging,
            "cursor-default": !isDragging,
            "pointer-events-none": isArchiving,
            "pointer-events-auto": !isArchiving,
          }
        )}
        style={{
          backgroundColor: colorMap[color as keyof typeof colorMap],
          left: isMaximized ? "50%" : `${position.x}px`,
          top: isMaximized ? "50%" : `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          zIndex: isMaximized ? 9999 : zIndex,
          transform: isMaximized ? "translate(-50%, -50%)" : undefined,
        }}
        title="Drag to move, resize from bottom-right corner, use forward button to bring to front"
      >
        <div
          className="flex justify-between items-center px-4 py-2 flex-shrink-0 bg-gradient-to-b from-black/5 to-transparent"
          onMouseDown={handleMouseDown}
        >
          <div
            className={`flex items-center gap-2 ${
              isMaximized ? "cursor-default" : "cursor-move"
            } text-muted hover:text-muted-foreground transition`}
          >
            <GripVertical className="w-4 h-4" />
            {CreatedAt && <CreationTime CreatedAt={CreatedAt} />}
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
            <button
              onClick={handleBringForward}
              className="text-background hover:text-foreground hover:bg-muted/20 rounded-full p-1.5 transition-all duration-200"
              aria-label="Bring note forward"
            >
              <Forward className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                dispatch(deleteStickyNote(ID));
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
          className="absolute bottom-0 right-0 w-full h-4 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-transparent from-50% to-black/20 to-50%"
          onMouseDown={handleResizeMouseDown}
        />
      </div>
    );
  }
);

StickyNotes.displayName = "StickyNotes";

export default StickyNotes;
