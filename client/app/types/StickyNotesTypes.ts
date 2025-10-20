import { Profile } from "./Profile";
import { GormModel } from "./types";

export interface StickyNoteTypes extends GormModel {
    Owner: Profile;
    NoteColors: string;
}
