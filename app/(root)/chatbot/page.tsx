"use client";

import React, { useState } from "react";
import ChatBox from "@/components/ChatBox";

const lessons = [
  "Introduction to AI",
  "Machine Learning Basics",
  "Deep Learning Fundamentals",
  "Neural Networks Explained",
  "Supervised vs Unsupervised Learning",
  "Natural Language Processing",
  "Computer Vision Concepts",
  "Reinforcement Learning",
  "AI Ethics & Bias",
  "Future of AI & Research",
];

const ChatPage: React.FC = () => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(`Lesson ${currentLessonIndex + 1}`);

  return (
    <div className="min-h-screen bg-customDark text-white flex">
      <div className="flex flex-col w-full">
        {/* Tab Bar for Lessons & Test */}
        <div className="flex gap-2 border-b-2 border-gray-700 p-4 bg-customGray overflow-x-auto">
          {lessons.map((_, index) => (
            <button
              key={index}
              className={`px-4 py-2 font-bold ${
                activeTab === `Lesson ${index + 1}` ? "border-b-4 border-greenAccent text-greenAccent" : "text-gray-400"
              }`}
              onClick={() => {
                setCurrentLessonIndex(index);
                setActiveTab(`Lesson ${index + 1}`);
              }}
            >
              Lesson {index + 1}
            </button>
          ))}
          <button
            className={`px-4 py-2 font-bold ${
              activeTab === "Test" ? "border-b-4 border-greenAccent text-greenAccent" : "text-gray-400"
            }`}
            onClick={() => setActiveTab("Test")}
          >
            Test
          </button>
        </div>

        {/* Lesson or Test Section */}
        {activeTab.includes("Lesson") && (
          <div className="p-6 flex flex-col items-center">
           
            <ChatBox lessonId={`lesson${currentLessonIndex + 1}`} />
          </div>
        )}

        {activeTab === "Test" && (
          <div className="p-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Test for {lessons[currentLessonIndex]}</h2>
            <button className="py-3 px-6 bg-greenAccent text-black font-bold rounded-md shadow-md hover:bg-green-400 transition">
              Start Test
            </button>
          </div>
        )}
      </div>

      {/* Sidebar for Lesson List & Progress */}
      
      <div className="w-[450px] bg-customGray shadow-lg border-l border-gray-700 flex flex-col p-4">
        {/* List of Lessons (Reduced Gap Between Items) */}
        <div className="flex flex-col gap-1"> {/* Reduced gap from default to gap-1 */}
          <h3 className="text-lg font-semibold mb-2">Lessons</h3>
          {lessons.map((lesson, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentLessonIndex(index);
                setActiveTab(`Lesson ${index + 1}`);
              }}
              className={`w-full p-3 text-left rounded-md transition ${
                currentLessonIndex === index
                  ? "bg-greenAccent text-black font-bold"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              {index + 1} - {lesson}
            </button>
          ))}
        </div>
        {/* Progress Bar */}
        <div className="flex flex-col items-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Lesson Progress</h3>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className="bg-greenAccent h-4 rounded-full"
              style={{ width: `${((currentLessonIndex + 1) / lessons.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-300">
            {currentLessonIndex + 1} / {lessons.length} Lessons Completed
          </p>
        </div>

        
      </div>
    </div>
  );
};

export default ChatPage;
