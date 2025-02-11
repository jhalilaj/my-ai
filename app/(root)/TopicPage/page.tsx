"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Import useRouter

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

const TopicPage: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>(sampleTopics);
  const router = useRouter(); // ✅ Initialize router

  const handleCheckProgress = (topicId: string) => {
    router.push(`/progress/${topicId}`); // ✅ Navigate to TopicProgress
  };

  return (
    <div className="min-h-screen bg-customDark text-white p-6">
      <h1 className="text-3xl font-bold mb-6">📚 Your Topics</h1>

      {/* Topic List */}
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
                <p className="text-sm text-gray-400">
                  Average Score: {topic.averageScore}%
                </p>
              </div>

              {/* Buttons Container */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleCheckProgress(topic.id)} // ✅ Navigate to progress page
                  className="px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-400 transition"
                >
                  Check Progress
                </button>
                <button 
                  className="px-4 py-2 bg-greenAccent text-black font-bold rounded-md hover:bg-green-400 transition"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicPage;
