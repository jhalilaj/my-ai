"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ChatBox from "@/components/ChatBox";
import TestComponent from "@/components/TestComponent"; // ✅ Import Test UI

const ChatPage: React.FC = () => {
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topicId");

  const [lessons, setLessons] = useState<{ _id: string; title: string }[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("Lesson 1");
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [testLoading, setTestLoading] = useState(false); // ✅ Loading state for test generation

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

  // ✅ Fetch test when "Start Test" is clicked
// ✅ Modify fetchTest to generate a test if not found
const fetchTest = async () => {
  try {
    setTestLoading(true);
    const res = await fetch(`/api/test/get?lessonId=${lessons[currentLessonIndex]?._id}`);

    if (res.status === 404) {
      console.warn("Test not found, generating a new test...");
      await generateTest(); // ✅ If test not found, generate one
      return;
    }

    if (!res.ok) throw new Error("Failed to fetch test");

    const data = await res.json();
    setTest(data.test || null);
  } catch (error) {
    console.error("Error fetching test:", error);
  } finally {
    setTestLoading(false);
  }
};

// ✅ Function to Generate a Test
const generateTest = async () => {
  try {
    setTestLoading(true);
    const res = await fetch(`/api/test/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: lessons[currentLessonIndex]?._id }),
    });

    if (!res.ok) throw new Error("Failed to generate test");

    const data = await res.json();
    setTest(data.test); // ✅ Set the test after it's created
  } catch (error) {
    console.error("Error generating test:", error);
  } finally {
    setTestLoading(false);
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
                  setTest(null); // Reset test when switching lessons
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
              fetchTest(); // ✅ Fetch test when clicking "Test"
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
            <h2 className="text-2xl font-bold mb-4">Test for {lessons[currentLessonIndex]?.title}</h2>
            {testLoading ? (
              <p className="text-gray-400">Fetching test...</p>
            ) : test ? (
              <TestComponent test={test} />
            ) : (
              <button
                className="py-3 px-6 bg-greenAccent text-black font-bold rounded-md shadow-md hover:bg-green-400 transition"
                onClick={fetchTest}
              >
                Generate Test
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
