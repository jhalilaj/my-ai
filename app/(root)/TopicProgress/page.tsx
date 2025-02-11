"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Head from "next/head";


// Sample Lesson Data (Will be replaced with Backend Data)
const lessons = [
  {
    id: "1",
    title: "Lesson 1",
    completed: true,
    tests: [
      { date: "2024-02-01", score: 85 },
      { date: "2024-02-03", score: 90 },
      { date: "2024-02-06", score: 80 },
    ]
  },
  {
    id: "2",
    title: "Lesson 2",
    completed: true,
    tests: [
      { date: "2024-02-05", score: 78 },
      { date: "2024-02-08", score: 85 },
    ]
  },
  {
    id: "3",
    title: "Lesson 3",
    completed: false,
    tests: []
  }
];

const TopicProgress: React.FC = () => {
  const { id } = useParams(); // ✅ Get topic ID from URL
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null); // ✅ Track expanded lesson dropdown

  // Calculate Progress
  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const totalLessons = lessons.length;
  const averageScore =
    completedLessons > 0
      ? Math.round(lessons.reduce((acc, lesson) => acc + (lesson.tests.length > 0 ? lesson.tests[0].score : 0), 0) / completedLessons)
      : 0;

  // Function to Calculate Average Score for Each Lesson
  const getLessonAverageScore = (lessonTests: { score: number }[]) => {
    if (lessonTests.length === 0) return "N/A"; // No tests yet
    const totalScore = lessonTests.reduce((acc, test) => acc + test.score, 0);
    return Math.round(totalScore / lessonTests.length); // Average Score
  };

  return (
    <>
      <Head>
        <title>My Page Title</title> {/* Set the title for this page */}
        <meta name="description" content="This is a description of the page" />
      </Head>
      <div className="min-h-screen bg-customDark text-white p-6">
        <h1 className="text-3xl font-bold mb-6">📊 Progress for Topic {id}</h1>

        {/* Progress Overview */}
        <div className="bg-customGray p-4 rounded-lg shadow-md mb-6">
          <p className="text-lg font-semibold">Lessons Completed: {completedLessons}/{totalLessons}</p>
          <p className="text-lg font-semibold">Overall Average Score: {averageScore}%</p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
            <div
              className="bg-greenAccent h-4 rounded-full"
              style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
            />
          </div>
        </div>

        {/* Lessons Overview */}
        <h2 className="text-xl font-semibold mb-4">Lesson Breakdown</h2>
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
              {/* Lesson Title & Toggle Button */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)} // ✅ Toggle dropdown
              >
                <div>
                  <h3 className="text-lg font-bold">{lesson.title}</h3>
                  <p className="text-sm text-gray-400">
                    Average Score: {getLessonAverageScore(lesson.tests)}%
                  </p>
                </div>
                <span className="text-greenAccent">{expandedLesson === lesson.id ? "▲" : "▼"}</span>
              </div>

              {/* Test Score Dropdown */}
              {expandedLesson === lesson.id && (
                <div className="mt-2 p-3 bg-gray-700 rounded-lg">
                  {lesson.tests.length > 0 ? (
                    lesson.tests.map((test, index) => (
                      <div key={index} className="flex justify-between items-center text-sm p-2 border-b border-gray-600">
                        <p>📅 {test.date}</p>
                        <p>✅ Score: {test.score}%</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No tests taken yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TopicProgress;
