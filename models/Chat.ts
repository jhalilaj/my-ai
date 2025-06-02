import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    lessonId: { type: String, required: true },
    messages: [
        {
            role: { type: String, enum: ["user", "assistant"], required: true },
            content: { type: String, required: true },
        },
    ],
}, { timestamps: true });

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
