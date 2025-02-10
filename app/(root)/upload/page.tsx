"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function UploadPage() {
  const { data: session } = useSession();
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

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      setUploadStatus(`File uploaded successfully: ${data.filePath}`);
      fetchUserFiles();
    } else {
      setUploadStatus("Error uploading file");
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

        {/* Text Input for Manual Lesson Topic */}
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

        {/* Upload & Generate Lesson Button */}
        <button
          onClick={handleUpload}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md transition"
        >
          Generate Lesson
        </button>

        {/* Upload Status Message */}
        {uploadStatus && <p className="mt-4 text-green-400 text-center">{uploadStatus}</p>}

        {/* List of Uploaded Files */}
        <h3 className="text-xl font-semibold mt-6 text-center">Your Uploaded Files</h3>
        <ul className="mt-2 text-sm">
          {files.map((file, index) => (
            <li key={index} className="mt-1 text-blue-400">
              <a href={file.filePath} target="_blank" rel="noopener noreferrer">
                {file.fileName}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
