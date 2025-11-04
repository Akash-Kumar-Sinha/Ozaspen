import {
  backgroundColorVar,
  cardColor,
  foregroundColor,
  mutedForegroundColor,
  primaryColor,
  borderColor,
} from "@/app/lib/constant";
import { colorMap } from "@/app/types/types";
import { useMemo } from "react";

export const useCustomTheme = (NoteColors: string) => {
  return useMemo(() => {
    const backgroundColor = colorMap[NoteColors as keyof typeof colorMap];
    const isDarkBackground = NoteColors === "black";
    const isLightBackground = NoteColors === "white";

    return {
      colors: {
        editor: {
          text: isDarkBackground
            ? foregroundColor
            : isLightBackground
            ? backgroundColorVar
            : "#000000",
          background: backgroundColor,
        },
        menu: {
          text: foregroundColor,
          background: cardColor,
        },
        tooltip: {
          text: foregroundColor,
          background: cardColor,
        },
        hovered: {
          text: foregroundColor,
          background: primaryColor,
        },
        selected: {
          text: "#000000",
          background: isDarkBackground
            ? "rgba(147, 51, 234, 0.2)"
            : "rgba(255, 255, 255, 0.2)",
        },
        disabled: {
          text: mutedForegroundColor,
          background: isDarkBackground
            ? "rgba(0, 0, 0, 0.05)"
            : "rgba(255, 255, 255, 0.05)",
        },
        shadow: isDarkBackground
          ? "rgba(147, 51, 234, 0.2)"
          : "rgba(0, 0, 0, 0.1)",
        border: borderColor,
        sideMenu: isDarkBackground ? "#e4e4e7" : cardColor,
        highlightColors: {
          gray: { text: "#000000", background: "#e4e4e7" },
          brown: { text: "#000000", background: "#d4a574" },
          red: { text: "#000000", background: "#fca5a5" },
          orange: { text: "#000000", background: "#fdba74" },
          yellow: { text: "#000000", background: "#fde047" },
          green: { text: "#000000", background: "#86efac" },
          blue: { text: "#000000", background: "#93c5fd" },
          purple: { text: "#000000", background: "#c4b5fd" },
          pink: { text: "#000000", background: "#f9a8d4" },
          black: { text: foregroundColor, background: cardColor },
          white: { text: "#000000", background: "#f8f8f8" },
        },
      },
      borderRadius: 4,
      fontFamily: "Inter, sans-serif",
    };
  }, [NoteColors]);
};
