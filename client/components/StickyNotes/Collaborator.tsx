import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, UserPlus, X, Loader2, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import clsx from "clsx";
import axios from "axios";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BACKEND_STICKYNOTES_DOMAIN } from "@/app/lib/constant";
import { AdaptiveButton } from "../Button/AdaptiveButton";
import { Role } from "@/app/types/StickyNotesTypes";

interface SearchUserTypes {
  ProfileID: string;
  Username: string;
  Avatar: string;
}

interface CollaboratorTypes {
  Username: string;
  Avatar: string;
  Role: Role;
}

interface CollaboratorProps {
  noteId: string;
  noteColor: string;
  isDarkBackground: boolean;
}

const Collaborator: React.FC<CollaboratorProps> = ({
  noteId,
  noteColor,
  isDarkBackground,
}) => {
  const [searchUsers, setSearchUsers] = useState<SearchUserTypes[]>([]);
  const [collaborators, setCollaborators] = useState<CollaboratorTypes[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [addingUsers, setAddingUsers] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!username.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_STICKYNOTES_DOMAIN}/search_username/${username}`,
        {
          withCredentials: true,
        }
      );
      setSearchUsers(response.data.Profiles);
    } catch (error) {
      console.error("Error fetching users:", error);
      setSearchUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { scale: 0.95, opacity: 0, y: -10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.2, ease: "back.out(1.7)" }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (username.trim().length > 0) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        fetchUsers();
      }, 500);
    } else {
      setSearchUsers([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [username, fetchUsers]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleAddUser = async (user: SearchUserTypes) => {
    if (!user) {
      console.error("User parameter is null or undefined");
      return;
    }

    const profileId = user.ProfileID;

    if (!profileId) {
      console.error("No valid profile ID found for user:", user);
      return;
    }

    setAddingUsers((prev) => new Set(prev.add(profileId)));

    try {
      const response = await axios.put(
        `${BACKEND_STICKYNOTES_DOMAIN}/add_collaborator`,
        {
          sticky_note_id: noteId,
          profile_id: profileId,
          role: "viewer",
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Collaborator added successfully:", response.data);

      setSearchUsers((prev) => prev.filter((c) => c.ProfileID !== profileId));

      fetchCollaborators();
    } catch (error) {
      console.error("Error adding collaborator:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error status:", error.response.status);
      }
    } finally {
      setAddingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(profileId);
        return newSet;
      });
    }
  };

  const fetchCollaborators = useCallback(async () => {
    try {
      const response = await axios.get(
        `${BACKEND_STICKYNOTES_DOMAIN}/get_collaborators/${noteId}`,
        {
          withCredentials: true,
        }
      );
      console.log("Fetched collaborators:", response.data.Collaborators);
      setCollaborators(response.data.Collaborators || []);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
      setCollaborators([]);
    }
  }, [noteId]);

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
    }
  }, [fetchCollaborators, isOpen]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
          <AdaptiveButton
            noteColor={noteColor}
            className="h-7 w-7"
            aria-label="Manage collaborators"
          >
            <Users className="w-3.5 h-3.5" />
          </AdaptiveButton>
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="p-0 border-0 shadow-none z-[9999]"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <motion.div
          ref={contentRef}
          className="w-80 rounded-xl backdrop-blur-md overflow-hidden border border-primary/20"
          style={{
            backgroundColor: noteColor,
            boxShadow:
              "0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--primary)",
          }}
        >
          <div className="px-4 py-3 border-b border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <h3
                className={clsx(
                  "text-sm font-bold",
                  isDarkBackground ? "text-foreground/70" : "text-black"
                )}
              >
                Manage Collaborators
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <div className="p-4">
            <div className="relative">
              <Search
                className={clsx(
                  "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                  isDarkBackground
                    ? "text-foreground/70"
                    : "text-muted-foreground"
                )}
              />
              <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by username..."
                className={clsx(
                  "w-full pl-10 pr-10 py-2.5 rounded-lg border outline-none transition-all text-sm font-medium",
                  isDarkBackground
                    ? "bg-background/50 border-border text-foreground placeholder-muted-foreground focus:bg-background/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    : "bg-background border-border text-foreground placeholder-muted-foreground focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20"
                )}
              />
              {isLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Loader2
                    className={clsx(
                      "w-4 h-4",
                      isDarkBackground
                        ? "text-foreground/70"
                        : "text-muted-foreground"
                    )}
                  />
                </motion.div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {/* Search Results */}
              {searchUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 space-y-2 max-h-60 overflow-y-auto"
                >
                  <p
                    className={clsx(
                      "text-xs font-semibold mb-2 px-1",
                      isDarkBackground
                        ? "text-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    Search Results
                  </p>
                  {searchUsers.map((user, index) => {
                    const profileId = user.ProfileID;
                    const isAdding = addingUsers.has(profileId || "");

                    return (
                      <motion.div
                        key={profileId || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={clsx(
                          "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                          isDarkBackground
                            ? "bg-background/20 border-border hover:bg-background/30"
                            : "bg-background border-border hover:bg-background/80"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Image
                            src={user.Avatar || "/default-avatar.png"}
                            alt={user.Username}
                            width={36}
                            height={36}
                            className={clsx(
                              "w-9 h-9 rounded-full object-cover border-2",
                              isDarkBackground
                                ? "border-border/50"
                                : "border-border"
                            )}
                          />
                          <p
                            className={clsx(
                              "text-sm font-semibold",
                              isDarkBackground
                                ? "text-foreground"
                                : "text-foreground"
                            )}
                          >
                            {user.Username}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: isAdding ? 1 : 1.05 }}
                          whileTap={{ scale: isAdding ? 1 : 0.95 }}
                          onClick={() => {
                            if (!isAdding) {
                              handleAddUser(user);
                            }
                          }}
                          disabled={isAdding}
                          className={clsx(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                            isAdding
                              ? isDarkBackground
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                              : isDarkBackground
                              ? "bg-primary text-primary-foreground hover:bg-primary/80"
                              : "bg-primary text-primary-foreground hover:bg-primary/80"
                          )}
                        >
                          {isAdding ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              >
                                <Loader2 className="w-3.5 h-3.5" />
                              </motion.div>
                              Adding...
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              Add
                            </>
                          )}
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Current Collaborators */}
              {collaborators.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 space-y-2"
                >
                  <p
                    className={clsx(
                      "text-xs font-semibold mb-2 px-1",
                      isDarkBackground ? "text-foreground/70" : "text-black"
                    )}
                  >
                    Current Collaborators
                  </p>
                  {collaborators.map((collaborator, index) => (
                    <motion.div
                      key={collaborator.Username}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={clsx(
                        "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                        isDarkBackground
                          ? "bg-accent/20 border-accent/30"
                          : "bg-accent/10 border-accent/20"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Image
                          src={collaborator.Avatar || "/default-avatar.png"}
                          alt={collaborator.Username}
                          width={36}
                          height={36}
                          className={clsx(
                            "w-9 h-9 rounded-full object-cover border-2",
                            isDarkBackground
                              ? "border-accent/50"
                              : "border-accent/30"
                          )}
                        />
                        <p
                          className={clsx(
                            "text-sm font-semibold",
                            isDarkBackground
                              ? "text-foreground"
                              : "text-foreground"
                          )}
                        >
                          {collaborator.Username}
                        </p>
                      </div>
                      <span
                        className={clsx(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide",
                          isDarkBackground
                            ? "bg-accent/30 text-accent-foreground border border-accent/50"
                            : "bg-accent/20 text-accent-foreground border border-accent/30"
                        )}
                      >
                        {collaborator.Role}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* No Results */}
              {!isLoading && username && searchUsers.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={clsx(
                    "mt-3 p-4 text-center rounded-lg border",
                    isDarkBackground
                      ? "bg-background/20 border-border"
                      : "bg-background/50 border-border"
                  )}
                >
                  <p
                    className={clsx(
                      "text-sm font-medium",
                      isDarkBackground
                        ? "text-muted-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    No users found matching &ldquo;{username}&rdquo;
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Collaborator;
