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
import { Eye, Lock, Users, X } from "lucide-react";
import LoadingStickyNotes from "@/components/StickyNotes/LoadingStickyNotes";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [stickyNoteData, setStickyNoteData] = useState<StickyNoteData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
    } catch (err) {
      setError("Failed to load sticky note");
      console.error("Error fetching sticky note:", err);
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
        } catch (error) {
          console.error("Error loading editor content:", error);
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
      sideMenu: cardColor,
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

      if (badgeRef.current) {
        timeline.fromTo(
          badgeRef.current,
          {
            scale: 0,
            opacity: 0,
          },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(2)",
          },
          "-=0.4"
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
          router.push('/workspace/sticky-notes');
        },
      });
    } else {
      router.push('/workspace/sticky-notes');
    }
  };

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
            onClick={() => router.push('/workspace/sticky-notes')}
            className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Go to Sticky Notes
          </button>
        </div>
      </div>
    );
  }

  const getRoleIcon = () => {
    if (stickyNoteData.Role === "owner") return <Users className="h-4 w-4" />;
    if (stickyNoteData.CanEdit) return <Users className="h-4 w-4" />;
    return <Eye className="h-4 w-4" />;
  };

  const getRoleText = () => {
    if (stickyNoteData.Role === "owner") return "Owner";
    if (stickyNoteData.CanEdit) return "Can Edit";
    return "View Only";
  };

  return (
    <div 
      className="fixed inset-0 overflow-hidden z-[9999]"
      style={{
        background: `linear-gradient(135deg, ${backgroundColorVar} 0%, ${cardColor} 100%)`,
      }}
    >
      <div
        ref={noteRef}
        className={clsx(
          "fixed inset-0 sm:inset-4 md:inset-8 lg:inset-12",
          "flex flex-col overflow-hidden",
          "rounded-none sm:rounded-xl md:rounded-2xl",
          "shadow-2xl backdrop-blur-sm",
          "transition-all duration-300",
          "sticky-note-scrollbar"
        )}
        style={{
          backgroundColor,
          boxShadow: `0 25px 50px -12px ${primaryColor}33, 0 0 0 1px ${borderColor}`,
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
            "w-4 h-4 sm:w-3 sm:h-3 md:w-2 md:h-2",
            isDarkBackground ? "bg-white" : "bg-black"
          )}
          style={{ animationDelay: "0.5s" }}
        />

        <header
          className={clsx(
            "flex-shrink-0 px-4 sm:px-6 py-4 sm:py-5",
            "border-b backdrop-blur-sm",
            "transition-colors duration-300"
          )}
          style={{
            borderColor: isDarkBackground
              ? "rgba(255, 255, 255, 0.1)"
              : isLightBackground
              ? "rgba(0, 0, 0, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
            backgroundColor: isDarkBackground
              ? "rgba(0, 0, 0, 0.05)"
              : isLightBackground
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(255, 255, 255, 0.05)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1
                ref={headerRef}
                className={clsx(
                  "text-xl sm:text-2xl md:text-3xl font-semibold truncate mb-2",
                  "transition-colors duration-300"
                )}
                style={{
                  color: isDarkBackground
                    ? foregroundColor
                    : isLightBackground
                    ? backgroundColorVar
                    : "#000000",
                }}
              >
                {stickyNoteData.Note.Title || "Untitled Note"}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div
                  ref={badgeRef}
                  className={clsx(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium",
                    "transition-all duration-300 hover:scale-105"
                  )}
                  style={{
                    backgroundColor: isDarkBackground
                      ? "rgba(255, 255, 255, 0.1)"
                      : isLightBackground
                      ? "rgba(0, 0, 0, 0.1)"
                      : "rgba(255, 255, 255, 0.2)",
                    color: isDarkBackground
                      ? foregroundColor
                      : isLightBackground
                      ? backgroundColorVar
                      : "#000000",
                  }}
                >
                  {getRoleIcon()}
                  <span>{getRoleText()}</span>
                </div>
                {stickyNoteData.Note.CreatedAt && (
                  <time
                    className={clsx(
                      "text-xs sm:text-sm transition-colors duration-300"
                    )}
                    style={{
                      color: isDarkBackground
                        ? mutedForegroundColor
                        : isLightBackground
                        ? "rgba(0, 0, 0, 0.6)"
                        : "rgba(0, 0, 0, 0.6)",
                    }}
                  >
                    Created{" "}
                    {new Date(stickyNoteData.Note.CreatedAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </time>
                )}
              </div>
            </div>

            <button
              ref={closeButtonRef}
              onClick={handleClose}
              className={clsx(
                "flex-shrink-0 p-2 rounded-lg transition-all duration-300",
                "hover:scale-110 active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-offset-2"
              )}
              style={{
                backgroundColor: isDarkBackground
                  ? "rgba(255, 255, 255, 0.1)"
                  : isLightBackground
                  ? "rgba(0, 0, 0, 0.1)"
                  : "rgba(255, 255, 255, 0.2)",
                color: isDarkBackground
                  ? foregroundColor
                  : isLightBackground
                  ? backgroundColorVar
                  : "#000000",
                boxShadow: `0 0 0 0 ${primaryColor}`,
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  boxShadow: `0 0 20px 5px ${primaryColor}55`,
                  duration: 0.3,
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  boxShadow: `0 0 0 0 ${primaryColor}`,
                  duration: 0.3,
                });
              }}
              aria-label="Close sticky note"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-auto sticky-note-scrollbar">
          <div className="h-full">
            {editor && <Editor editor={editor} customTheme={customTheme}
            editable={stickyNoteData.CanEdit}
             />}
          </div>
        </main>

        <div
          className={clsx(
            "absolute bottom-0 left-0 right-0 h-1 opacity-20",
            "transition-opacity duration-300"
          )}
          style={{
            background: isDarkBackground
              ? `linear-gradient(90deg, transparent 0%, ${foregroundColor} 50%, transparent 100%)`
              : `linear-gradient(90deg, transparent 0%, ${primaryColor} 50%, transparent 100%)`,
            backgroundSize: "200% 100%",
            animation: "gradient-shift 3s ease infinite",
          }}
        />
      </div>
    </div>
  );
}