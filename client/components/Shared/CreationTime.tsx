import React from "react";

const CreationTime = ({
  CreatedAt,
  noteColor,
}: {
  CreatedAt: string;
  noteColor?: string;
}) => {
  const isDarkBackground = noteColor === "black";
  const isLightBackground = noteColor === "white";
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const created = new Date(CreatedAt);
  const now = new Date();

  const formattedDateTime = created.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: created.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    hour: "2-digit",
    minute: "2-digit",
    timeZone: browserTimeZone,
  });

  return (
    <span
      className={`text-xs font-medium ${
        isDarkBackground
          ? "text-foreground/60"
          : isLightBackground
          ? "text-background/60"
          : "text-muted"
      }`}
    >
      {formattedDateTime}
    </span>
  );
};

export default CreationTime;
