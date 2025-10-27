import { clsx } from "clsx";
import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

interface AdaptiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  noteColor?: string;
  children: ReactNode;
  variant?: "default" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const AdaptiveButton = forwardRef<
  HTMLButtonElement,
  AdaptiveButtonProps
>(
  (
    {
      noteColor,
      children,
      variant = "default",
      size = "md",
      className,
      disabled = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDarkBackground = noteColor === "black";
    const isLightBackground = noteColor === "white";

    const sizeClasses = {
      sm: "p-1 text-xs",
      md: "p-1.5 text-sm",
      lg: "p-2 text-base",
    } as const;

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
        ref={ref}
        type={type}
        disabled={disabled}
        className={clsx(
          "inline-flex items-center justify-center gap-1 rounded-full",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          isDarkBackground && "focus-visible:ring-foreground/50",
          isLightBackground && "focus-visible:ring-background/50",
          !isDarkBackground &&
            !isLightBackground &&
            "focus-visible:ring-black/50",
          sizeClasses[size],
          getBaseClasses(),
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AdaptiveButton.displayName = "AdaptiveButton";
