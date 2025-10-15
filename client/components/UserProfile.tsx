"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_DOMAIN } from "../app/lib/constant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { LogOut } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

const UserProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_DOMAIN}/me`, {
          withCredentials: true,
        });
        console.log("User profile data:", data.user);
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    if (!user) {
      fetchUserProfile();
    }
    console.log(user);
  }, [user]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BACKEND_DOMAIN}/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleShareProfile = () => {
    // UI placeholder for share functionality
    console.log("Share profile clicked");
  };

  console.log("User avatar:", user?.avatar);

  if (!user) {
    return (
      <div className="relative p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-3 bg-primary/20 rounded animate-pulse mb-1"></div>
            <div className="h-2 bg-primary/10 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Image
          src={user.avatar}
          alt={user.name || "User avatar"}
          width={48}
          height={48}
          className="rounded-full border border-border object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 bg-popover border-border z-[9999]"
        align="start"
        side="top"
        sideOffset={4}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 p-2">
            {user.avatar && user.avatar.trim() !== "" ? (
              <Image
                src={user.avatar}
                alt={user.name || "User avatar"}
                width={40}
                height={40}
                className="rounded-full border border-border object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="w-10 h-10 bg-primary rounded-full border border-border flex items-center justify-center"
              style={{
                display:
                  user.avatar && user.avatar.trim() !== "" ? "none" : "flex",
              }}
            >
              <span className="text-primary-foreground text-lg font-medium">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.name || "Unknown User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email || "No email"}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          onClick={handleShareProfile}
          className="flex items-center gap-3 cursor-pointer focus:bg-accent focus:text-accent-foreground"
        >
          <svg
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            />
          </svg>
          <span className="text-foreground">Share Profile</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-3 cursor-pointer focus:bg-destructive/10 focus:text-destructive text-destructive"
        >
          <LogOut />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
