"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lessonTopic, setLessonTopic] = useState("");
  const [teachingStyle, setTeachingStyle] = useState("Simple");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [files, setFiles] = useState<{ fileName: string; filePath: string }[]>([]);

  useEffect(() => {
    if (session) {
      fetchUserFiles();
    }
  }, [session]);

  const fetchUserFiles = async () => {
    const response = await fetch(`/api/files`);
    const data = await response.json();
    if (data.success) {
      setFiles(data.files);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleGenerateLesson = async () => {
    if (!session) {
      alert("You must be logged in to generate a lesson.");
      return;
    }

    let uploadedFilePath = "";

    // Upload file if selected
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        uploadedFilePath = data.filePath;
      } else {
        alert("Error uploading file");
        return;
      }
    }

    // Redirect to Chatbot page with lesson1 and uploaded file (if any)
    router.push(`/chatbot?lesson=lesson1&file=${encodeURIComponent(uploadedFilePath)}`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Upload Lesson or Enter a Topic</h2>

        {/* File Upload Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Choose a File (PDF/DOCX)</label>
          <input type="file" onChange={handleFileChange} className="w-full text-white bg-gray-700 p-2 rounded-md" />
        </div>

        {/* Text Input for Lesson Topic */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Or Enter a Topic</label>
          <input
            type="text"
            value={lessonTopic}
            onChange={(e) => setLessonTopic(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md"
            placeholder="Enter a lesson topic..."
          />
        </div>

        {/* Dropdown for Teaching Style */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Teaching Style</label>
          <select
            value={teachingStyle}
            onChange={(e) => setTeachingStyle(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md"
          >
            <option value="Simple">Simple</option>
            <option value="Detailed">Detailed</option>
            <option value="Interactive">Interactive</option>
          </select>
        </div>

        {/* Generate Lesson Button */}
        <button
          onClick={handleGenerateLesson}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md transition"
        >
          Generate Lesson
        </button>
      </div>
    </div>
  );
}
