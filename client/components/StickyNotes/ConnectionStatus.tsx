import Saving from "../Shared/Saving";
import { AdaptiveButton } from "../Button/AdaptiveButton";

export const ConnectionStatus = ({
  color,
  noteColor,
  onClick,
  isSaving,
}: {
  color: "red" | "green";
  noteColor?: string;
  onClick?: () => void;
  isSaving: boolean;
}) => {
  const colorClass = color === "green" ? "text-green-800" : "text-red-800";
  return (
    <AdaptiveButton
      onClick={onClick}
      noteColor={noteColor}
      disabled={isSaving}
      title="Manual save"
      className={`h-7 w-7 `}
    >
      <Saving
        isSaving={isSaving}
        noteColor={noteColor}
        className={`${colorClass}`}
      />
    </AdaptiveButton>
  );
};
