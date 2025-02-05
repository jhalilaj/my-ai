"use client";

import React, { useState } from "react";
import ChatBox from "@/components/ChatBox";

interface Question {
    id?: number;
    type: "MCQ" | "TrueFalse" | "Coding";
    questionText: string;
    options?: string[];
    correctAnswer: string;
}

interface Test {
    lessonId: string;
    userId: string;
    questions: Question[];
}

const lessons = ["Lesson 1", "Lesson 2", "Lesson 3"];

const ChatPage: React.FC = () => {
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [selectedLesson, setSelectedLesson] = useState("lesson1");
    const [isGenerating, setIsGenerating] = useState(false);
    const [test, setTest] = useState<Test | null>(null);
    const [activeTab, setActiveTab] = useState<"Lesson" | "Test">("Lesson");

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
        setActiveTab("Lesson");
    };

    const handleGenerateTest = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch("/api/tests/generateTest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lessonId: selectedLesson,
                    userId: "jhalilaj@york.citycollege.eu",
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            setTest(data.test);
            setActiveTab("Test"); // Switch to Test tab after generation
        } catch (error) {
            console.error("Error generating test:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-customDark text-white flex">
            {/* Chat Section */}
            <div className="flex flex-col w-full">
                <div className="flex gap-4 border-b-2 border-gray-700 p-4 bg-customGray">
                    <button
                        className={`px-4 py-2 font-bold ${
                            activeTab === "Lesson"
                                ? "border-b-4 border-greenAccent text-greenAccent"
                                : "text-gray-400"
                        }`}
                        onClick={() => setActiveTab("Lesson")}
                    >
                        {lessons[currentLessonIndex]}
                    </button>

                    {test && (
                        <button
                            className={`px-4 py-2 font-bold ${
                                activeTab === "Test"
                                    ? "border-b-4 border-greenAccent text-greenAccent"
                                    : "text-gray-400"
                            }`}
                            onClick={() => setActiveTab("Test")}
                        >
                            Test
                        </button>
                    )}
                </div>

                {activeTab === "Lesson" && <ChatBox lessonId={selectedLesson} />}
                {activeTab === "Test" && test && (
                    <div className="p-6">
                        <h3 className="font-bold text-xl mb-4">Generated Test:</h3>
                        {test.questions.map((q, index) => (
                            <div key={index} className="mb-4">
                                <p className="font-semibold">{q.questionText}</p>

                                {q.type === "MCQ" &&
                                    q.options?.map((option) => (
                                        <div key={option}>
                                            <input
                                                type="radio"
                                                name={q.id?.toString() || `question-${index}`}
                                                value={option}
                                            />
                                            <label>{option}</label>
                                        </div>
                                    ))}

                                {q.type === "TrueFalse" && (
                                    <div>
                                        <input
                                            type="radio"
                                            name={q.id?.toString() || `question-${index}`}
                                            value="True"
                                        />{" "}
                                        True
                                        <input
                                            type="radio"
                                            name={q.id?.toString() || `question-${index}`}
                                            value="False"
                                        />{" "}
                                        False
                                    </div>
                                )}

                                {q.type === "Coding" && (
                                    <textarea
                                        className="w-full h-2 bg-gray-800 text-white p-2 rounded"
                                        placeholder="Write your code here..."
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Sidebar Section */}
            <div className="w-[400px] bg-customGray shadow-lg border-l border-gray-700 flex flex-col p-4">
                <div className="flex flex-col items-center mb-6">
                    <div className="font-bold text-lg mb-2">Your Progress:</div>
                    <div className="w-full h-24 bg-customDark border border-gray-700 rounded-lg"></div>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <div className="font-bold text-lg mb-2">Lesson Part:</div>
                    <div className="text-2xl font-bold text-greenAccent underline">3/5</div>
                </div>

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

                <button
                    onClick={handleGenerateTest}
                    disabled={isGenerating}
                    className="w-full py-3 bg-greenAccent text-black font-bold rounded-md shadow-md hover:bg-green-400 transition"
                >
                    {isGenerating ? "Generating Test..." : "Take A Test"}
                </button>
            </div>
        </div>
    );
};

export default ChatPage;
