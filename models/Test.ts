import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
    questionText: String,
    type: String, // MCQ, TrueFalse, Coding
    options: [String],
    correctAnswer: String,
});

const TestSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    lessonId: { type: String, required: true },
    questions: [QuestionSchema],
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Test || mongoose.model('Test', TestSchema);
