"use client";

import { colorMap } from "@/app/types/types";
import Editor from "@/components/Shared/Editor";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import { use, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { clsx } from "clsx";
import { Lock } from "lucide-react";
import LoadingStickyNotes from "@/components/StickyNotes/LoadingStickyNotes";
import { useRouter } from "next/navigation";
import { connect } from "@/app/lib/features/socketSlice";
import { RootState } from "@/app/lib/store";
import { useAppDispatch, useAppSelector } from "@/app/lib/hooks";
import { Block } from "@blocknote/core";
import Header from "@/components/StickyNotes/Header";
import {
  autoSaveBlocks,
  fetchStickyNotesUsingSharedToken,
} from "@/app/lib/features/actionNoteSlice";
import { useStickyNoteSocketListener } from "@/components/StickyNotes/useStickyNoteSocketListener";
import { useCustomTheme } from "@/components/StickyNotes/CustomTheme";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function SharedStickyNotePage({ params }: PageProps) {
  const { stickyNoteDetails, permission, isLoading, error, isSaving } =
    useAppSelector((state) => state.actionNote);
  const customTheme = useCustomTheme(stickyNoteDetails?.NoteColors ?? "black");
  const { token } = use(params);
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector(
    (state: RootState) => state.socket.isConnected
  );
  const router = useRouter();

  const noteRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReceivingUpdate = useRef(false);
  const lastSaveTime = useRef<number>(0);
  const MAX_SAVE_INTERVAL = 500;

  const fetchData = useCallback(async () => {
    if (!token) return;
    dispatch(fetchStickyNotesUsingSharedToken(token));
  }, [token, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const editor = useCreateBlockNote();

  const { isReceivingUpdate: hookIsReceivingUpdate } =
    useStickyNoteSocketListener({
      stickyNoteId: stickyNoteDetails?.ID,
      editor,
      setBlocks,
    });

  useEffect(() => {
    isReceivingUpdate.current = hookIsReceivingUpdate;
  }, [hookIsReceivingUpdate]);

  const NoteColors = stickyNoteDetails?.NoteColors;
  const backgroundColor = colorMap[NoteColors as keyof typeof colorMap];
  const isDarkBackground = NoteColors === "black";

  useEffect(() => {
    if (noteRef.current && stickyNoteDetails) {
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
  }, [stickyNoteDetails]);

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
    if (!stickyNoteDetails) return;
    dispatch(connect(stickyNoteDetails.ID));
  }, [dispatch, stickyNoteDetails]);

  useEffect(() => {
    if (!isConnected) {
      connectSockets();
    }
  }, [isConnected, connectSockets]);

  useEffect(() => {
    if (!stickyNoteDetails?.ID) return;
    if (blocks.length === 0) return;
    if (isReceivingUpdate.current) return;

    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTime.current;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (timeSinceLastSave >= MAX_SAVE_INTERVAL) {
      dispatch(autoSaveBlocks({ blocks, ID: stickyNoteDetails?.ID, editor }));
    } else {
      const delay = Math.max(100, MAX_SAVE_INTERVAL - timeSinceLastSave);
      saveTimeoutRef.current = setTimeout(() => {
        dispatch(autoSaveBlocks({ blocks, ID: stickyNoteDetails?.ID, editor }));
      }, delay);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [blocks, isConnected, dispatch, stickyNoteDetails?.ID, editor]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <LoadingStickyNotes />
      </div>
    );
  }

  if (error || !stickyNoteDetails) {
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
            NoteColors={stickyNoteDetails?.NoteColors || "#9333ea"}
            isConnected={isConnected}
            isSaving={isSaving}
            Title={stickyNoteDetails?.Title || "Untitled"}
            ID={stickyNoteDetails?.ID || ""}
            Role={permission?.Role || "viewer"}
            CanEdit={permission?.CanEdit || false}
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
                editable={permission?.CanEdit}
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
