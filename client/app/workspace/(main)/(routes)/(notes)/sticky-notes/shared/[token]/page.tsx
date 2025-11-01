"use client";

import { BACKEND_STICKYNOTES_DOMAIN } from "@/app/lib/constant";
import { Role, StickyNoteTypes } from "@/app/types/StickyNotesTypes";
import { colorMap } from "@/app/types/types";
import Editor from "@/components/Shared/Editor";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import axios from "axios";
import { use, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { clsx } from "clsx";
import { Lock } from "lucide-react";
import LoadingStickyNotes from "@/components/StickyNotes/LoadingStickyNotes";
import { useRouter } from "next/navigation";
import { connect, getSocket } from "@/app/lib/features/socketSlice";
import { RootState } from "@/app/lib/store";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { Block } from "@blocknote/core";
import Header from "@/components/StickyNotes/Header";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

interface StickyNoteData {
  CanEdit: boolean;
  Note: StickyNoteTypes;
  Role: Role;
}

export default function SharedStickyNotePage({ params }: PageProps) {
  const { token } = use(params);
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector(
    (state: RootState) => state.socket.isConnected
  );
  const router = useRouter();
  const [stickyNoteData, setStickyNoteData] = useState<StickyNoteData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [blocks, setBlocks] = useState<Block[]>(
    stickyNoteData?.Note.Content?.Blocks || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedBlocks = useRef<string>("");
  const isReceivingUpdate = useRef(false);
  const lastSaveTime = useRef<number>(0);
  const MAX_SAVE_INTERVAL = 500;

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await axios.get(
        `${BACKEND_STICKYNOTES_DOMAIN}/get_sticky_note_by_share_link/${token}`,
        {
          withCredentials: true,
        }
      );
      setStickyNoteData(response.data);
      setError(null);
    } catch {
      setError("Failed to load sticky note");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const editor = useCreateBlockNote({
    initialContent:
      stickyNoteData?.Note.Content?.Blocks &&
      stickyNoteData.Note.Content.Blocks.length > 0
        ? stickyNoteData.Note.Content.Blocks
        : undefined,
  });

  useEffect(() => {
    if (
      editor &&
      stickyNoteData?.Note.Content?.Blocks &&
      stickyNoteData.Note.Content.Blocks.length > 0
    ) {
      const loadContent = async () => {
        try {
          await editor.replaceBlocks(
            editor.document,
            stickyNoteData?.Note?.Content?.Blocks || []
          );
        } catch {
          console.error("Error loading sticky note content into editor");
        }
      };
      loadContent();
    }
  }, [stickyNoteData, editor]);

  const NoteColors = stickyNoteData?.Note.NoteColors;
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

  useEffect(() => {
    if (noteRef.current && !isLoading && stickyNoteData) {
      const timeline = gsap.timeline();

      timeline.fromTo(
        noteRef.current,
        {
          y: -100,
          opacity: 0,
          scale: 0.9,
          rotateX: -15,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateX: 0,
          duration: 0.8,
          ease: "elastic.out(1, 0.8)",
        }
      );

      if (headerRef.current) {
        timeline.fromTo(
          headerRef.current,
          {
            x: -50,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.5"
        );
      }

      if (closeButtonRef.current) {
        timeline.fromTo(
          closeButtonRef.current,
          {
            scale: 0,
            rotate: -180,
            opacity: 0,
          },
          {
            scale: 1,
            rotate: 0,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(2)",
          },
          "-=0.3"
        );
      }
    }
  }, [isLoading, stickyNoteData]);

  const handleClose = () => {
    if (noteRef.current) {
      gsap.to(noteRef.current, {
        y: -100,
        opacity: 0,
        scale: 0.9,
        rotateX: -15,
        duration: 0.5,
        ease: "power3.in",
        onComplete: () => {
          router.push("/workspace/sticky-notes");
        },
      });
    } else {
      router.push("/workspace/sticky-notes");
    }
  };

  const connectSockets = useCallback(() => {
    if (!stickyNoteData) return;
    dispatch(connect(stickyNoteData?.Note.ID));
  }, [dispatch, stickyNoteData]);

  useEffect(() => {
    if (!isConnected) {
      connectSockets();
    }
  }, [isConnected, connectSockets]);

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
            sticky_note_id: stickyNoteData?.Note.ID,
            blocks: blocks,
          },
        })
      );

      lastSavedBlocks.current = currentBlocksString;
      setTimeout(() => {
        setIsSaving(false);
      }, 300);
    } catch {
      console.error("Error auto-saving sticky note");
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 300);
    }
  }, [blocks, isConnected, stickyNoteData?.Note.ID]);

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
  }, [blocks, isConnected, autoSaveBlocks]);

  const listenToSocketUpdates = useCallback(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (
          message.type === "update_sticky_note" &&
          message.data.sticky_note_id === stickyNoteData?.Note.ID
        ) {
          const updatedBlocks = message.data.blocks;

          isReceivingUpdate.current = true;

          editor?.replaceBlocks(editor.document, updatedBlocks);
          lastSavedBlocks.current = JSON.stringify(updatedBlocks);

          setTimeout(() => {
            isReceivingUpdate.current = false;
          }, 100);
        }
      } catch {
        console.error("Error handling incoming WebSocket message");
      }
    };
    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [editor, stickyNoteData?.Note.ID]);

  useEffect(() => {
    listenToSocketUpdates();
  }, [listenToSocketUpdates]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <LoadingStickyNotes />
      </div>
    );
  }

  if (error || !stickyNoteData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 animate-pulse">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-foreground">
            {error || "Note not found"}
          </h2>
          <p className="text-muted-foreground">
            This sticky note may have been deleted or the share link is invalid.
            Please check the link and try again.
          </p>
          <button
            onClick={() => router.push("/workspace/sticky-notes")}
            className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Sticky Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden z-[9999] bg-gradient-to-br from-background to-card">
      <div
        ref={noteRef}
        className={clsx(
          "fixed inset-0",
          "flex flex-col overflow-hidden",
          "rounded-none sm:rounded-xl md:rounded-2xl",
          "shadow-2xl backdrop-blur-sm",
          "transition-all duration-300",
          "sticky-note-scrollbar border",
          isDarkBackground
            ? "border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
            : "border-border/20",
          "[box-shadow:0_25px_50px_-12px_var(--note-primary-color)33,_0_0_0_1px_var(--note-border-color)]"
        )}
        style={{
          backgroundColor,
        }}
      >
        <div
          className={clsx(
            "absolute top-0 left-0 rounded-br-full opacity-20 animate-pulse",
            "w-4 h-4 sm:w-3 sm:h-3 md:w-2 md:h-2",
            isDarkBackground ? "bg-white" : "bg-black"
          )}
        />
        <div
          className={clsx(
            "absolute top-0 right-0 rounded-bl-full opacity-20 animate-pulse",
            "w-4 h-4 sm:w-3 sm:h-3 md:w-2 md:h-2 [animation-delay:0.5s]",
            isDarkBackground ? "bg-white" : "bg-black"
          )}
        />

        <div className="col-span-12">
          <Header
            isDarkBackground={isDarkBackground}
            NoteColors={stickyNoteData?.Note.NoteColors || "#9333ea"}
            isConnected={isConnected}
            isSaving={isSaving}
            Title={stickyNoteData?.Note.Title || "Untitled"}
            ID={stickyNoteData?.Note.ID || ""}
            Role={stickyNoteData?.Role || "viewer"}
            CanEdit={stickyNoteData?.CanEdit || false}
            closeButtonRef={closeButtonRef}
            handleClose={handleClose}
            page="shared-sticky-note"
          />
        </div>

        <main className="flex-1 min-h-0 overflow-auto sticky-note-scrollbar">
          <div className="h-full">
            {editor && (
              <Editor
                editor={editor}
                customTheme={customTheme}
                editable={stickyNoteData.CanEdit}
                setBlock={setBlocks}
              />
            )}
          </div>
        </main>

        <div
          className={clsx(
            "absolute bottom-0 left-0 right-0 h-1 opacity-20",
            "transition-opacity duration-300",
            isDarkBackground
              ? "bg-gradient-to-r from-transparent via-white to-transparent"
              : "bg-gradient-to-r from-transparent via-primary to-transparent",
            "bg-[length:200%_100%] animate-[gradient-shift_3s_ease_infinite]"
          )}
        />
      </div>
    </div>
  );
}
