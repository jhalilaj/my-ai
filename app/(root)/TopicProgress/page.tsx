"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import TestViewer from "@/components/TestViewer"; // ✅ Import TestViewer component

const TopicProgress: React.FC = () => {
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topicId");

  const [topic, setTopic] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  useEffect(() => {
    if (topicId) {
      fetchTopic();
      fetchLessons();
    }
  }, [topicId]);

  // ✅ Fetch Topic Details
  const fetchTopic = async () => {
    try {
      console.log(`🔎 Requesting topic: ${topicId}`);
      const res = await fetch(`/api/topics/get-single?topicId=${topicId}`);
      if (!res.ok) throw new Error("Failed to fetch topic");
      const data = await res.json();
      console.log("✅ Topic fetched:", data);
      setTopic(data.topic);
    } catch (error) {
      console.error("❌ Error fetching topic:", error);
    }
  };

  // ✅ Fetch Lessons & Past Tests
  const fetchLessons = async () => {
    try {
      console.log(`🔎 Fetching lessons for topicId: ${topicId}`);
      const res = await fetch(`/api/lesson/get?topicId=${topicId}`);

      if (!res.ok) throw new Error(`Failed to fetch lessons. Status: ${res.status}`);

      const data = await res.json();
      console.log(`✅ Fetched ${data.lessons.length} lessons for topicId: ${topicId}`);

      // ✅ Fetch ALL test results for each lesson
      const lessonsWithTests = await Promise.all(
        data.lessons.map(async (lesson: any) => {
          try {
            console.log(`🔎 Fetching tests for lesson ${lesson._id}...`);
            const testRes = await fetch(`/api/test/results?lessonId=${lesson._id}`);

            if (!testRes.ok) {
              console.error(`❌ Test fetch failed for lesson ${lesson._id}, Status: ${testRes.status}`);
              return { ...lesson, tests: [] };
            }

            const testData = await testRes.json();
            console.log(`✅ Found ${testData.tests.length} tests for lesson ${lesson._id}:`, testData.tests);

            return { ...lesson, tests: testData.success ? testData.tests : [] };
          } catch (error) {
            console.error(`❌ Error fetching tests for lesson ${lesson._id}:`, error);
            return { ...lesson, tests: [] };
          }
        })
      );

      console.log("📋 Final lessons with tests:", lessonsWithTests);
      setLessons(lessonsWithTests);
    } catch (error) {
      console.error("❌ Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Calculate Progress
  const completedLessons = lessons.filter((lesson) => lesson.completed).length;
  const totalLessons = lessons.length;
  const averageScore =
    completedLessons > 0
      ? Math.round(
          lessons.reduce((acc, lesson) => acc + (lesson.tests?.length > 0 ? lesson.tests[0].score : 0), 0) /
            completedLessons
        )
      : 0;

  if (loading) return <p className="text-white">Loading progress...</p>;
  if (!topic) return <p className="text-red-400">Error: Topic not found.</p>;

  return (
    <>
      <Head>
        <title>Progress - {topic.title}</title>
        <meta name="description" content={`Progress tracking for ${topic.title}`} />
      </Head>
      <div className="min-h-screen bg-customDark text-white p-6">
        <h1 className="text-3xl font-bold mb-6">📊 Progress for {topic.title}</h1>

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

        {/* Lesson Breakdown */}
        <h2 className="text-xl font-semibold mb-4">Lesson Breakdown</h2>
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <div key={lesson._id} className="bg-gray-800 p-4 rounded-lg shadow-md">
              {/* Lesson Title & Toggle Button */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedLesson(expandedLesson === lesson._id ? null : lesson._id)}
              >
                <div>
                  <h3 className="text-lg font-bold">{lesson.title}</h3>
                  <p className="text-sm text-gray-400">
                    {lesson.tests && lesson.tests.length > 0 
                      ? `Past Tests: ${lesson.tests.length}` 
                      : "No tests available"}
                  </p>
                </div>
                <span className="text-greenAccent">{expandedLesson === lesson._id ? "▲" : "▼"}</span>
              </div>

              {/* Test Results */}
              {expandedLesson === lesson._id && lesson.tests.length > 0 && (
                <div className="mt-2 p-3 bg-gray-700 rounded-lg">
                  <h4 className="text-lg font-bold mb-2">Past Test Results:</h4>
                  <div className="space-y-2">
                    {lesson.tests.map((test: any, index: number) => (
                      <div 
                        key={test._id || index} 
                        className="bg-gray-600 p-3 rounded-md flex justify-between items-center"
                      >
                        <p className="flex items-center text-sm">
                          📅 {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : "Unknown"}
                        </p>
                        <p className="flex items-center text-sm">
                          ✅ Score: {test.score !== undefined && test.questions?.length 
                            ? `${((test.score / test.questions.length) * 100).toFixed(2)}%` 
                            : "Not taken yet"}
                        </p>
                        <button
                          className="px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-400 transition"
                          onClick={() => setSelectedTest(test)} // ✅ Open TestViewer
                        >
                          View Test
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Render TestViewer if a test is selected */}
      {selectedTest && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setSelectedTest(null)} // ✅ Close when clicking outside
        >
          <TestViewer test={selectedTest} onClose={() => setSelectedTest(null)} />
        </div>
      )}
    </>
  );
};

export default TopicProgress;
