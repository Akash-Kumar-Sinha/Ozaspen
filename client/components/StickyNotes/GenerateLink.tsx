import { useState, useRef, useEffect, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AdaptiveButton } from "../Button/AdaptiveButton";
import {
  Forward,
  Copy,
  Check,
  Globe,
  Lock,
  RefreshCw,
  ExternalLink,
  Trash2,
  ShieldOff,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";
import { BACKEND_STICKYNOTES_DOMAIN } from "@/app/lib/constant";
import gsap from "gsap";
import { Access, Role } from "@/app/types/StickyNotesTypes";

interface ShareLinkResponse {
  Link: string;
  Access: Access;
  Revoked: boolean;
  Success: boolean;
}

interface AccessResponse {
  Message: string;
  Success: boolean;
  Access: Access;
}

interface RevokeResponse {
  Success: boolean;
  Revoked: boolean;
}

interface DeleteResponse {
  Success: boolean;
}

const GenerateLink = ({
  NoteColors,
  ID,
  role,
}: {
  NoteColors: string;
  ID: string;
  role: Role;
}) => {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [access, setAccess] = useState<Access>("private");
  const [isRevoked, setIsRevoked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChangingAccess, setIsChangingAccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const copyButtonRef = useRef<HTMLButtonElement>(null);

  const fetchLinkStatus = useCallback(async () => {
    try {
      const response = await axios.get<ShareLinkResponse>(
        `${BACKEND_STICKYNOTES_DOMAIN}/get_share_link/${ID}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.Success && response.data.Link) {
        setShareLink(response.data.Link);
        setAccess(response.data.Access);
        setIsRevoked(response.data.Revoked || false);
      }
    } catch (error) {
      console.error("Failed to fetch share link status:", error);
    }
  }, [ID]);

  useEffect(() => {
    if (isOpen) {
      fetchLinkStatus();
    }
  }, [fetchLinkStatus, isOpen]);

  const generate = async () => {
    try {
      setIsGenerating(true);
      const response = await axios.put<ShareLinkResponse>(
        `${BACKEND_STICKYNOTES_DOMAIN}/generate_share_link/${ID}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.Success) {
        setShareLink(response.data.Link);
        setAccess(response.data.Access);
        setIsRevoked(response.data.Revoked || false);
      }
    } catch (error) {
      console.error("Failed to generate share link:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const changeAccess = async () => {
    try {
      setIsChangingAccess(true);
      const response = await axios.put<AccessResponse>(
        `${BACKEND_STICKYNOTES_DOMAIN}/change_access/${ID}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.Success) {
        setAccess(response.data.Access);
      }
    } catch (error) {
      console.error("Failed to change access:", error);
    } finally {
      setIsChangingAccess(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setIsCopied(true);

      if (copyButtonRef.current) {
        gsap.fromTo(
          copyButtonRef.current,
          { scale: 1 },
          {
            scale: 1.1,
            duration: 0.15,
            ease: "back.out(3)",
            yoyo: true,
            repeat: 1,
          }
        );
      }

      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const toggleRevoke = async () => {
    try {
      setIsRevoking(true);
      const response = await axios.put<RevokeResponse>(
        `${BACKEND_STICKYNOTES_DOMAIN}/revoke_share_link/${ID}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.Success) {
        setIsRevoked(response.data.Revoked);
      }
    } catch (error) {
      console.error("Failed to toggle revoke:", error);
    } finally {
      setIsRevoking(false);
    }
  };

  const deleteLink = async () => {
    try {
      setIsDeleting(true);
      const response = await axios.delete<DeleteResponse>(
        `${BACKEND_STICKYNOTES_DOMAIN}/delete_sticky_note_link/${ID}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.Success) {
        setShareLink(null);
        setShowDeleteDialog(false);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to delete share link:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openInNewTab = () => {
    if (shareLink) {
      window.open(shareLink, "_blank");
    }
  };

  const ActionButton = ({
    onClick,
    disabled,
    variant = "default",
    children,
  }: {
    onClick: () => void;
    disabled?: boolean;
    variant?: "default" | "revoke" | "restore" | "delete";
    children: React.ReactNode;
  }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    const getVariantStyles = () => {
      switch (variant) {
        case "revoke":
          return " text-orange-600  ";
        case "restore":
          return " text-green-600  ";
        case "delete":
          return " text-red-600  ";
        default:
          return " text-primary  ";
      }
    };

    return (
      <button
        ref={buttonRef}
        onClick={onClick}
        disabled={disabled}
        className={`
          p-2 rounded-lg w-fit
          hover:scale-110 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          ${getVariantStyles()}
        `}
      >
        {children}
      </button>
    );
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <AdaptiveButton
            noteColor={NoteColors}
            aria-label="Share note"
            className="h-7 w-7"
          >
            <Forward className="w-3.5 h-3.5" />
          </AdaptiveButton>
        </AlertDialogTrigger>
        <AlertDialogContent className="z-[9999] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Forward className="h-5 w-5 text-primary" />
              Share Sticky Note
            </AlertDialogTitle>
            <AlertDialogDescription className="flex gap-2 items-center">
              <span className="">
                Generate a shareable link and control access permissions.
              </span>
              {shareLink && role.toLowerCase() === "owner" && (
                <div className="flex items-center gap-2">
                  {isRevoked ? (
                    <ActionButton
                      onClick={toggleRevoke}
                      disabled={isRevoking}
                      variant="restore"
                    >
                      {isRevoking ? <RefreshCw /> : <ShieldCheck />}
                    </ActionButton>
                  ) : (
                    <ActionButton
                      onClick={toggleRevoke}
                      disabled={isRevoking}
                      variant="revoke"
                    >
                      {isRevoking ? <RefreshCw /> : <ShieldOff />}
                    </ActionButton>
                  )}
                  <ActionButton
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isDeleting}
                    variant="delete"
                  >
                    <Trash2 />
                  </ActionButton>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {!shareLink ? (
              <div className="text-center py-6">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Forward className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-2">
                  Create a Share Link
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Share this note securely with others
                </p>
                <button
                  onClick={generate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Forward className="h-4 w-4" />
                      Generate Link
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2">
                    {access === "public" ? (
                      <Globe className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-orange-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {access === "public" ? "Public" : "Private"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {access === "public"
                          ? "Anyone can view"
                          : "Invite only"}
                      </p>
                    </div>
                  </div>
                  {role.toLowerCase() === "owner" && (
                    <button
                      onClick={changeAccess}
                      disabled={isChangingAccess}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isChangingAccess ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : access === "public" ? (
                        "Make Private"
                      ) : (
                        "Make Public"
                      )}
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Share Link</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="w-full px-3 py-2 pr-9 rounded-lg text-sm font-mono bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary truncate"
                      />
                      <button
                        onClick={openInNewTab}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-background/50 rounded transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <button
                      ref={copyButtonRef}
                      onClick={copyToClipboard}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary ${
                        isCopied
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "hover:bg-muted border-border"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {isRevoked && (
                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <p className="text-xs text-orange-800">
                      <strong>Access Revoked:</strong> This link is currently
                      disabled. Click Restore to re-enable it.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="z-[10000] max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 " />
              Delete Share Link?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the share link. Anyone with the link
              will no longer be able to access this note. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteLink} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Link"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GenerateLink;
