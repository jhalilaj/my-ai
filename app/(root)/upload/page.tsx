"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SiOpenai } from "react-icons/si";

const aiModels = [
  {
    value: "gpt",
    label: "GPT",
    icon: <SiOpenai className="w-6 h-6" />,
  },
  {
    value: "llama",
    label: "Llama",
    icon: (
      <Image
        src="/images/Llama.webp"
        alt="Llama Icon"
        width={24}
        height={24}
        className="w-6 h-6"
      />
    ),
  },
  {
    value: "gemini",
    label: "Gemini",
    icon: (
      <Image
        src="/images/gemini.webp"
        alt="Gemini Icon"
        width={24}
        height={24}
        className="w-6 h-6"
      />
    ),
  },
  {
    value: "deepseek",
    label: "Deepseek",
    icon: (
      <Image
        src="/images/deepseek.webp"
        alt="Deepseek Icon"
        width={24}
        height={24}
        className="w-6 h-6"
      />
    ),
  },
];

function AImodelSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = aiModels.find((model) => model.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-3 rounded-md bg-white text-black border border-gray-300 hover:border-black flex items-center justify-between focus:ring-2 focus:ring-greenAccent focus:outline-none"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon}
          <span>{selectedOption?.label || "Select AI Model"}</span>
        </div>
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 text-black">
          {aiModels.map((model) => (
            <li
              key={model.value}
              onClick={() => {
                onChange(model.value);
                setOpen(false);
              }}
              className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            >
              {model.icon}
              <span>{model.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [lessonTopic, setLessonTopic] = useState("");
  const [teachingStyle, setTeachingStyle] = useState("Simple"); 
  const [aiModel, setAiModel] = useState("gpt");
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
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append("file", file);
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
        }
      }

      if (!lessonTopic && filePaths.length === 0) {
        alert("Please enter a topic or upload at least one file.");
        setUploading(false);
        return;
      }

      const topicRes = await fetch("/api/topics/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicTitle: lessonTopic || "Untitled Topic",
          teachingStyle,
          fileId: fileIds,
          aiModel,
        }),
      });
      const topicData = await topicRes.json();
      if (!topicRes.ok || !topicData.topicId) {
        alert("Error creating topic.");
        setUploading(false);
        return;
      }

      topicId = topicData.topicId;
      const depth = teachingStyle === "Simple" ? 3 : teachingStyle === "Intermediate" ? 5 : 10;

      const lessonRes = await fetch("/api/lesson/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId,
          content: filePaths.length > 0 ? filePaths : lessonTopic,
          depth,
          aiModel,
        }),
      });

      const lessonData = await lessonRes.json();
      if (!lessonRes.ok || !lessonData.success) {
        alert("Error generating lessons.");
        setUploading(false);
        return;
      }

      router.push(`/chatbot?topicId=${topicId}&lesson=lesson1`);
    } catch (error) {
      console.error(" Error generating lessons:", error);
      alert("An error occurred while generating lessons.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black p-4">
      <div className="w-full max-w-md rounded-xl shadow-xl border-4 border-greenAccent bg-neutral-900 text-white p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-greenAccent">
          <span className="text-white">Upload</span> Lesson or Enter a Topic
        </h2>

        <div className="mb-6">
          <label className="block text-lg font-medium mb-2 text-gray-300">
            Choose Files (PDF/DOCX)
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full p-3 rounded-md bg-white text-black border border-gray-300 hover:border-black focus:ring-2 focus:ring-greenAccent focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium mb-2 text-gray-300">
            Or Enter a Topic
          </label>
          <input
            type="text"
            value={lessonTopic}
            onChange={(e) => setLessonTopic(e.target.value)}
            placeholder="Enter a lesson topic..."
            className="w-full p-3 rounded-md bg-white text-black border border-gray-300 hover:border-black focus:ring-2 focus:ring-greenAccent focus:outline-none"
          />
        </div>
        <div className="mb-8">
          <label className="block text-lg font-medium mb-2 text-gray-300">
            Select AI Model
          </label>
          <AImodelSelect value={aiModel} onChange={setAiModel} />
        </div>

        <button
          onClick={handleGenerateLesson}
          disabled={uploading}
          className={`w-full py-3 px-6 rounded-md font-semibold transition-all duration-200 ${uploading
            ? "bg-greenAccent opacity-50 text-black cursor-not-allowed"
            : "bg-greenAccent hover:scale-105 text-black"
            }`}
        >
          {uploading ? "Generating..." : "Generate Lesson"}
        </button>
      </div>
    </div>
  );
}

export const runtime = "nodejs";
