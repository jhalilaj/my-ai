"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ChatBox from "@/components/ChatBox";

const ChatPage: React.FC = () => {
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topicId");

  const [lessons, setLessons] = useState<{ _id: string; title: string }[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("Lesson 1");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) {
      fetchLessons();
    }
  }, [topicId]);

  const fetchLessons = async () => {
    try {
      const res = await fetch(`/api/lesson/get?topicId=${topicId}`);
      if (!res.ok) throw new Error("Failed to fetch lessons");

      const data = await res.json();
      setLessons(data.lessons || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-customDark text-white flex">
      <div className="flex flex-col w-full">
        {/* Tab Bar for Lessons & Test */}
        <div className="flex gap-2 border-b-2 border-gray-700 p-4 bg-customGray overflow-x-auto">
          {loading ? (
            <p>Loading Lessons...</p>
          ) : (
            lessons.map((lesson, index) => (
              <button
                key={lesson._id}
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
            ))
          )}
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
          <div className=" flex flex-col items-center">
            {loading ? <p>Loading...</p> : <ChatBox lessonId={lessons[currentLessonIndex]?._id} />}
          </div>
        )}

        {activeTab === "Test" && (
          <div className="p-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Test for {lessons[currentLessonIndex]?.title}</h2>
            <button className="py-3 px-6 bg-greenAccent text-black font-bold rounded-md shadow-md hover:bg-green-400 transition">
              Start Test
            </button>
          </div>
        )}
      </div>

      {/* Sidebar for Lesson List & Progress */}
      <div className="w-[450px] bg-customGray shadow-lg border-l border-gray-700 flex flex-col p-4">
        {/* List of Lessons */}
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold mb-2">Lessons</h3>
          {loading ? (
            <p>Loading...</p>
          ) : lessons.length === 0 ? (
            <p>No lessons found.</p>
          ) : (
            lessons.map((lesson, index) => (
              <button
                key={lesson._id}
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
                {index + 1} - {lesson.title}
              </button>
            ))
          )}
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
