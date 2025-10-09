export const colorMap = {
  yellow: "#facc15",
  green: "#4ade80",
  orange: "#fb923c",
  purple: "#a855f7",
  indigo: "#6366f1",
  blue: "#3b82f6",
  red: "#ef4444",
  pink: "#ec4899",
} as const;

export type NoteColor = keyof typeof colorMap;
