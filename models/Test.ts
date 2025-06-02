import mongoose, { Schema, Document } from "mongoose";

interface Question {
  type: "mcq" | "theory" | "practical";
  question: string;
  options?: string[];      
  correctAnswer: string;        
}

interface Feedback {
  index: number;
  type: "theory" | "practical";
  question: string;
  feedback: string;
  score: number;
}

export interface ITest extends Document {
  lessonId: mongoose.Schema.Types.ObjectId;
  questions: Question[];
  correctAnswers: (number | null)[];
  userAnswers?: (number | string)[];
  score?: number;
  percentage?: number;
  feedback?: Feedback[];
  createdAt: Date;
}

const QuestionSchema = new Schema<Question>({
  type: { type: String, enum: ["mcq", "theory", "practical"], required: true },
  question: { type: String, required: true },
  options: [String],
  correctAnswer: { type: String, required: true },
});

const FeedbackSchema = new Schema<Feedback>({
  index: Number,
  type: { type: String, enum: ["theory", "practical"] },
  question: String,
  feedback: String,
  score: Number,
});

const TestSchema = new Schema<ITest>({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
  questions: [QuestionSchema],
  correctAnswers: [Schema.Types.Mixed],
  userAnswers: [Schema.Types.Mixed],  
  score: { type: Number, default: null },
  percentage: { type: Number, default: null },
  feedback: [FeedbackSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Test || mongoose.model<ITest>("Test", TestSchema);
