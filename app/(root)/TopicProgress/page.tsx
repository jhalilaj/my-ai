"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import TestViewer from "@/components/TestViewer";

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

  const fetchTopic = async () => {
    try {
      const res = await fetch(`/api/topics/get-single?topicId=${topicId}`);
      if (!res.ok) throw new Error("Failed to fetch topic");
      const data = await res.json();
      setTopic(data.topic);
    } catch (error) {
      console.error("❌ Error fetching topic:", error);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await fetch(`/api/lesson/get?topicId=${topicId}`);
      if (!res.ok) throw new Error(`Failed to fetch lessons. Status: ${res.status}`);
      const data = await res.json();

      const lessonsWithTests = await Promise.all(
        data.lessons.map(async (lesson: any) => {
          try {
            const testRes = await fetch(`/api/test/results?lessonId=${lesson._id}`);
            if (!testRes.ok) return { ...lesson, tests: [], avgScore: "0.00" };

            const testData = await testRes.json();
            const totalTests = testData.tests.length;

            let totalPercentage = 0;
            testData.tests.forEach((test: any) => {
              const testPercentage = test.percentage || 0;
              totalPercentage += testPercentage;
            });

            const avgScore = totalTests > 0 ? (totalPercentage / totalTests).toFixed(2) : "0.00";

            return { ...lesson, tests: testData.tests, avgScore };
          } catch (error) {
            return { ...lesson, tests: [], avgScore: "0.00" };
          }
        })
      );

      setLessons(lessonsWithTests);
    } catch (error) {
      console.error("❌ Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalScoresSum = lessons.reduce(
    (acc, lesson) => acc + (parseFloat(lesson.avgScore) || 0),
    0
  );

  const overallAverageScore =
    lessons.length > 0 ? (totalScoresSum / lessons.length).toFixed(2) : "0.00";

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
          <p className="text-lg font-semibold">Overall Average Score: {overallAverageScore}%</p>
          <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
            <div
              className="bg-greenAccent h-4 rounded-full"
              style={{ width: `${overallAverageScore}%` }}
            />
          </div>
        </div>

        {/* Lesson Breakdown */}
        <h2 className="text-xl font-semibold mb-4">Lesson Breakdown</h2>
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <div key={lesson._id} className="bg-gray-800 p-4 rounded-lg shadow-md">
              {/* Lesson Title & Average Score */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedLesson(expandedLesson === lesson._id ? null : lesson._id)}
              >
                <div>
                  <h3 className="text-lg font-bold">{lesson.title}</h3>
                  <p className="text-sm text-gray-400">
                    {lesson.tests.length > 0 ? `Past Tests: ${lesson.tests.length}` : "No tests available"}
                  </p>
                  <p className="text-sm text-green-400 font-semibold">
                    Average Score: {lesson.avgScore}%
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
                      <div key={test._id || index} className="bg-gray-600 p-3 rounded-md flex justify-between items-center">
                        <p className="flex items-center text-sm">
                          📅 {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : "Unknown"}
                        </p>
                        <p className="flex items-center text-sm">
                          ✅ Percentage: {test.percentage !== undefined ? `${test.percentage.toFixed(1)}%` : "Not taken yet"}
                        </p>

                        <button
                          className="px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-400 transition"
                          onClick={() => setSelectedTest(test)}
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

      {/* TestViewer for viewing past tests */}
      {selectedTest && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setSelectedTest(null)}
        >
          <TestViewer test={selectedTest} onClose={() => setSelectedTest(null)} />
        </div>
      )}
    </>
  );
};

export default TopicProgress;
