import { clsx } from "clsx";
import {
  ButtonHTMLAttributes,
  forwardRef,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import gsap from "gsap";

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
      onClick,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const buttonRef =
      (ref as React.RefObject<HTMLButtonElement>) || internalRef;

    const isDarkBackground = noteColor === "black";
    const isLightBackground = noteColor === "white";

    const sizeClasses = {
      sm: "p-1 text-xs",
      md: "p-1.5 text-sm",
      lg: "p-2 text-base",
    } as const;

    const getCSSVariable = (variableName: string) => {
      if (typeof window !== "undefined") {
        return getComputedStyle(document.documentElement)
          .getPropertyValue(variableName)
          .trim();
      }
      return "";
    };

    const primaryColor = getCSSVariable("--primary") || "#9333ea";
    const destructiveColor = getCSSVariable("--destructive") || "#ef4444";

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

    const handleMouseEnter = () => {
      if (buttonRef.current && !disabled) {
        const glowColor =
          variant === "destructive" ? destructiveColor : primaryColor;

        gsap.to(buttonRef.current, {
          scale: 1.1,
          boxShadow: `0 0 15px ${glowColor}55`,
          duration: 0.3,
          ease: "power2.out",
        });

        const icon = buttonRef.current.querySelector("svg");
        if (icon) {
          gsap.to(icon, {
            rotate: variant === "destructive" ? 90 : 0,
            scale: 1.1,
            duration: 0.3,
            ease: "back.out(2)",
          });
        }
      }
    };

    const handleMouseLeave = () => {
      if (buttonRef.current && !disabled) {
        gsap.to(buttonRef.current, {
          scale: 1,
          boxShadow: "0 0 0 rgba(0,0,0,0)",
          duration: 0.3,
          ease: "power2.out",
        });

        const icon = buttonRef.current.querySelector("svg");
        if (icon) {
          gsap.to(icon, {
            rotate: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (buttonRef.current && !disabled) {
        gsap.to(buttonRef.current, {
          scale: 0.95,
          duration: 0.1,
          ease: "power2.in",
          onComplete: () => {
            gsap.to(buttonRef.current, {
              scale: 1.05,
              duration: 0.2,
              ease: "power2.out",
              onComplete: () => {
                gsap.to(buttonRef.current, {
                  scale: 1,
                  duration: 0.2,
                  ease: "power2.out",
                });
              },
            });
          },
        });

        if (variant === "destructive") {
          const icon = buttonRef.current.querySelector("svg");
          if (icon) {
            gsap.to(icon, {
              rotate: 180,
              scale: 1.2,
              duration: 0.3,
              ease: "back.out(3)",
              onComplete: () => {
                gsap.to(icon, {
                  rotate: 0,
                  scale: 1,
                  duration: 0.3,
                  ease: "power2.out",
                });
              },
            });
          }
        }
      }

      if (onClick) {
        onClick(e);
      }
    };

    return (
      <button
        ref={buttonRef}
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
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AdaptiveButton.displayName = "AdaptiveButton";
