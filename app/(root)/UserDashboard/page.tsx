"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // ✅ Import NextAuth session
import { FaBookOpen, FaCheckCircle, FaPlusCircle, FaChartLine } from "react-icons/fa";

interface Topic {
  id: string;
  title: string;
  completedLessons: number;
  totalLessons: number;
  averageScore: number;
}

const sampleTopics: Topic[] = [
  { id: "1", title: "Machine Learning", completedLessons: 3, totalLessons: 10, averageScore: 85 },
  { id: "2", title: "Cybersecurity Basics", completedLessons: 5, totalLessons: 8, averageScore: 78 },
];

const UserDashboard: React.FC = () => {
  const { data: session } = useSession(); // ✅ Get logged-in user session
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>(sampleTopics);
  const [newTopic, setNewTopic] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [teachingStyle, setTeachingStyle] = useState("Simple");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setNewTopic(""); // Clear manual input if file is selected
    }
  };

  const handleGenerateTopic = async () => {
    if (!newTopic && !file) {
      alert("Please upload a file or enter a topic title.");
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      setTopics((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          title: newTopic || file?.name || "New Topic",
          completedLessons: 0,
          totalLessons: 10,
          averageScore: 0,
        },
      ]);
      setNewTopic("");
      setFile(null);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-customDark text-white p-6">
      {/* 👤 User Info Section */}
      <div className="flex items-center bg-greenAccent p-6 rounded-lg shadow-md mb-6">
        {/* Profile Picture */}
        {session?.user?.image && (
          <img
            src={session.user.image}
            alt="User Profile"
            className="w-12 h-12 rounded-full border-2 border-white"
          />
        )}

        {/* User Details */}
        <div className="ml-4">
          <h1 className="text-2xl font-bold text-black">
            👋 Hello, {session?.user?.name || "User"}!
          </h1>
          <p className="text-black text-sm">Let's continue learning and track your progress 📊</p>
        </div>
      </div>

      {/* 📊 Progress Overview Section */}
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
        <div className="space-y-4">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="p-4 bg-customGray rounded-lg shadow-md flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-bold">{topic.title}</h3>
                <p className="text-sm text-gray-400">
                  Progress: {topic.completedLessons}/{topic.totalLessons} Lessons Completed
                </p>
                <p className="text-sm text-gray-400">Average Score: {topic.averageScore}%</p>
              </div>
              <div className="flex space-x-3">
                <button
                  className="px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-400 transition"
                  onClick={() => router.push(`/topic/${topic.id}`)}
                >
                  Continue Learning
                </button>
                <button
                  className="px-4 py-2 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-500 transition"
                  onClick={() => router.push(`/progress/${topic.id}`)}
                >
                  Check Progress
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ➕ Create New Topic Section */}
      <div className="p-6 bg-customGray rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Create a New Topic</h2>
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block font-medium">Choose a File (PDF/DOCX)</label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="w-full p-2 bg-customDark border border-gray-700 rounded-md"
            />
          </div>
          <p className="text-center text-gray-500">OR</p>

          {/* Manual Topic Entry */}
          <div>
            <label className="block font-medium">Enter a Topic Title</label>
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="w-full p-2 bg-customDark border border-gray-700 rounded-md"
              placeholder="e.g., Introduction to JavaScript"
              disabled={!!file}
            />
          </div>

          {/* Teaching Style Selection */}
          <div>
            <label className="block font-medium">Teaching Style</label>
            <select
              value={teachingStyle}
              onChange={(e) => setTeachingStyle(e.target.value)}
              className="w-full p-2 bg-customDark border border-gray-700 rounded-md"
            >
              <option value="Simple">Simple</option>
              <option value="Detailed">Detailed</option>
              <option value="Interactive">Interactive</option>
            </select>
          </div>

          {/* Generate Topic Button */}
          <button
            onClick={handleGenerateTopic}
            disabled={isGenerating}
            className="w-full py-3 bg-greenAccent text-black font-bold rounded-md shadow-md hover:bg-green-400 transition"
          >
            {isGenerating ? "Generating..." : "Generate Topic"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
