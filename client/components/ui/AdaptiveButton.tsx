import { clsx } from "clsx";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface AdaptiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  noteColor?: string;
  children: ReactNode;
  variant?: "default" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const AdaptiveButton = ({
  noteColor,
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}: AdaptiveButtonProps) => {
  const isDarkBackground = noteColor === "black";
  const isLightBackground = noteColor === "white";

  const sizeClasses = {
    sm: "p-1 text-xs",
    md: "p-1.5",
    lg: "p-2",
  };

  const getBaseClasses = () => {
    if (isDarkBackground) {
      return variant === "destructive"
        ? "text-foreground/70 hover:text-destructive hover:bg-foreground/20"
        : "text-foreground/70 hover:text-foreground hover:bg-foreground/20";
    }

    if (isLightBackground) {
      return variant === "destructive"
        ? "text-background/70 hover:text-destructive hover:bg-background/20"
        : "text-background/70 hover:text-background hover:bg-background/20";
    }

    return variant === "destructive"
      ? "text-black/70 hover:text-destructive hover:bg-black/20"
      : "text-black/70 hover:text-black hover:bg-black/20";
  };

  return (
    <button
      className={clsx(
        "flex gap-1 items-center rounded-full transition-all duration-200",
        sizeClasses[size],
        getBaseClasses(),
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
