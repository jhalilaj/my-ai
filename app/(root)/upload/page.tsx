"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lessonTopic, setLessonTopic] = useState("");
  const [teachingStyle, setTeachingStyle] = useState("Simple");
  const [uploading, setUploading] = useState(false);

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

    setUploading(true);
    let fileId = null;
    let fileContent = null;
    let topicId = null;

    try {
      // ✅ Step 1: Upload File if Selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        console.log("📤 Uploading file...");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          alert("Error uploading file.");
          setUploading(false);
          return;
        }

        fileId = uploadData.fileId;
        fileContent = uploadData.filePath; // ✅ Extracted file text

        console.log("✅ File uploaded successfully:", fileId);
      }

      if (!lessonTopic && !fileId) {
        alert("Please enter a topic title or upload a file.");
        setUploading(false);
        return;
      }

      // ✅ Step 2: Create Topic
      console.log("📝 Creating topic...");
      const topicRes = await fetch("/api/topics/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicTitle: lessonTopic || "Untitled Topic",
          teachingStyle,
          fileId,
        }),
      });

      const topicData = await topicRes.json();
      console.log("📥 Topic API Response:", topicData); // ✅ Debugging log

      if (!topicRes.ok || !topicData.topicId) {
        alert("Error creating topic.");
        setUploading(false);
        return;
      }

      topicId = topicData.topicId;
      console.log("🆔 Topic Created:", topicId);

      // ✅ Step 3: Generate Lessons
      const depth = teachingStyle === "Simple" ? 3 : teachingStyle === "Intermediate" ? 5 : 10;
      console.log("📚 Generating lessons...");

      console.log("📤 Sending Request to /api/lesson/generate:", {
        topicId,
        content: fileContent || lessonTopic,
        depth,
      });

      const lessonRes = await fetch("/api/lesson/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId,
          content: fileContent || lessonTopic,
          depth,
        }),
      });

      const lessonData = await lessonRes.json();
      console.log("📥 Lesson API Response:", lessonData); // ✅ Debugging log

      if (!lessonRes.ok || !lessonData.success) {
        alert("Error generating lessons.");
        setUploading(false);
        return;
      }

      console.log("✅ Lessons Generated:", lessonData.lessons);

      // ✅ Step 4: Redirect to Chat Page with Topic
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
            <option value="Simple">Simple (3 Lessons)</option>
            <option value="Intermediate">Intermediate (5 Lessons)</option>
            <option value="Advanced">Advanced (10 Lessons)</option>
          </select>
        </div>

        {/* Generate Lesson Button */}
        <button
          onClick={handleGenerateLesson}
          disabled={uploading}
          className={`w-full ${
            uploading ? "bg-gray-600" : "bg-green-500 hover:bg-green-600"
          } text-white font-semibold py-2 rounded-md transition`}
        >
          {uploading ? "Generating..." : "Generate Lesson"}
        </button>
      </div>
    </div>
  );
}
