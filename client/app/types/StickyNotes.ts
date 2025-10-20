import { Profile } from "./Profile";
import { GormModel } from "./types";

export interface StickyNote extends GormModel {
    Owner: Profile;
    NoteColors: string;
}
