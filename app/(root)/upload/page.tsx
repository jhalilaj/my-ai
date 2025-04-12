"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [lessonTopic, setLessonTopic] = useState("");
  const [teachingStyle, setTeachingStyle] = useState("Simple");
  const [aiModel, setAiModel] = useState("gpt"); // Default to "gpt"
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleGenerateLesson = async () => {
    if (!session) {
      alert("You must be logged in to generate a lesson.");
      return;
    }

    setUploading(true);
    let fileIds: string[] = [];
    let filePaths: string[] = [];
    let topicId = null;

    try {
      // Step 1: Upload All Files
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append("file", file);

          console.log("📤 Uploading file:", file.name);
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const uploadData = await uploadRes.json();
          if (!uploadRes.ok || !uploadData.success) {
            alert(`Error uploading file: ${file.name}`);
            continue;
          }

          fileIds.push(uploadData.fileId);
          filePaths.push(uploadData.filePath);
          console.log("✅ File uploaded:", uploadData.fileId);
        }
      }

      if (!lessonTopic && filePaths.length === 0) {
        alert("Please enter a topic or upload at least one file.");
        setUploading(false);
        return;
      }

      // Step 2: Create Topic (include the selected AI model)
      console.log("📝 Creating topic...");
      const topicRes = await fetch("/api/topics/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicTitle: lessonTopic || "Untitled Topic",
          teachingStyle,
          fileId: fileIds, // Pass multiple file IDs if present
          aiModel,         // Pass the user-selected AI model
        }),
      });

      const topicData = await topicRes.json();
      console.log("📥 Topic API Response:", topicData);

      if (!topicRes.ok || !topicData.topicId) {
        alert("Error creating topic.");
        setUploading(false);
        return;
      }

      topicId = topicData.topicId;
      console.log("🆔 Topic Created:", topicId);

      // Step 3: Generate Lessons
      const depth = teachingStyle === "Simple" ? 3 : teachingStyle === "Intermediate" ? 5 : 10;
      console.log("📚 Generating lessons...");

      const lessonRes = await fetch("/api/lesson/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId,
          content: filePaths.length > 0 ? filePaths : lessonTopic,
          depth,
          aiModel, // Pass the chosen AI model along – or alternatively use the one stored in the Topic document.
        }),
      });

      const lessonData = await lessonRes.json();
      console.log("📥 Lesson API Response:", lessonData);

      if (!lessonRes.ok || !lessonData.success) {
        alert("Error generating lessons.");
        setUploading(false);
        return;
      }

      console.log("✅ Lessons Generated:", lessonData.lessons);

      // Step 4: Redirect to Chat Page
      router.push(`/chatbot?topicId=${topicId}&lesson=lesson1`);
    } catch (error) {
      console.error("❌ Error generating lessons:", error);
      alert("An error occurred while generating lessons.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Upload Lesson or Enter a Topic</h2>

        {/* File Upload Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Choose Files (PDF/DOCX)</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full text-white bg-gray-700 p-2 rounded-md"
          />
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
            <option value="Simple">Simple (3 Lessons)</option>
            <option value="Intermediate">Intermediate (5 Lessons)</option>
            <option value="Advanced">Advanced (10 Lessons)</option>
          </select>
        </div>

        {/* Dropdown for AI Model Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select AI Model</label>
          <select
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md"
          >
            <option value="gpt">GPT</option>
            <option value="llama">Llama</option>
            <option value="gemini">Gemini</option>
            <option value="deepseek">Deepseek</option>
          </select>
        </div>

        {/* Generate Lesson Button */}
        <button
          onClick={handleGenerateLesson}
          disabled={uploading}
          className={`w-full ${uploading ? "bg-gray-600" : "bg-green-500 hover:bg-green-600"} text-white font-semibold py-2 rounded-md transition`}
        >
          {uploading ? "Generating..." : "Generate Lesson"}
        </button>
      </div>
    </div>
  );
}

export const runtime = "nodejs"; // Ensure Node.js runtime
