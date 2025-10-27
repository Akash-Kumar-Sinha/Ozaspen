import React from "react";
import { Loader2, Check } from "lucide-react";

const Saving = ({
  isSaving,
  noteColor,
}: {
  isSaving: boolean;
  noteColor?: string;
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
            isDarkBackground
              ? "text-foreground"
              : isLightBackground
              ? "text-background"
              : "text-foreground"
          }`}
        />
      ) : (
        <Check
          className={`h-3.5 w-3.5 ${
            isDarkBackground
              ? "text-foreground"
              : isLightBackground
              ? "text-background"
              : "text-foreground"
          }`}
        />
      )}
    </div>
  );
};

export default Saving;
