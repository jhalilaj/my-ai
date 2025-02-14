import mongoose, { Schema, Document } from "mongoose";

interface ITestResult extends Document {
  userId: string;
  lessonId: mongoose.Schema.Types.ObjectId;
  testId: mongoose.Schema.Types.ObjectId;
  userAnswers: string[];
  score: number;
  percentage: number;
  createdAt: Date;
}

const TestResultSchema = new Schema<ITestResult>({
  userId: { type: String, required: true }, // Store user email
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  userAnswers: { type: [String], required: true },
  score: { type: Number, required: true },
  percentage: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.TestResult || mongoose.model<ITestResult>("TestResult", TestResultSchema);
