import { Document, Model, Schema } from "mongoose";

export interface ILevels {
  discordId: string;
  xp: number;
  level: number;
}

export interface ILevelsSchema extends ILevels, Document {}

export interface LevelsModel extends Model<ILevelsSchema> {}

export const LevelsSchema = new Schema({
  discordId: {
    type: String,
  },
  xp: {
    type: Number,
  },
  level: {
    type: Number,
  },
});
export default LevelsSchema;
