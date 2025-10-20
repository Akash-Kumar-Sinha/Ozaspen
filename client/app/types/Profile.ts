import { GormModel } from "./types";

export interface Profile extends GormModel {
  Email: string;
  Username: string;
  FirstName: string;
  MiddleName?: string;
  LastName?: string;
  Avatar?: string;
}
