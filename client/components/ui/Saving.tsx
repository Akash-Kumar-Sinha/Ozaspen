import React from "react";
import { Loader2, Check } from "lucide-react";

const Saving = ({ isSaving }: { isSaving: boolean }) => {
  return (
    <div className="flex items-center justify-center text-background/70 hover:text-foreground hover:bg-muted/20 rounded-md p-1 transition-all duration-200">
      {isSaving ? (
        <Loader2 className="animate-spin h-3.5 w-3.5 text-black" />
      ) : (
        <Check className="h-3.5 w-3.5 text-black" />
      )}
    </div>
  );
};

export default Saving;
