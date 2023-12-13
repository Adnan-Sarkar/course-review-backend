import { Types } from "mongoose";

export interface TTags {
  name: string;
  isDeleted: boolean;
}

export interface TDetails {
  level: string;
  description: string;
}

export interface TCourse {
  title: string;
  instructor: string;
  categoryId: Types.ObjectId;
  price: number;
  tags: TTags[];
  startDate: string;
  endDate: string;
  language: string;
  provider: string;
  durationInWeeks: number;
  details: TDetails;
  __v?: number;
}
