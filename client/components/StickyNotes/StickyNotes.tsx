import {
  NotesState,
  updateNotePosition,
  updateNoteSize,
  bringNoteForward,
  DEFAULT_NOTE_WIDTH,
  DEFAULT_NOTE_HEIGHT,
} from "../../app/lib/features/notesSlice";
import { useAppDispatch, useAppSelector } from "../../app/lib/hooks";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import { useRef, useState, useEffect, memo, useCallback } from "react";
import gsap from "gsap";
import { clsx } from "clsx";
import Editor from "../Shared/Editor";
import { colorMap } from "@/app/types/types";
import { Block } from "@blocknote/core";
import { BACKEND_STICKYNOTES_DOMAIN } from "@/app/lib/constant";
import axios from "axios";
import { RootState } from "@/app/lib/store";
import { connect, getSocket } from "@/app/lib/features/socketSlice";

import Header from "./Header";

const StickyNotes = memo(
  ({
    ID,
    NoteColors,
    Title,
    x,
    y,
    width,
    height,
    zIndex,
    CreatedAt,
    Content,
  }: NotesState) => {
    const dispatch = useAppDispatch();
    const isConnected = useAppSelector(
      (state: RootState) => state.socket.isConnected
    );

    const editor = useCreateBlockNote({
      initialContent:
        Content?.Blocks && Content.Blocks.length > 0
          ? Content.Blocks
          : undefined,
      placeholders: {
        emptyDocument: "Start typing..",
      },
    });
    const noteRef = useRef<HTMLDivElement>(null);
    const resizeHandleRef = useRef<HTMLDivElement>(null);
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
    const [blocks, setBlocks] = useState<Block[]>(Content?.Blocks || []);
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedBlocks = useRef<string>("");
    const isReceivingUpdate = useRef(false);
    const lastSaveTime = useRef<number>(0);
    const MAX_SAVE_INTERVAL = 500;

    const getResponsiveDimensions = useCallback(() => {
      if (typeof window === "undefined")
        return { minWidth: DEFAULT_NOTE_WIDTH, minHeight: DEFAULT_NOTE_HEIGHT };

      const screenWidth = window.innerWidth;

      if (screenWidth < 640) {
        return { minWidth: DEFAULT_NOTE_WIDTH, minHeight: DEFAULT_NOTE_HEIGHT };
      } else if (screenWidth < 768) {
        return { minWidth: DEFAULT_NOTE_WIDTH, minHeight: DEFAULT_NOTE_HEIGHT };
      } else if (screenWidth < 1024) {
        return { minWidth: DEFAULT_NOTE_WIDTH, minHeight: DEFAULT_NOTE_HEIGHT };
      } else {
        return { minWidth: DEFAULT_NOTE_WIDTH, minHeight: DEFAULT_NOTE_HEIGHT };
      }
    }, []);

    useEffect(() => {
      setPosition({ x, y });
      setSize({ width, height });
    }, [x, y, width, height, zIndex, ID]);

    useEffect(() => {
      sizeRef.current = { width: size.width, height: size.height };
    }, [size.width, size.height]);

    const autoSaveBlocks = useCallback(async () => {
      if (blocks.length === 0) return;
      if (isReceivingUpdate.current) return;

      const socket = getSocket();
      if (!isConnected || !socket) return;

      const currentBlocksString = JSON.stringify(blocks);
      if (currentBlocksString === lastSavedBlocks.current) return;

      try {
        setIsSaving(true);
        lastSaveTime.current = Date.now();

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
      } catch (error) {
        console.error("Error auto-saving sticky note:", error);
      } finally {
        setTimeout(() => {
          setIsSaving(false);
        }, 300);
      }
    }, [blocks, ID, isConnected]);

    useEffect(() => {
      if (blocks.length === 0) return;
      if (isReceivingUpdate.current) return;

      const socket = getSocket();
      if (!isConnected || !socket) return;

      const currentBlocksString = JSON.stringify(blocks);

      if (currentBlocksString === lastSavedBlocks.current) return;

      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTime.current;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      if (timeSinceLastSave >= MAX_SAVE_INTERVAL) {
        autoSaveBlocks();
      } else {
        const delay = Math.max(100, MAX_SAVE_INTERVAL - timeSinceLastSave);
        saveTimeoutRef.current = setTimeout(() => {
          autoSaveBlocks();
        }, delay);
      }

      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }, [blocks, ID, isConnected, autoSaveBlocks]);

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
    const cardColor = getCSSVariable("--card") || "#111111";
    const borderColor = getCSSVariable("--border") || "#27272a";

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
          text: foregroundColor,
          background: cardColor,
        },
        tooltip: {
          text: foregroundColor,
          background: cardColor,
        },
        hovered: {
          text: foregroundColor,
          background: primaryColor,
        },
        selected: {
          text: "#000000",
          background: isDarkBackground
            ? "rgba(147, 51, 234, 0.2)"
            : "rgba(255, 255, 255, 0.2)",
        },
        disabled: {
          text: mutedForegroundColor,
          background: isDarkBackground
            ? "rgba(0, 0, 0, 0.05)"
            : "rgba(255, 255, 255, 0.05)",
        },
        shadow: isDarkBackground
          ? "rgba(147, 51, 234, 0.2)"
          : "rgba(0, 0, 0, 0.1)",
        border: borderColor,
        sideMenu: isDarkBackground ? "#e4e4e7" : cardColor,
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
          black: { text: foregroundColor, background: cardColor },
          white: { text: "#000000", background: "#f8f8f8" },
        },
      },
      borderRadius: 4,
      fontFamily: "Inter, sans-serif",
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      if (typeof window !== "undefined" && window.innerWidth < 760) {
        return;
      }

      if (
        (e.target as HTMLElement).closest("button") ||
        (e.target as HTMLElement).closest(".bn-editor") ||
        isMaximized
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
      handleBringForward(e);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      if (typeof window !== "undefined" && window.innerWidth < 760) {
        return;
      }

      if (
        (e.target as HTMLElement).closest("button") ||
        (e.target as HTMLElement).closest(".bn-editor") ||
        isMaximized
      ) {
        return;
      }
      const touch = e.touches[0];
      setIsDragging(true);
      dragStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        startX: position.x,
        startY: position.y,
      };
      handleBringForward(e as unknown as React.MouseEvent<HTMLDivElement>);
    };

    useEffect(() => {
      const { minWidth, minHeight } = getResponsiveDimensions();

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
            minWidth,
            Math.min(
              window.innerWidth - position.x,
              resizeStart.current.startWidth + deltaX
            )
          );
          const newHeight = Math.max(
            minHeight,
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

      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (isDragging && !isMaximized) {
          e.preventDefault();
          const deltaX = touch.clientX - dragStart.current.x;
          const deltaY = touch.clientY - dragStart.current.y;
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
          e.preventDefault();
          const deltaX = touch.clientX - resizeStart.current.x;
          const deltaY = touch.clientY - resizeStart.current.y;
          const newWidth = Math.max(
            minWidth,
            Math.min(
              window.innerWidth - position.x,
              resizeStart.current.startWidth + deltaX
            )
          );
          const newHeight = Math.max(
            minHeight,
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

      const handleTouchEnd = () => {
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
        document.addEventListener("touchmove", handleTouchMove, {
          passive: false,
        });
        document.addEventListener("touchend", handleTouchEnd);
        return () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
          document.removeEventListener("touchmove", handleTouchMove);
          document.removeEventListener("touchend", handleTouchEnd);
        };
      }
    }, [
      isDragging,
      isResizing,
      position,
      size,
      ID,
      dispatch,
      isMaximized,
      getResponsiveDimensions,
    ]);

    const handleResizeMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      handleBringForward(e);
      setIsResizing(true);
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        startWidth: size.width,
        startHeight: size.height,
      };

      if (resizeHandleRef.current) {
        gsap.to(resizeHandleRef.current, {
          scale: 1.3,
          duration: 0.2,
          ease: "back.out(2)",
        });
      }
    };

    const handleResizeTouchStart = (e: React.TouchEvent) => {
      e.stopPropagation();
      const touch = e.touches[0];
      setIsResizing(true);
      resizeStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        startWidth: size.width,
        startHeight: size.height,
      };

      if (resizeHandleRef.current) {
        gsap.to(resizeHandleRef.current, {
          scale: 1.3,
          duration: 0.2,
          ease: "back.out(2)",
        });
      }
    };

    useEffect(() => {
      if (!isResizing && resizeHandleRef.current) {
        gsap.to(resizeHandleRef.current, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    }, [isResizing]);

    const toggleMaximize = (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!isMaximized) {
        setOriginalPosition({ x: position.x, y: position.y });
        setOriginalSize({ width: size.width, height: size.height });

        const windowWidth =
          typeof window !== "undefined" ? window.innerWidth : 1200;
        const windowHeight =
          typeof window !== "undefined" ? window.innerHeight : 800;

        let maxWidth;
        if (windowWidth < 640) {
          maxWidth = windowWidth * 0.95;
        } else if (windowWidth < 768) {
          maxWidth = windowWidth * 0.92;
        } else if (windowWidth < 1024) {
          maxWidth = Math.min(900, windowWidth * 0.9);
        } else {
          maxWidth = Math.min(1152, windowWidth * 0.9);
        }

        const maxHeight = windowHeight * 0.9;

        if (noteRef.current) {
          gsap.to(noteRef.current, {
            left: `${(windowWidth - maxWidth) / 2}px`,
            top: `${(windowHeight - maxHeight) / 2}px`,
            width: `${maxWidth}px`,
            height: `${maxHeight}px`,
            duration: 0.6,
            ease: "power3.out",
            boxShadow: `0 25px 50px -12px ${primaryColor}66`,
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
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
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
          scale: 1.02,
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
      } catch (error) {
        console.error("Error auto-saving sticky note:", error);
      } finally {
        setIsSaving(false);
      }
    }, [blocks, ID]);

    const connectSockets = useCallback(() => {
      dispatch(connect(ID));
    }, [ID, dispatch]);

    useEffect(() => {
      if (!isConnected) {
        connectSockets();
      }
    }, [isConnected, connectSockets]);

    useEffect(() => {
      if (noteRef.current) {
        const timeline = gsap.timeline();

        timeline.fromTo(
          noteRef.current,
          {
            y: -100,
            opacity: 0,
            scale: 0.95,
            rotateX: -10,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotateX: 0,
            duration: 0.65,
            ease: "power3.out",
          }
        );
      }
    }, [ID]);

    const listenToSocketUpdates = useCallback(() => {
      const socket = getSocket();
      if (!socket) return;

      const handleMessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          if (
            message.type === "update_sticky_note" &&
            message.data.sticky_note_id === ID
          ) {
            const updatedBlocks = message.data.blocks;

            isReceivingUpdate.current = true;

            editor?.replaceBlocks(editor.document, updatedBlocks);
            lastSavedBlocks.current = JSON.stringify(updatedBlocks);

            setTimeout(() => {
              isReceivingUpdate.current = false;
            }, 100);
          }
        } catch (error) {
          console.error("Error listening to socket updates:", error);
        }
      };
      socket.addEventListener("message", handleMessage);

      return () => {
        socket.removeEventListener("message", handleMessage);
      };
    }, [editor, ID]);

    useEffect(() => {
      listenToSocketUpdates();
    }, [listenToSocketUpdates]);

    return (
      <div
        ref={noteRef}
        className={clsx(
          "rounded-xl flex flex-col overflow-hidden group transition-all duration-300 ",
          "backdrop-blur-sm sticky-note-scrollbar",
          isMaximized
            ? "fixed z-[9999]"
            : typeof window !== "undefined" && window.innerWidth < 1024
            ? "relative"
            : "absolute",
          isMaximized
            ? "shadow-2xl"
            : "shadow-lg hover:shadow-xl active:shadow-2xl",
          isDragging && "cursor-grabbing select-none scale-[1.01]",
          isArchiving && "pointer-events-none opacity-50",
          isDarkBackground
            ? "border-2 border-white/10"
            : "border-2 border-black/5"
        )}
        style={{
          ...(!isMaximized &&
            typeof window !== "undefined" &&
            window.innerWidth >= 1024 && {
              left: position.x,
              top: position.y,
              width: size.width,
              height: size.height,
            }),
          ...(typeof window !== "undefined" &&
            window.innerWidth < 1024 &&
            !isMaximized && {
              width: "100%",
              height: "auto",
              minHeight: size.height,
            }),
          ...(isMaximized && {
            position: "fixed",
            left: `${
              (typeof window !== "undefined" ? window.innerWidth : 1200) > 640
                ? "0%"
                : "2.5%"
            }`,
            top: `${
              (typeof window !== "undefined" ? window.innerHeight : 800) > 640
                ? "0%"
                : "2.5%"
            }`,
            right: `${
              (typeof window !== "undefined" ? window.innerWidth : 1200) > 640
                ? "0%"
                : "2.5%"
            }`,
            bottom: `${
              (typeof window !== "undefined" ? window.innerHeight : 800) > 640
                ? "0%"
                : "2.5%"
            }`,
            width: "auto",
            height: "auto",
          }),
          backgroundColor: colorMap[NoteColors as keyof typeof colorMap],
          zIndex: isMaximized ? 9999 : zIndex,
          touchAction: "none",
          boxShadow: isMaximized
            ? `0 25px 50px -12px ${primaryColor}66, 0 0 0 1px ${borderColor}`
            : undefined,
        }}
        onTouchStart={handleTouchStart}
        title="Drag to move, resize from bottom-right corner"
      >
        <Header
          isDarkBackground={isDarkBackground}
          isMaximized={isMaximized}
          CreatedAt={CreatedAt}
          NoteColors={NoteColors}
          isConnected={isConnected}
          isSaving={isSaving}
          saveBlocks={saveBlocks}
          Title={Title}
          toggleMaximize={toggleMaximize}
          handleMouseDown={handleMouseDown}
          handleBringForward={handleBringForward}
          ID={ID}
          Role="owner"
          CanEdit={true}
          page="sticky-note"
        />
        <main className="flex-1 min-h-0 overflow-auto sticky-note-scrollbar py-3">
          <Editor
            editor={editor}
            customTheme={customTheme}
            setBlock={setBlocks}
          />
        </main>
        {!isMaximized &&
          typeof window !== "undefined" &&
          window.innerWidth >= 1024 && (
            <div
              ref={resizeHandleRef}
              className={clsx(
                "absolute bottom-0 right-0",
                "w-10 h-10",
                "cursor-nwse-resize touch-none",
                "opacity-30 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300",
                "bg-gradient-to-br from-transparent via-transparent",
                isDarkBackground ? "to-white/30" : "to-black/30",
                "hover:scale-110 active:scale-110",
                "flex items-end justify-end p-1.5"
              )}
              onMouseDown={handleResizeMouseDown}
              onTouchStart={handleResizeTouchStart}
              aria-label="Resize note"
            >
              <div
                className={clsx(
                  "w-4 h-4 border-r-2 border-b-2 rounded-br-md",
                  isDarkBackground
                    ? "border-white/50 hover:border-white/70"
                    : "border-black/50 hover:border-black/70",
                  "transition-colors"
                )}
              />
            </div>
          )}
      </div>
    );
  }
);

StickyNotes.displayName = "StickyNotes";

export default StickyNotes;
