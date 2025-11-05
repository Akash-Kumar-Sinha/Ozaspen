export const BACKEND_AUTH_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_AUTH_DOMAIN;
export const BACKEND_STICKYNOTES_DOMAIN =
  process.env.NEXT_PUBLIC_BACKEND_STICKYNOTES_DOMAIN;
export const WEBSOCKET_STICKYNOTES_DOMAIN =
  process.env.NEXT_PUBLIC_WEBSOCKET_STICKYNOTES_DOMAIN;

export const getCSSVariable = (variableName: string) => {
  if (typeof window !== "undefined") {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
  }
  return "";
};

export const foregroundColor = getCSSVariable("--foreground") || "#ffffff";
export const backgroundColorVar = getCSSVariable("--background") || "#000000";
export const mutedForegroundColor =
  getCSSVariable("--muted-foreground") || "#a1a1aa";
export const primaryColor = getCSSVariable("--primary") || "#9333ea";
export const cardColor = getCSSVariable("--card") || "#111111";
export const borderColor = getCSSVariable("--border") || "#27272a";
