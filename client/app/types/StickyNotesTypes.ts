import { Block } from "@blocknote/core";
import { Profile } from "./Profile";
import { GormModel } from "./types";

export type Role = "owner" | "editor" | "viewer";
export type Access = "public" | "private";

export interface Change {
  Who: string;
  What: string;
  When: string;
}

export interface EditorContent extends GormModel {
  Changes: Array<{
    Who: string;
    What: string;
    When: string;
  }>;
  Blocks: Block[];
}

export interface ShareLink extends GormModel {
  Token: string;
  Access: Access;
  Revoked: boolean;
}

export interface Collaborator extends GormModel {
  StickyNoteID: string;
  StickyNote?: StickyNoteTypes;
  ProfileID: string;
  Profile: Profile;
  Role: Role;
}

export interface StickyNoteTypes extends GormModel {
  OwnerID: string;
  Owner?: Profile;
  Title: string;
  NoteColors: string;
  ContentID?: string;
  Content?: EditorContent;
  ShareLinkID?: string;
  ShareLink?: ShareLink;
}

export interface LoadingErrorTypes {
  isLoading: boolean;
  error: string | null;
}
