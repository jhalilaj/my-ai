"use client"; // ✅ Add this line

import React, { useState } from "react";
import ChatBox from "@/components/ChatBox"; // Import the ChatBox component

const ChatPage: React.FC = () => {
    const [lessonId, setLessonId] = useState("lesson1"); // ✅ Track selected lesson

    return (
        <div className="min-h-screen bg-customDark text-white flex">
            {/* Chat Section */}
            <ChatBox lessonId={lessonId} /> {/* ✅ Pass lessonId to ChatBox */}

            {/* Right Section */}
            <div className="w-[400px] bg-customGray shadow-lg border-l border-gray-700 flex flex-col p-4">
                {/* Progress Section */}
                <div className="flex flex-col items-center mb-6">
                    <div className="font-bold text-lg mb-2">Your Progress:</div>
                    <div className="w-full h-24 bg-customDark border border-gray-700 rounded-lg"></div>
                </div>

                {/* Lesson Part Section */}
                <div className="flex flex-col items-center mb-6">
                    <div className="font-bold text-lg mb-2">Lesson Part:</div>
                    <div className="text-2xl font-bold text-greenAccent underline">3/5</div>
                </div>

                {/* Lesson Selection Buttons */}
                <div className="flex flex-col gap-4">
                    <button 
                        className={`w-full py-2 rounded-lg shadow-md font-bold ${lessonId === "lesson1" ? "bg-blue-600 text-white" : "bg-blue-500 hover:bg-blue-400"}`} 
                        onClick={() => setLessonId("lesson1")}
                    >
                        Lesson A
                    </button>
                    <button 
                        className={`w-full py-2 rounded-lg shadow-md font-bold ${lessonId === "lesson2" ? "bg-blue-600 text-white" : "bg-blue-500 hover:bg-blue-400"}`} 
                        onClick={() => setLessonId("lesson2")}
                    >
                        Lesson B
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
