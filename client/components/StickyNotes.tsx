import { X, GripVertical, Maximize2, Minimize2 } from "lucide-react";
import {
  deleteStickyNote,
  NotesState,
  updateNotePosition,
  updateNoteSize,
  bringNoteForward,
} from "../app/lib/features/notesSlice";
import { useAppDispatch, useAppSelector } from "../app/lib/hooks";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import { useRef, useState, useEffect, memo, useCallback } from "react";
import gsap from "gsap";
import { clsx } from "clsx";
import Editor from "./Editor";
import { colorMap } from "@/app/types/types";
import CreationTime from "./CreationTime";
import { Block } from "@blocknote/core";
import { BACKEND_STICKYNOTES_DOMAIN } from "@/app/lib/constant";
import axios from "axios";
import Saving from "./ui/Saving";
import { RootState } from "@/app/lib/store";
import { connect } from "@/app/lib/features/socketSlice";
import { ConnectionStatus } from "./ui/ConnectionStatus";
import { AdaptiveButton } from "./ui/AdaptiveButton";
import GenerateLink from "./GenerateLink";

const StickyNotes = memo(
  ({
    ID,
    NoteColors,
    x,
    y,
    width,
    height,
    zIndex,
    CreatedAt,
    Content,
  }: NotesState) => {
    const dispatch = useAppDispatch();
    const socket = useAppSelector((state: RootState) => state.socket.socket);
    const isConnected = useAppSelector(
      (state: RootState) => state.socket.isConnected
    );

    const editor = useCreateBlockNote({
      initialContent:
        Content?.Blocks && Content.Blocks.length > 0
          ? Content.Blocks
          : undefined,
    });
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
    const sizeRef = useRef({ width: size.width, height: size.height });
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedBlocks = useRef<string>("");

    useEffect(() => {
      setPosition({ x, y });
      setSize({ width, height });
    }, [x, y, width, height, zIndex, ID]);

    useEffect(() => {
      sizeRef.current = { width: size.width, height: size.height };
    }, [size.width, size.height]);

    useEffect(() => {
      console.log(`StickyNote ${ID}: isAutoSaving changed to:`, isAutoSaving);
    }, [isAutoSaving, ID]);

    const autoSaveBlocks = useCallback(async () => {
      if (blocks.length === 0) return;
      if (!isConnected || !socket) return;
      const currentBlocksString = JSON.stringify(blocks);
      if (currentBlocksString === lastSavedBlocks.current) return;

      try {
        setIsAutoSaving(true);
        socket.send(
          JSON.stringify({
            type: "save_sticky_note",
            data: {
              sticky_note_id: ID,
              blocks: blocks,
            },
          })
        );

        lastSavedBlocks.current = currentBlocksString;
        setTimeout(() => {
          setIsAutoSaving(false);
        }, 800);
      } catch (error) {
        console.error("WebSocket auto-save failed:", error);
        setIsAutoSaving(false);
      }
    }, [blocks, ID, isConnected, socket]);

    useEffect(() => {
      if (blocks.length === 0) return;
      if (!isConnected || !socket) return;

      const currentBlocksString = JSON.stringify(blocks);

      if (currentBlocksString === lastSavedBlocks.current) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        autoSaveBlocks();
      }, 2000);

      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }, [blocks, ID, isConnected, socket, autoSaveBlocks]);

    useEffect(() => {
      const clampToViewport = () => {
        const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
        const padding = 12;
        const maxAllowedWidth = Math.max(160, vw - padding * 2);

        setSize((s) => {
          const newW = Math.min(s.width, maxAllowedWidth);
          if (noteRef.current) {
            gsap.set(noteRef.current, { width: `${newW}px`, ease: "none" });
          }
          sizeRef.current.width = newW;
          return { ...s, width: newW };
        });

        setPosition((p) => {
          const currentW = noteRef.current
            ? noteRef.current.offsetWidth
            : sizeRef.current.width;
          const maxX = Math.max(0, vw - currentW - padding);
          const newX = Math.min(p.x, maxX);
          if (noteRef.current) {
            gsap.set(noteRef.current, { left: `${newX}px`, ease: "none" });
          }
          return { ...p, x: newX };
        });
      };

      clampToViewport();
      window.addEventListener("resize", clampToViewport);
      return () => window.removeEventListener("resize", clampToViewport);
    }, [ID]);

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

    const backgroundColor = colorMap[NoteColors as keyof typeof colorMap];
    const isDarkBackground = NoteColors === "black";
    const isLightBackground = NoteColors === "white";

    const getCSSVariable = (variableName: string) => {
      if (typeof window !== "undefined") {
        return getComputedStyle(document.documentElement)
          .getPropertyValue(variableName)
          .trim();
      }
      return "";
    };

    const foregroundColor = getCSSVariable("--foreground") || "#ffffff";
    const backgroundColorVar = getCSSVariable("--background") || "#000000";
    const mutedForegroundColor =
      getCSSVariable("--muted-foreground") || "#a1a1aa";
    const primaryColor = getCSSVariable("--primary") || "#9333ea";

    const customTheme = {
      colors: {
        editor: {
          text: isDarkBackground
            ? foregroundColor
            : isLightBackground
            ? backgroundColorVar
            : "#000000",
          background: backgroundColor,
        },
        menu: {
          text: isDarkBackground ? backgroundColorVar : foregroundColor,
          background: isDarkBackground ? foregroundColor : backgroundColorVar,
        },
        tooltip: {
          text: isDarkBackground ? backgroundColorVar : foregroundColor,
          background: isDarkBackground ? foregroundColor : backgroundColorVar,
        },
        hovered: {
          text: foregroundColor,
          background: primaryColor,
        },
        selected: {
          text: isDarkBackground ? backgroundColorVar : "#000000",
          background: isDarkBackground
            ? "rgba(0, 0, 0, 0.1)"
            : "rgba(255, 255, 255, 0.1)",
        },
        disabled: {
          text: mutedForegroundColor,
          background: isDarkBackground
            ? "rgba(0, 0, 0, 0.05)"
            : "rgba(255, 255, 255, 0.05)",
        },
        shadow: isDarkBackground
          ? "rgba(0, 0, 0, 0.1)"
          : "rgba(255, 255, 255, 0.1)",
        border: isDarkBackground
          ? "rgba(0, 0, 0, 0.1)"
          : "rgba(255, 255, 255, 0.1)",
        sideMenu: isDarkBackground ? foregroundColor : backgroundColorVar,
        highlightColors: {
          gray: { text: "#000000", background: "#e4e4e7" },
          brown: { text: "#000000", background: "#d4a574" },
          red: { text: "#000000", background: "#fca5a5" },
          orange: { text: "#000000", background: "#fdba74" },
          yellow: { text: "#000000", background: "#fde047" },
          green: { text: "#000000", background: "#86efac" },
          blue: { text: "#000000", background: "#93c5fd" },
          purple: { text: "#000000", background: "#c4b5fd" },
          pink: { text: "#000000", background: "#f9a8d4" },
          black: { text: foregroundColor, background: backgroundColorVar },
          white: { text: "#000000", background: "#f8f8f8" },
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
        if (isDragging && !isMaximized) {
          const deltaX = e.clientX - dragStart.current.x;
          const deltaY = e.clientY - dragStart.current.y;
          const newX = Math.max(
            0,
            Math.min(
              window.innerWidth - size.width,
              dragStart.current.startX + deltaX
            )
          );
          const newY = Math.max(
            0,
            Math.min(
              window.innerHeight - size.height,
              dragStart.current.startY + deltaY
            )
          );

          setPosition({ x: newX, y: newY });

          if (noteRef.current) {
            gsap.set(noteRef.current, {
              left: `${newX}px`,
              top: `${newY}px`,
              ease: "none",
            });
          }
        }
        if (isResizing && !isMaximized) {
          const deltaX = e.clientX - resizeStart.current.x;
          const deltaY = e.clientY - resizeStart.current.y;
          const newWidth = Math.max(
            250,
            Math.min(
              window.innerWidth - position.x,
              resizeStart.current.startWidth + deltaX
            )
          );
          const newHeight = Math.max(
            280,
            Math.min(
              window.innerHeight - position.y,
              resizeStart.current.startHeight + deltaY
            )
          );

          setSize({ width: newWidth, height: newHeight });

          if (noteRef.current) {
            gsap.set(noteRef.current, {
              width: `${newWidth}px`,
              height: `${newHeight}px`,
              ease: "none",
            });
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
    }, [isDragging, isResizing, position, size, ID, dispatch, isMaximized]);

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
      e.stopPropagation();

      if (!isMaximized) {
        setOriginalPosition({ x: position.x, y: position.y });
        setOriginalSize({ width: size.width, height: size.height });

        const windowWidth =
          typeof window !== "undefined" ? window.innerWidth : 1200;
        const windowHeight =
          typeof window !== "undefined" ? window.innerHeight : 800;

        const maxWidth = Math.min(1152, windowWidth * 0.9);
        const maxHeight = windowHeight * 0.9;

        if (noteRef.current) {
          gsap.to(noteRef.current, {
            left: `${(windowWidth - maxWidth) / 2}px`,
            top: `${(windowHeight - maxHeight) / 2}px`,
            width: `${maxWidth}px`,
            height: `${maxHeight}px`,
            duration: 0.6,
            ease: "power3.out",
            onStart: () => {
              gsap.set(noteRef.current, {
                position: "fixed",
                zIndex: 9999,
                transform: "none",
              });
            },
            onComplete: () => {
              setPosition({
                x: (windowWidth - maxWidth) / 2,
                y: (windowHeight - maxHeight) / 2,
              });
              setSize({ width: maxWidth, height: maxHeight });
              setIsMaximized(true);
            },
          });
        }
      } else {
        if (noteRef.current) {
          gsap.to(noteRef.current, {
            left: `${originalPosition.x}px`,
            top: `${originalPosition.y}px`,
            width: `${originalSize.width}px`,
            height: `${originalSize.height}px`,
            duration: 0.6,
            ease: "power3.out",
            onComplete: () => {
              setPosition(originalPosition);
              setSize(originalSize);
              setIsMaximized(false);

              gsap.set(noteRef.current, {
                position: "absolute",
                zIndex: zIndex,
                transform: "none",
              });
            },
          });
        }
      }

      dispatch(bringNoteForward({ ID }));
    };

    const handleBringForward = (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(bringNoteForward({ ID }));

      if (noteRef.current) {
        gsap.to(noteRef.current, {
          scale: 1.03,
          duration: 0.15,
          ease: "back.out(1.7)",
          yoyo: true,
          repeat: 1,
        });
      }
    };

    const saveBlocks = useCallback(async () => {
      try {
        setIsSaving(true);
        console.log("Manual save via HTTP for StickyNote ID:", ID);

        await axios.post(
          `${BACKEND_STICKYNOTES_DOMAIN}/save_sticky_notes`,
          {
            sticky_note_id: ID,
            blocks: blocks,
          },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        lastSavedBlocks.current = JSON.stringify(blocks);
        console.log("Manual save successful for StickyNote ID:", ID);
      } catch (error) {
        console.error("Manual save failed:", error);
      } finally {
        setIsSaving(false);
      }
    }, [blocks, ID]);

    const connectSockets = useCallback(() => {
      dispatch(connect());
    }, [dispatch]);

    useEffect(() => {
      if (!isConnected) {
        connectSockets();
      }
    }, [isConnected, connectSockets]);

    console.log("Rendering StickyNote ID:", ID);

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
          backgroundColor: colorMap[NoteColors as keyof typeof colorMap],
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          zIndex: isMaximized ? 9999 : zIndex,
          transform: "none",
        }}
        title="Drag to move, resize from bottom-right corner, tap on the top to bring to front"
      >
        <div
          className={clsx(
            "flex justify-between items-center px-4 py-2 flex-shrink-0 bg-gradient-to-b to-transparent",
            {
              "from-foreground/10": isDarkBackground,
              "from-background/5": !isDarkBackground,
            }
          )}
          onMouseDown={handleMouseDown}
        >
          <div
            className={clsx(
              `flex items-center gap-2 ${
                isMaximized ? "cursor-default" : "cursor-move"
              } transition`,
              {
                "text-foreground/70 hover:text-foreground": isDarkBackground,
                "text-background/70 hover:text-background": isLightBackground,
                "text-black/70 hover:text-black":
                  !isDarkBackground && !isLightBackground,
              }
            )}
          >
            <GripVertical className="w-3.5 h-3.5" />
            {CreatedAt && (
              <CreationTime CreatedAt={CreatedAt} noteColor={NoteColors} />
            )}
          </div>
          <div className="flex items-center">
            <AdaptiveButton
              onClick={saveBlocks}
              noteColor={NoteColors}
              size="sm"
              className="rounded"
              disabled={isSaving}
              title="Manual save via HTTP"
            >
              <Saving isSaving={isSaving} noteColor={NoteColors} />
            </AdaptiveButton>

            <ConnectionStatus
              color={isConnected ? "green" : "red"}
              autoSave={isAutoSaving}
              noteColor={NoteColors}
            />

            <AdaptiveButton
              onClick={toggleMaximize}
              noteColor={NoteColors}
              aria-label={isMaximized ? "Minimize note" : "Maximize note"}
            >
              {isMaximized ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </AdaptiveButton>

            <GenerateLink NoteColors={NoteColors} />

            <AdaptiveButton
              onClick={() => {
                dispatch(deleteStickyNote(ID));
              }}
              noteColor={NoteColors}
              variant="destructive"
              aria-label="Delete note"
            >
              <X className="w-3.5 h-3.5" />
            </AdaptiveButton>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <Editor
            editor={editor}
            customTheme={customTheme}
            setBlock={setBlocks}
          />
        </div>

        <div
          className={clsx(
            "absolute bottom-0 right-0 w-full h-4 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-transparent from-50% to-50%",
            {
              "to-foreground/20": isDarkBackground,
              "to-background/20": !isDarkBackground,
            }
          )}
          onMouseDown={handleResizeMouseDown}
        />
      </div>
    );
  }
);

StickyNotes.displayName = "StickyNotes";

export default StickyNotes;
