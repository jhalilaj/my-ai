import mongoose, { Schema, Document } from "mongoose";

interface ITopic extends Document {
  userId: string;
  title: string;
  teachingStyle: "Simple" | "Intermediate" | "Advanced";
  totalLessons: number;
  completedLessons: number;
  averageScore: number;
  lessons: string[];
  fileIds?: string[]; 
  aiModel: "gpt" | "llama" | "gemini" | "deepseek";
}

const TopicSchema = new Schema<ITopic>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  teachingStyle: { type: String, enum: ["Simple", "Intermediate", "Advanced"], required: true },
  totalLessons: { type: Number, required: true },
  completedLessons: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  lessons: [{ type: String }],
  fileIds: [{ type: String }],
  aiModel: { type: String, enum: ["gpt", "llama", "gemini", "deepseek"], default: "gpt" }, 
});

export default mongoose.models.Topic || mongoose.model<ITopic>("Topic", TopicSchema);
