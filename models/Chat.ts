import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Identify the user
    lessonId: { type: String, required: true }, // ✅ Track lesson-specific chats
    messages: [
        {
            role: { type: String, enum: ["user", "assistant"], required: true },
            content: { type: String, required: true },
        },
    ],
}, { timestamps: true });

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
