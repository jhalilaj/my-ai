"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";

const lessons = ["Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4"];

const TopicPage: React.FC = () => {
  const { id } = useParams();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(2);
  const [averageScore, setAverageScore] = useState(85);
  const [activeTab, setActiveTab] = useState<"Lesson" | "Test">("Lesson");

  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">📖 {lessons[currentLessonIndex]}</h1>

      {/* Progress Overview */}
      <div className="flex justify-between items-center bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
        <div>
          <p className="text-gray-400">Lessons Completed: {completedLessons}/{lessons.length}</p>
          <p className="text-green-400">Average Score: {averageScore}%</p>
        </div>
        <button
          onClick={handleNextLesson}
          className="bg-green-500 px-4 py-2 rounded"
          disabled={currentLessonIndex >= lessons.length - 1}
        >
          Next Lesson →
        </button>
      </div>

      {/* Lesson & Test Tabs */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === "Lesson" ? "bg-green-500" : "bg-gray-700"}`}
          onClick={() => setActiveTab("Lesson")}
        >
          Lesson
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === "Test" ? "bg-green-500" : "bg-gray-700"}`}
          onClick={() => setActiveTab("Test")}
        >
          Test
        </button>
      </div>

      {/* Lesson Content */}
      {activeTab === "Lesson" && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <p className="text-gray-300">This is the content for {lessons[currentLessonIndex]}...</p>
        </div>
      )}

      {/* Test Content */}
      {activeTab === "Test" && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <p className="text-gray-300">Test for {lessons[currentLessonIndex]}</p>
          <button className="mt-4 bg-green-500 px-4 py-2 rounded">Start Test</button>
        </div>
      )}
    </div>
  );
};

export default TopicPage;
    