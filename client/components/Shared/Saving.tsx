import React from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Saving = ({
  isSaving,
  noteColor,
  className,
}: {
  isSaving: boolean;
  noteColor?: string;
  className?: string;
}) => {
  const isDarkBackground = noteColor === "black";
  const isLightBackground = noteColor === "white";

  return (
    <div
      className={`flex items-center justify-center rounded-full transition-all duration-200 ${
        isDarkBackground
          ? "text-foreground/70 hover:text-foreground"
          : isLightBackground
          ? "text-background/70 hover:text-background"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {isSaving ? (
        <Loader2
          className={`animate-spin h-3.5 w-3.5 ${
            isDarkBackground ? "text-foreground" : "text-background"
          }`}
        />
      ) : (
        <Check
          className={cn(
            "h-3.5 w-3.5",
            isDarkBackground ? "text-foreground" : "text-background",
            className
          )}
        />
      )}
    </div>
  );
};

export default Saving;
