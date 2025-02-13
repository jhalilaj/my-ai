import mongoose, { Schema, Document } from "mongoose";

interface ITopic extends Document {
  userId: string;
  title: string;
  teachingStyle: "Simple" | "Intermediate" | "Advanced";
  totalLessons: number;
  completedLessons: number;
  averageScore: number;
  lessons: string[]; // Array of lesson IDs
}

const TopicSchema = new Schema<ITopic>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  teachingStyle: { type: String, enum: ["Simple", "Intermediate", "Advanced"], required: true },
  totalLessons: { type: Number, required: true },
  completedLessons: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  lessons: [{ type: String }], // List of lesson IDs
});

export default mongoose.models.Topic || mongoose.model<ITopic>("Topic", TopicSchema);
