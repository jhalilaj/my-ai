import mongoose, { Schema, Document } from "mongoose";

interface ITest extends Document {
  lessonId: mongoose.Schema.Types.ObjectId;
  questions: { question: string; options: string[] }[];
  correctAnswers: number[];
  userAnswers?: number[];
  score?: number;
  createdAt: Date;
}

// ✅ Ensure there is only ONE schema definition
const TestSchema = new Schema<ITest>({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
  questions: [
    {
      question: { type: String, required: true },
      options: { type: [String], required: true },
    },
  ],
  correctAnswers: { type: [Number], required: true },
  userAnswers: { type: [Number], default: [] },
  score: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Test || mongoose.model<ITest>("Test", TestSchema);
