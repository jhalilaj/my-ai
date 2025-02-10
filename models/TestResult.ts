import mongoose from 'mongoose';

const TestResultSchema = new mongoose.Schema({
    lessonId: { type: String, required: true },
    userId: { type: String, required: true },
    answers: { type: Object, required: true },
    score: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
});

export default mongoose.models.TestResult || mongoose.model('TestResult', TestResultSchema);
