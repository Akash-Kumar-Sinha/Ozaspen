export interface GormModel {
  ID: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string;
}

export const colorMap = {
  yellow: "#fef08a",
  pink: "#fbcfe8",
  mint: "#bbf7d0",
  lavender: "#e9d5ff",
  sky: "#bfdbfe",
  peach: "#fed7aa",
  coral: "#fecaca",
  black: "#000000",
  white: "#ffffff",
} as const;

export type NoteColor = keyof typeof colorMap;
