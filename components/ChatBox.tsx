"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // ✅ GitHub-style markdown support

interface ChatBoxProps {
  lessonId: string;
  fileContent?: string | null;
}

const ChatBox: React.FC<ChatBoxProps> = ({ lessonId, fileContent }) => {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ sender: string; text?: string; image?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchChats();
      fetchLessonContent();
    }
  }, [session, lessonId]);

  const fetchLessonContent = async () => {
    try {
      const res = await fetch(`/api/lesson/get-single?lessonId=${lessonId}`);
      if (!res.ok) throw new Error(`Failed to fetch lesson content. Status: ${res.status}`);
      const data = await res.json();
      setLessonContent(data.lesson?.content || "Lesson content not available.");
    } catch (error) {
      console.error("Error fetching lesson content:", error);
    }
  };

  const fetchChats = async () => {
    try {
      const res = await fetch(`/api/chat/get?lessonId=${lessonId}`);
      if (!res.ok) throw new Error(`Failed to fetch chats. Status: ${res.status}`);
      const data = await res.json();
      if (data.chats) {
        const formattedChats = data.chats.map((msg: { role: string; content: string }) => ({
          sender: msg.role === "user" ? "You" : "Bot",
          text: msg.content,
        }));
        setChatHistory(formattedChats);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const handleSend = async () => {
    if (message.trim() === "") return;
    if (!session || !session.user?.email) {
      console.error("User not authenticated");
      return;
    }

    const newUserMessage = { role: "user", content: message };
    setChatHistory((prev) => [...prev, { sender: "You", text: message }]);
    setMessage("");
    setLoading(true);

    try {
      let prompt = `Previous conversation:\n`;
      chatHistory.forEach((msg) => {
        prompt += `${msg.sender}: ${msg.text}\n`;
      });

      if (lessonContent) {
        prompt += `\nLesson Content:\n${lessonContent}\n\n`;
      }

      prompt += `User: ${message}\nAssistant:`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error(`Failed to get AI response. Status: ${res.status}`);

      const data = await res.json();
      let botResponse = data.message || "Error fetching response.";
      const newBotMessage = { role: "assistant", content: botResponse };

      setChatHistory((prev) => [...prev, { sender: "Bot", text: botResponse }]);

      await fetch("/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.email,
          lessonId,
          messages: [newUserMessage, newBotMessage],
        }),
      });
    } catch (error) {
      console.error("Error:", error);
      setChatHistory((prev) => [...prev, { sender: "Bot", text: "Network error." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[70vh] w-full bg-customDark text-white rounded-lg shadow-lg">
      {/* Chat Display */}
      <div
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-6 text-gray-300 rounded-md min-h-[60vh] sm:min-h-[65vh] lg:min-h-[75vh] custom-scrollbar bg-gray-900"
      >
        <div className="space-y-6">
          {/* ✅ Render Lesson Content */}
          {lessonContent && (
            <div className="bg-gray-800 p-4 rounded-md mb-4 text-white">
              <h2 className="font-bold text-lg mb-2">Lesson Content:</h2>
              <ReactMarkdown className="prose prose-invert max-w-none" remarkPlugins={[remarkGfm]}>
                {lessonContent}
              </ReactMarkdown>
            </div>
          )}

          {/* ✅ Chat Messages */}
          {chatHistory.map((msg, index) => (
            <div key={index} className="mb-6">
            <p className={`font-semibold mb-1 ${msg.sender === "You" ? "text-greenAccent" : "text-white"}`}>
              {msg.sender}:
            </p>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.text || ""}
              </ReactMarkdown>
            </div>
          </div>
          
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="p-5 bg-gray-800 rounded-b-lg">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask a question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-greenAccent"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-greenAccent text-black font-bold rounded-md shadow-md hover:bg-green-400 transition"
            disabled={loading}
          >
            {loading ? "⏳" : "➡"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
