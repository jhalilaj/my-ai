import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
  lessonNumber: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  completed: { type: Boolean, default: false },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", default: null },
});

export default mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);
