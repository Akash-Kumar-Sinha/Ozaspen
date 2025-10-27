import { WifiIcon } from "lucide-react";
import Saving from "./Saving";

export const ConnectionStatus = ({
  color,
  autoSave = false,
  noteColor,
}: {
  color: "red" | "green";
  autoSave: boolean;
  noteColor?: string;
}) => {
  const colorClass = color === "green" ? "text-green-500" : "text-red-500";
  const isDarkBackground = noteColor === "black";
  const isLightBackground = noteColor === "white";

  return (
    <div
      className={`flex items-center justify-center rounded-full p-1 transition-all duration-200 ${
        isDarkBackground
          ? "text-foreground/70 hover:text-foreground hover:bg-foreground/20"
          : isLightBackground
          ? "text-background/70 hover:text-background hover:bg-background/20"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
      }`}
    >
      {autoSave ? (
        <Saving isSaving={true} noteColor={noteColor} />
      ) : (
        <WifiIcon className={`w-3.5 h-3.5 ${colorClass}`} />
      )}
    </div>
  );
};
