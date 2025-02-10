"use client";
import { useState } from "react";

const UploadLesson = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/uploadLesson", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ " + data.message);
      } else {
        setMessage("❌ " + data.error);
      }
    } catch (error) {
      setMessage("❌ Upload failed.");
    }
  };

  return (
    <div className="p-4 border border-gray-700 rounded-md">
      <h2 className="text-lg font-bold mb-2">Upload a Lesson</h2>
      <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="mb-2" />
      <button onClick={handleUpload} className="px-4 py-2 bg-green-500 text-white rounded-md">
        Upload
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default UploadLesson;
