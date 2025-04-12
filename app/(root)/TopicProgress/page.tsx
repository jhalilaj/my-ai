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

  // 🔴 Custom delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState<{ testId: string; lessonId: string } | null>(null);

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
              if (typeof test.percentage === "number") {
                totalPercentage += test.percentage;
              }
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

  const confirmDeleteTest = async () => {
    if (!testToDelete) return;
    const { testId, lessonId } = testToDelete;

    try {
      const res = await fetch(`/api/test/delete?id=${testId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete test");

      setLessons((prevLessons) =>
        prevLessons.map((lesson) => {
          if (lesson._id === lessonId) {
            const updatedTests = lesson.tests.filter((t: any) => t._id !== testId);
            const totalPercentage = updatedTests.reduce(
              (acc: number, t: any) => acc + (typeof t.percentage === "number" ? t.percentage : 0),
              0
            );
            const avgScore =
              updatedTests.length > 0
                ? (totalPercentage / updatedTests.length).toFixed(2)
                : "0.00";
            return { ...lesson, tests: updatedTests, avgScore };
          }
          return lesson;
        })
      );

      setShowDeleteModal(false);
      setTestToDelete(null);
    } catch (error) {
      console.error("❌ Error deleting test:", error);
      alert("Failed to delete test.");
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

        {/* Overall Average */}
        <div className="bg-customGray p-4 rounded-lg shadow-md mb-6">
          <p className="text-lg font-semibold">Overall Average Score: {overallAverageScore}%</p>
          <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
            <div
              className="bg-greenAccent h-4 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(parseFloat(overallAverageScore), 100)}%`,
                minWidth: parseFloat(overallAverageScore) > 0 ? "5px" : "0",
              }}
            />
          </div>
        </div>

        {/* Lessons List */}
        <h2 className="text-xl font-semibold mb-4">Lesson Breakdown</h2>
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <div key={lesson._id} className="bg-customGray p-4 rounded-lg shadow-md">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setExpandedLesson(expandedLesson === lesson._id ? null : lesson._id)
                }
              >
                <div>
                  <h3 className="text-lg font-bold">{lesson.title}</h3>
                  <p className="text-sm text-gray-400">
                    {lesson.tests.length > 0
                      ? `Past Tests: ${lesson.tests.length}`
                      : "No tests available"}
                  </p>
                  <p className="text-sm text-green-400 font-semibold">
                    Average Score: {lesson.avgScore}%
                  </p>
                </div>
                <span className="text-greenAccent">
                  {expandedLesson === lesson._id ? "▲" : "▼"}
                </span>
              </div>

              {/* Tests Section */}
              {expandedLesson === lesson._id && lesson.tests.length > 0 && (
                <div className="mt-2 p-3 bg-customGray rounded-lg">
                  <h4 className="text-lg font-bold mb-2">Past Test Results:</h4>
                  <div className="space-y-2">
                    {lesson.tests.map((test: any, index: number) => (
                      <div
                        key={test._id || index}
                        className="bg-black p-3 rounded-md flex justify-between items-center gap-4"
                      >
                        <p className="text-sm text-gray-300">
                          Date{" "}
                          {test.createdAt
                            ? new Date(test.createdAt).toLocaleDateString()
                            : "Unknown"}
                        </p>

                        <p className="text-sm text-green-400 font-semibold">
                          Score:{" "}
                          {typeof test.percentage === "number"
                            ? `${test.percentage.toFixed(1)}%`
                            : "Not taken yet"}
                        </p>

                        <div className="flex gap-2">
                          <button
                            className="px-4 py-2 bg-greenAccent text-black font-bold rounded-md hover:bg-green-500 transition"
                            onClick={() => setSelectedTest(test)}
                          >
                            View Test
                          </button>
                          <button
                            className="px-4 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition"
                            onClick={() => {
                              setTestToDelete({ testId: test._id, lessonId: lesson._id });
                              setShowDeleteModal(true);
                            }}
                            
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Test Viewer Overlay */}
      {selectedTest && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setSelectedTest(null)}
        >
          <TestViewer test={selectedTest} onClose={() => setSelectedTest(null)} />
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && testToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-black p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Test Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete this test? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowDeleteModal(false);
                  setTestToDelete(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={confirmDeleteTest}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopicProgress;
