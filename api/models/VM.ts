import mongoose, { Schema, Document } from 'mongoose';

export interface IVM extends Document {
  name: string;
  ip: string;
  username: string;
  password?: string;
  port: number;
  environmentId?: string; // We'll store the Environment ID as a string or ObjectId
}

const VMSchema: Schema = new Schema({
  name: { type: String, required: true },
  ip: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String },
  port: { type: Number, default: 22 },
  environmentId: { type: String }, // Storing as string to match existing frontend logic, or could be ObjectId ref
});

export const VMModel = mongoose.model<IVM>('VM', VMSchema);
