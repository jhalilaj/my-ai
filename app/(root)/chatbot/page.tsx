"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ChatBox from "@/components/ChatBox";
import TestComponent from "@/components/TestComponent";

const ChatPage: React.FC = () => {
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topicId");

  const [lessons, setLessons] = useState<{ _id: string; title: string; completed: boolean }[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("Lesson 1");
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(67);
  const [avgTestScore, setAvgTestScore] = useState<number | null>(null);
  const [isConfirmingCompletion, setIsConfirmingCompletion] = useState(false);

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

  const fetchTest = async () => {
    try {
      setTestLoading(true);
      const res = await fetch(`/api/test/get?lessonId=${lessons[currentLessonIndex]?._id}`);

      if (res.status === 404) {
        console.warn("Test not found, generating a new test...");
        await generateTest();
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch test");

      const data = await res.json();
      setTest(data.test || null);
      setAvgTestScore(data.avgScore || null);
    } catch (error) {
      console.error("Error fetching test:", error);
    } finally {
      setTestLoading(false);
    }
  };

  const generateTest = async () => {
    try {
      setIsGenerating(true);
      const res = await fetch(`/api/test/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lessons[currentLessonIndex]?._id }),
      });

      if (!res.ok) throw new Error("Failed to generate test");

      const data = await res.json();
      setTest(data.test);
      setActiveTab("Test");
    } catch (error) {
      console.error("Error generating test:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const completeLesson = () => {
    setIsConfirmingCompletion(true);
  };

  const confirmCompleteLesson = async () => {
    try {
      const lessonId = lessons[currentLessonIndex]._id;
      const res = await fetch("/api/lesson/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: true }),
      });

      if (res.ok) {
        setIsConfirmingCompletion(false);
        await fetchLessons(); // Refresh lesson data
      } else {
        console.error("Failed to mark lesson as completed");
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
    }
  };

  return (
    <div className="min-h-screen bg-customDark text-white flex">
      {/* Sidebar */}
      <div className="w-[350px] bg-customGray shadow-lg border-r border-gray-700 flex flex-col p-4 justify-between">
        <div>
          {/* Progress Bar */}
          <div className="flex flex-col items-center mb-6">
            <div className="font-bold text-lg mb-2">Your Progress</div>
            <div className="w-full bg-gray-800 rounded-full h-6 overflow-hidden mb-2">
              <div
                className="bg-greenAccent h-6 text-center text-black font-bold leading-6"
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
          </div>

          {/* Average Test Score */}
          <div className="flex flex-col items-center mb-6">
            <div className="font-bold text-lg mb-2">Average Test Score</div>
            <div className={`text-2xl font-bold ${avgTestScore !== null ? "text-greenAccent" : "text-gray-400"}`}>
              {avgTestScore !== null ? `${avgTestScore}%` : "No test taken"}
            </div>
          </div>

          {/* Lesson List */}
          <div className="overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            {lessons.map((lesson, index) => (
              <button
                key={lesson._id}
                className={`w-full mb-2 py-2 px-3 rounded-md border font-semibold text-left truncate ${
                  currentLessonIndex === index
                    ? "border-greenAccent bg-customDark text-greenAccent"
                    : "border-gray-600 bg-gray-700 hover:bg-gray-600"
                }`}
                title={lesson.title}
                onClick={() => {
                  setCurrentLessonIndex(index);
                  setActiveTab(`Lesson ${index + 1}`);
                  setTest(null);
                }}
              >
                {lesson.title}
              </button>
            ))}
          </div>

          {/* Complete Lesson */}
          <div className="flex justify-center mt-6">
            {lessons[currentLessonIndex]?.completed ? (
              <div className="w-full py-3 text-center bg-gray-600 text-white font-bold rounded-md shadow-md">
                ✅ COMPLETED
              </div>
            ) : (
              <button
                className="w-full py-3 bg-greenAccent text-black font-bold rounded-md shadow-md hover:bg-green-400 transition"
                onClick={completeLesson}
              >
                Complete Lesson
              </button>
            )}
          </div>
        </div>

        {/* Take A Test Button */}
        <button
          className="w-full py-3 bg-greenAccent text-black font-bold rounded-md shadow-md hover:bg-green-400 transition"
          onClick={() => {
            setActiveTab("Test");
            fetchTest();
          }}
        >
          Take A Test
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full">
        {/* Tab Bar */}
        <div className="flex gap-2 border-b-2 border-gray-700 p-4 bg-customGray overflow-x-auto">
          {loading ? (
            <p>Loading Lessons...</p>
          ) : (
            lessons.map((lesson, index) => (
              <button
                key={lesson._id}
                className={`px-4 py-2 font-bold ${
                  activeTab === `Lesson ${index + 1}`
                    ? "border-b-4 border-greenAccent text-greenAccent"
                    : "text-gray-400"
                }`}
                onClick={() => {
                  setCurrentLessonIndex(index);
                  setActiveTab(`Lesson ${index + 1}`);
                  setTest(null);
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
            onClick={() => {
              setActiveTab("Test");
              fetchTest();
            }}
          >
            Test
          </button>
        </div>

        {/* Lesson or Test Section */}
        {activeTab.includes("Lesson") && (
          <div className="p-6 flex flex-col items-center">
            {loading ? <p>Loading...</p> : <ChatBox lessonId={lessons[currentLessonIndex]?._id} />}
          </div>
        )}

        {activeTab === "Test" && (
          <div className="p-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">
              Test for {lessons[currentLessonIndex]?.title}
            </h2>
            {testLoading ? (
              <p className="text-gray-400">Fetching test...</p>
            ) : test ? (
              <TestComponent test={test} />
            ) : (
              <p>No test available.</p>
            )}
          </div>
        )}
      </div>

      {/* Complete Lesson Confirmation Popup */}
      {isConfirmingCompletion && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-black">
            <h3 className="text-xl font-bold mb-4">Are you sure you want to complete this lesson?</h3>
            {avgTestScore !== null && <p className="mb-4">Your average test score is: {avgTestScore}%</p>}
            <div className="flex justify-between">
              <button
                onClick={confirmCompleteLesson}
                className="px-4 py-2 bg-green-500 text-white font-bold rounded-md"
              >
                Yes, Complete
              </button>
              <button
                onClick={() => setIsConfirmingCompletion(false)}
                className="px-4 py-2 bg-gray-500 text-white font-bold rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
