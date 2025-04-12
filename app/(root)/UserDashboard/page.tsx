"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaBookOpen, FaCheckCircle, FaChartLine, FaTimes, FaEdit } from "react-icons/fa";

interface Topic {
  id: string;
  title: string;
  completedLessons: number;
  totalLessons: number;
  averageScore: number;
}

const UserDashboard: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");

  useEffect(() => {
    if (session) {
      fetchTopics();
    }
  }, [session]);

  const fetchTopics = async () => {
    try {
      const response = await fetch("/api/topics/get");
      const data = await response.json();
      if (data.success) {
        setTopics(data.topics);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete topic function
  const deleteTopic = async (id: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this topic?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch("/api/topics/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete topic");
      }

      // ✅ Remove topic from UI
      setTopics((prevTopics) => prevTopics.filter((topic) => topic.id !== id));
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  // ✅ Start editing a topic title
  const startEditing = (id: string, title: string) => {
    setEditingTopicId(id);
    setEditedTitle(title);
  };

  // ✅ Save the edited topic title
  const saveEdit = async (id: string) => {
    if (!editedTitle.trim()) return;

    try {
      const response = await fetch("/api/topics/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, newTitle: editedTitle }),
      });

      if (!response.ok) {
        throw new Error("Failed to update topic");
      }

      setTopics((prevTopics) =>
        prevTopics.map((topic) =>
          topic.id === id ? { ...topic, title: editedTitle } : topic
        )
      );
      setEditingTopicId(null);
    } catch (error) {
      console.error("Error updating topic:", error);
    }
  };

  return (
    <div className="min-h-screen bg-customDark text-white p-6">

      {/* 📊 Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-customGray p-6 rounded-lg shadow-md flex items-center">
          <FaBookOpen className="text-greenAccent text-3xl mr-4" />
          <div>
            <p className="text-lg font-semibold">Topics</p>
            <p className="text-2xl">{topics.length}</p>
          </div>
        </div>
        <div className="bg-customGray p-6 rounded-lg shadow-md flex items-center">
          <FaCheckCircle className="text-greenAccent text-3xl mr-4" />
          <div>
            <p className="text-lg font-semibold">Lessons Completed</p>
            <p className="text-2xl">
              {topics.reduce((acc, topic) => acc + topic.completedLessons, 0)}
            </p>
          </div>
        </div>
        <div className="bg-customGray p-6 rounded-lg shadow-md flex items-center">
          <FaChartLine className="text-greenAccent text-3xl mr-4" />
          <div>
            <p className="text-lg font-semibold">Average Score</p>
            <p className="text-2xl">
              {topics.length > 0
                ? Math.round(
                  topics.reduce((acc, topic) => acc + topic.averageScore, 0) / topics.length
                )
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {/* 📚 Topic List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Topics</h2>
        {loading ? (
          <p>Loading topics...</p>
        ) : topics.length === 0 ? (
          <p>No topics found. Start learning by uploading a file!</p>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="p-4 bg-customGray rounded-lg shadow-md flex justify-between items-center"
              >
                <div>
                  {/* Editable Title & Progress Info */}
                  {editingTopicId === topic.id ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="bg-gray-700 text-white px-2 py-1 rounded-md"
                      onBlur={() => saveEdit(topic.id)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(topic.id)}
                      autoFocus
                    />
                  ) : (
                    <h3 className="text-lg font-bold">{topic.title}</h3>
                  )}
                  <p className="text-sm text-gray-400">
                    Progress: {topic.completedLessons}/{topic.totalLessons} Lessons Completed
                  </p>
                  <p className="text-sm text-gray-400">Average Score: {topic.averageScore}%</p>
                </div>

                <div className="flex space-x-3">
                  {/* ✏️ Edit Button */}
                  <button
                    className="p-2 bg-[#27d63c] text-black rounded-md hover:opacity-90 transition"
                    onClick={() => startEditing(topic.id, topic.title)}
                  >
                    <FaEdit />
                  </button>

                  <button
                    className="px-4 py-2 bg-[#27d63c] text-black font-bold rounded-md hover:opacity-90 transition"
                    onClick={() => router.push(`/chatbot?topicId=${topic.id}&lesson=lesson1`)}
                  >
                    Continue Learning
                  </button>

                  <button
                    className="px-4 py-2 bg-white text-black font-bold rounded-md hover:bg-gray-200 transition"
                    onClick={() => router.push(`/TopicProgress?topicId=${topic.id}`)}
                  >
                    Check Progress
                  </button>


                  {/* ❌ Square Delete Button */}
                  <button
                    className="p-2 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 transition"
                    onClick={() => deleteTopic(topic.id)}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
