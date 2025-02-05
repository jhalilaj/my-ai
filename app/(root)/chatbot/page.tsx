"use client";

import React, { useState } from "react";
import ChatBox from "@/components/ChatBox";

const lessons = ["Lesson 1", "Lesson 2", "Lesson 3"];

const ChatPage: React.FC = () => {
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [selectedLesson, setSelectedLesson] = useState("lesson1");

    const handleNext = () => {
        setCurrentLessonIndex((prevIndex) => (prevIndex + 1) % lessons.length);
    };

    const handlePrevious = () => {
        setCurrentLessonIndex((prevIndex) =>
            prevIndex === 0 ? lessons.length - 1 : prevIndex - 1
        );
    };

    const handleLessonClick = () => {
        setSelectedLesson(`lesson${currentLessonIndex + 1}`);
    };

    return (
        <div className="min-h-screen bg-customDark text-white flex">
            {/* Chat Section */}
            <ChatBox lessonId={selectedLesson} />

            {/* Right Section */}
            <div className="w-[400px] bg-customGray shadow-lg border-l border-gray-700 flex flex-col p-4">
                <div className="flex flex-col items-center mb-6">
                    <div className="font-bold text-lg mb-2">Your Progress:</div>
                    <div className="w-full h-24 bg-customDark border border-gray-700 rounded-lg"></div>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <div className="font-bold text-lg mb-2">Lesson Part:</div>
                    <div className="text-2xl font-bold text-greenAccent underline">3/5</div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                        onClick={handlePrevious}
                        className="px-4 py-2 bg-greenAccent text-black font-bold rounded-md hover:bg-green-400 transition"
                    >
                        &#8249;
                    </button>

                    <button
                        onClick={handleLessonClick}
                        className={`px-8 py-4 rounded-md font-bold transition ${
                            selectedLesson === `lesson${currentLessonIndex + 1}`
                                ? "bg-white text-black"
                                : "bg-greenAccent text-black hover:border-2 hover:border-black"
                        }`}
                    >
                        {lessons[currentLessonIndex]}
                    </button>

                    <button
                        onClick={handleNext}
                        className="px-4 py-2 bg-greenAccent text-black font-bold rounded-md hover:bg-green-400 transition"
                    >
                        &#8250;
                    </button>
                </div>

                <button className="w-full py-3 bg-greenAccent text-black font-bold rounded-md shadow-md hover:bg-green-400 transition">
                    Take A Test
                </button>
            </div>
        </div>
    );
};

export default ChatPage;
