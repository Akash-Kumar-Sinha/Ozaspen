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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ProfileID?: string;
}

interface CollaboratorProps {
  noteId: string;
  noteColor: string;
  isDarkBackground: boolean;
  role?: Role;
}

const Collaborator: React.FC<CollaboratorProps> = ({
  noteId,
  noteColor,
  isDarkBackground,
  role,
}) => {
  const [searchUsers, setSearchUsers] = useState<SearchUserTypes[]>([]);
  const [collaborators, setCollaborators] = useState<CollaboratorTypes[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [addingUsers, setAddingUsers] = useState<Set<string>>(new Set());
  const [updatingRoles, setUpdatingRoles] = useState<Set<string>>(new Set());
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
      setSearchUsers(response.data.Profiles || []);
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
      return;
    }

    const profileId = user.ProfileID;

    if (!profileId) {
      return;
    }

    setAddingUsers((prev) => new Set(prev.add(profileId)));

    try {
      await axios.put(
        `${BACKEND_STICKYNOTES_DOMAIN}/add_collaborator`,
        {
          sticky_note_id: noteId,
          profile_id: profileId,
          role: "editor",
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSearchUsers((prev) => prev.filter((c) => c.ProfileID !== profileId));
      fetchCollaborators();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error adding collaborator:", error.response.data);
      }else{
        console.error("Error adding collaborator:", error);
      }

    } finally {
      setAddingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(profileId);
        return newSet;
      });
    }
  };

  const handleRoleChange = async (username: string, newRole: Role) => {
    setUpdatingRoles((prev) => new Set(prev.add(username)));

    try {
      await axios.put(
        `${BACKEND_STICKYNOTES_DOMAIN}/change_collaborator_role`,
        {
          sticky_note_id: noteId,
          username: username,
          new_role: newRole,
        },
        {
          withCredentials: true,
        }
      );

      fetchCollaborators();
    } catch (error) {
      console.error("Error changing collaborator role:", error);
    } finally {
      setUpdatingRoles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(username);
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
      setCollaborators(response.data.Collaborators || []);
    } catch {
      console.error("Error fetching collaborators");
      setCollaborators([]);
    }
  }, [noteId]);

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
    }
  }, [fetchCollaborators, isOpen]);

  const getRoleBadgeColor = (role: Role) => {
    switch (role.toLowerCase()) {
      case "owner":
        return isDarkBackground
          ? "bg-purple-500/20 text-purple-300 border-purple-400/30"
          : "bg-purple-100 text-purple-700 border-purple-200";
      case "editor":
        return isDarkBackground
          ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
          : "bg-blue-100 text-blue-700 border-blue-200";
      case "viewer":
        return isDarkBackground
          ? "bg-gray-500/20 text-gray-300 border-gray-400/30"
          : "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return isDarkBackground
          ? "bg-gray-500/20 text-gray-300 border-gray-400/30"
          : "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const isOwner = role?.toLowerCase() === "owner";

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
        className="p-0 border-0 shadow-none z-[9999] bg-transparent"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <motion.div
          ref={contentRef}
          style={{ backgroundColor: noteColor }}
          className="w-96 rounded-2xl backdrop-blur-md overflow-hidden shadow-2xl border border-black/10"
        >
          <div
            className={clsx(
              "px-6 py-4 border-b",
              isDarkBackground
                ? "border-white/10 bg-black/20"
                : "border-black/10 bg-white/30"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className={clsx(
                    "text-base font-bold tracking-tight",
                    isDarkBackground ? "text-white" : "text-black"
                  )}
                >
                  Team Access
                </h3>
                <p
                  className={clsx(
                    "text-xs mt-0.5",
                    isDarkBackground ? "text-white/60" : "text-black/60"
                  )}
                >
                  {collaborators.length}{" "}
                  {collaborators.length === 1 ? "member" : "members"}
                </p>
              </div>
              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "p-2 rounded-lg transition-colors",
                  isDarkBackground
                    ? "hover:bg-white/10 text-white/70 hover:text-white"
                    : "hover:bg-black/10 text-black/70 hover:text-black"
                )}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {isOwner && (
              <div className="relative">
                <div
                  className={clsx(
                    "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                    isDarkBackground ? "text-white/40" : "text-black/40"
                  )}
                >
                  <Search className="w-4 h-4" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add people by username..."
                  className={clsx(
                    "w-full pl-11 pr-11 py-3 rounded-xl border-2 outline-none transition-all text-sm font-medium",
                    isDarkBackground
                      ? "bg-white/5 border-white/10 text-white placeholder-white/40 focus:bg-white/10 focus:border-white/30"
                      : "bg-black/5 border-black/10 text-black placeholder-black/40 focus:bg-white focus:border-black/30"
                  )}
                />
                {isLoading && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <Loader2
                      className={clsx(
                        "w-4 h-4",
                        isDarkBackground ? "text-white/60" : "text-black/60"
                      )}
                    />
                  </motion.div>
                )}
              </div>
            )}

            <AnimatePresence mode="wait">
              {isOwner && searchUsers && searchUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <p
                    className={clsx(
                      "text-xs font-bold uppercase tracking-wider px-2",
                      isDarkBackground ? "text-white/50" : "text-black/50"
                    )}
                  >
                    Suggested
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {searchUsers.map((user, index) => {
                      const profileId = user.ProfileID;
                      const isAdding = addingUsers.has(profileId || "");

                      return (
                        <motion.div
                          key={profileId || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={clsx(
                            "flex items-center justify-between p-3 rounded-xl border transition-all duration-200 group",
                            isDarkBackground
                              ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                              : "bg-black/5 border-black/10 hover:bg-white hover:border-black/20"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="relative flex-shrink-0">
                              <Image
                                src={user.Avatar || "/default-avatar.png"}
                                alt={user.Username}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20"
                              />
                              <div
                                className={clsx(
                                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2",
                                  isDarkBackground
                                    ? "border-black/50"
                                    : "border-white"
                                )}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className={clsx(
                                  "text-sm font-semibold truncate",
                                  isDarkBackground ? "text-white" : "text-black"
                                )}
                              >
                                {user.Username}
                              </p>
                              <p
                                className={clsx(
                                  "text-xs",
                                  isDarkBackground
                                    ? "text-white/50"
                                    : "text-black/50"
                                )}
                              >
                                Not a member
                              </p>
                            </div>
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
                              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0 ml-3",
                              isAdding
                                ? isDarkBackground
                                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                                  : "bg-black/10 text-black/40 cursor-not-allowed"
                                : isDarkBackground
                                ? "bg-white text-black hover:bg-white/90"
                                : "bg-black text-white hover:bg-black/90"
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
                                Adding
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
                  </div>
                </motion.div>
              )}

              {collaborators && collaborators.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <p
                    className={clsx(
                      "text-xs font-bold uppercase tracking-wider px-2",
                      isDarkBackground ? "text-white/50" : "text-black/50"
                    )}
                  >
                    Members
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {collaborators.map((collaborator, index) => {
                      const isUpdating = updatingRoles.has(
                        collaborator.ProfileID || ""
                      );
                      const isCollaboratorOwner =
                        collaborator.Role.toLowerCase() === "owner";

                      console.log(
                        "Rendering collaborator:",
                        collaborator.Username,
                        "with role:",
                        collaborator.Role,
                        "isOwner:",
                        isOwner
                      );

                      return (
                        <motion.div
                          key={collaborator.Username}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={clsx(
                            "flex items-center justify-between p-3 rounded-xl border transition-all duration-200",
                            isDarkBackground
                              ? "bg-white/5 border-white/10"
                              : "bg-black/5 border-black/10"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Image
                              src={collaborator.Avatar || "/default-avatar.png"}
                              alt={collaborator.Username}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p
                                className={clsx(
                                  "text-sm font-semibold truncate",
                                  isDarkBackground ? "text-white" : "text-black"
                                )}
                              >
                                {collaborator.Username}
                              </p>
                              <span
                                className={clsx(
                                  "inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border mt-1",
                                  getRoleBadgeColor(collaborator.Role)
                                )}
                              >
                                {collaborator.Role.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {isOwner && !isCollaboratorOwner ? (
                            <Select
                              value={collaborator.Role}
                              onValueChange={(value: Role) =>
                                handleRoleChange(collaborator.Username, value)
                              }
                              disabled={isUpdating}
                            >
                              <SelectTrigger
                                className={clsx(
                                  "w-28 h-9 text-xs font-semibold border rounded-lg flex-shrink-0 ml-3",
                                  isDarkBackground
                                    ? "bg-white/5 border-white/10 text-white hover:bg-white/10 data-[state=open]:bg-white/10"
                                    : "bg-white border-black/10 text-black hover:bg-gray-50 data-[state=open]:bg-gray-50"
                                )}
                              >
                                {isUpdating ? (
                                  <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>

                              <SelectContent
                                className={clsx(
                                  "z-[99999] border rounded-lg shadow-xl",
                                  isDarkBackground
                                    ? "bg-zinc-900 border-white/10"
                                    : "bg-white border-black/10"
                                )}
                              >
                                <SelectItem
                                  value="editor"
                                  className={clsx(
                                    "text-xs font-medium cursor-pointer",
                                    isDarkBackground
                                      ? "text-white hover:bg-white/10 "
                                      : "text-black hover:bg-gray-100 "
                                  )}
                                >
                                  Editor
                                </SelectItem>
                                <SelectItem
                                  value="viewer"
                                  className={clsx(
                                    "text-xs font-medium cursor-pointer",
                                    isDarkBackground
                                      ? "text-white hover:bg-white/10 "
                                      : "text-black hover:bg-gray-100 "
                                  )}
                                >
                                  Viewer
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="w-28 flex-shrink-0 ml-3" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {!isLoading &&
                username &&
                searchUsers &&
                searchUsers.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={clsx(
                      "p-8 text-center rounded-xl border-2 border-dashed",
                      isDarkBackground
                        ? "bg-white/5 border-white/10"
                        : "bg-black/5 border-black/10"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center",
                        isDarkBackground
                          ? "bg-white/10"
                          : "bg-gradient-to-br from-gray-400 to-gray-600"
                      )}
                    >
                      <Search
                        className={clsx(
                          "w-5 h-5",
                          isDarkBackground ? "text-white/70" : "text-white"
                        )}
                      />
                    </div>
                    <p
                      className={clsx(
                        "text-sm font-semibold mb-1",
                        isDarkBackground ? "text-white" : "text-black"
                      )}
                    >
                      No users found
                    </p>
                    <p
                      className={clsx(
                        "text-xs",
                        isDarkBackground ? "text-white/50" : "text-black/50"
                      )}
                    >
                      Try searching with a different username
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
