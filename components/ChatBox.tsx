"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

interface ChatBoxProps {
  lessonId: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ lessonId }) => {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ sender: string; text?: string; image?: string }[]>([]);
  const [lessonBHistory, setLessonBHistory] = useState<string>("");
  const [exampleGenerated, setExampleGenerated] = useState(false); // ✅ Track if example is generated
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchChats();
    }
  }, [session, lessonId]);

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

        // ✅ Check if the example was already generated
        if (data.exampleGenerated) {
          setExampleGenerated(true);
        }
      }

      // ✅ Fetch Lesson B history ONLY if Lesson C has no example generated
      if (lessonId === "lesson3" && !exampleGenerated) {
        fetchLessonBHistory();
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchLessonBHistory = async () => {
    try {
      const res = await fetch(`/api/chat/get?lessonId=lesson2`);
      if (!res.ok) throw new Error(`Failed to fetch Lesson B. Status: ${res.status}`);

      const data = await res.json();
      const combinedHistory = data.chats
        .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
        .join("\n");

      setLessonBHistory(combinedHistory);

      // ✅ Generate the example ONLY if it hasn't been generated
      generateExampleOnce(combinedHistory);
    } catch (error) {
      console.error("Error fetching Lesson B history:", error);
    }
  };

  const generateExampleOnce = async (lessonBContent: string) => {
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Based on the following conversation:\n${lessonBContent}\n\nGive me an example.`,
        }),
      });

      if (!res.ok) throw new Error(`Failed to get AI response. Status: ${res.status}`);

      const data = await res.json();
      const botResponse = data.message || "Error fetching response.";

      // ✅ Display only the bot’s response
      setChatHistory((prev) => [...prev, { sender: "Bot", text: botResponse }]);

      // ✅ Save the bot’s response AND mark the example as generated
      await fetch("/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.email,
          lessonId,
          exampleGenerated: true, // ✅ Mark example as generated in DB
          messages: [{ role: "assistant", content: botResponse }],
        }),
      });

      setExampleGenerated(true); // ✅ Prevent future generations
    } catch (error) {
      console.error("Error generating example:", error);
      setChatHistory((prev) => [...prev, { sender: "Bot", text: "Network error." }]);
    } finally {
      setLoading(false);
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
      const prompt =
        lessonId === "lesson3"
          ? `Based on the previous conversation from Lesson B:\n${lessonBHistory}\n\nNow answer this:\n${message}`
          : message;

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
    <div className="flex flex-col h-screen w-full bg-customDark text-white">
      <div className="flex justify-between p-4 bg-customGray border-b border-gray-700">
        <div className="font-bold text-lg">Chatbot - {lessonId}</div>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-grow bg-customDark overflow-y-auto p-6 text-gray-300 rounded-md min-h-[60vh] sm:min-h-[65vh] lg:min-h-[70vh] custom-scrollbar"
      >
        <div className="space-y-6">
          {chatHistory.map((msg, index) => (
            <div key={index} className="whitespace-pre-wrap break-words">
              <span
                className={`font-semibold ${
                  msg.sender === "You" ? "text-greenAccent" : "text-white"
                }`}
              >
                {msg.sender}:
              </span>{" "}
              {msg.text}
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 bg-customGray">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask a question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border-2 border-black bg-customDark text-white rounded-lg p-5"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-md hover:bg-greenAccent"
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
