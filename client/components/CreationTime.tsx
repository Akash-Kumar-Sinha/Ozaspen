import React from "react";

const CreationTime = ({ CreatedAt }: { CreatedAt: string }) => {
  return (
    <span className="text-xs text-muted font-medium">
      {(() => {
        const now = new Date();
        const created = new Date(CreatedAt);
        const diffMs = now.getTime() - created.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffDays > 7) {
          return created.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year:
              created.getFullYear() !== now.getFullYear()
                ? "numeric"
                : undefined,
          });
        } else if (diffDays > 0) {
          return `${diffDays}d ago`;
        } else if (diffHours > 0) {
          return `${diffHours}h ago`;
        } else if (diffMinutes > 0) {
          return `${diffMinutes}m ago`;
        } else {
          return "Just now";
        }
      })()}
    </span>
  );
};

export default CreationTime;
