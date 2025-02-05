import mongoose from 'mongoose';

const TestResultSchema = new mongoose.Schema({
    userId: { type: String, required: true },     // ID to track which user took the test
    lessonId: { type: String, required: true },   // Lesson associated with the test
    score: { type: Number, required: true },      // User's score
    timestamp: { type: Date, default: Date.now }, // When the test was taken
});

export default mongoose.models.TestResult || mongoose.model('TestResult', TestResultSchema);
