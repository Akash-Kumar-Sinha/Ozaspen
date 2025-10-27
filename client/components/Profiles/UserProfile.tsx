"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_AUTH_DOMAIN } from "../../app/lib/constant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Forward, LogOut } from "lucide-react";
import { Profile } from "@/app/types/Profile";

const UserProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_AUTH_DOMAIN}/me`, {
          withCredentials: true,
        });
        setProfile(data.profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    if (!profile) {
      fetchUserProfile();
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BACKEND_AUTH_DOMAIN}/logout`,
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
    console.log("Share profile clicked");
  };

  if (!profile) {
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
          src={profile.Avatar || "/default-avatar.png"}
          alt={profile.FirstName}
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
            {profile.Avatar && profile.Avatar.trim() !== "" ? (
              <Image
                src={profile.Avatar}
                alt={profile.FirstName}
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
                  profile.Avatar && profile.Avatar.trim() !== ""
                    ? "none"
                    : "flex",
              }}
            >
              <span className="text-primary-foreground text-lg font-medium">
                {profile.FirstName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile.FirstName || "Unknown User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                @{profile.Username}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile.Email}
              </p>
            </div>
            <div>
              <button
                onClick={handleShareProfile}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/20 rounded-full p-1.5 transition-all duration-200"
              >
                <Forward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </DropdownMenuLabel>

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
