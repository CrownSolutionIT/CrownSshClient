import mongoose, { Schema, Document } from 'mongoose';

export interface IEnvironment extends Document {
  name: string;
  command?: string;
}

const EnvironmentSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  command: { type: String },
});

// Use 'Environment' as the model name
export const Environment = mongoose.model<IEnvironment>('Environment', EnvironmentSchema);
