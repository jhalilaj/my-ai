"use client"; // ✅ Add this line

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatBoxProps {
  lessonId: string; // Identifies the current lesson
  chatContent?: string; // Optional prop to pass in pre-generated content for lesson2Plus
}

const ChatBox: React.FC<ChatBoxProps> = ({ lessonId, chatContent }) => {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ sender: string; text?: string; image?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Fetch chat history when component mounts or lesson changes
  useEffect(() => {
    if (session?.user?.email) {
      fetchChats();
    }
  }, [session, lessonId]);

  const fetchChats = async () => {
    try {
      console.log(`Fetching chat history for ${lessonId}...`);
      const res = await fetch(`/api/chat/get?lessonId=${lessonId}`);

      if (!res.ok) {
        throw new Error(`Failed to fetch chats. Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Received chat data:", data);

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
      console.log("Sending message:", message);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: message }),
      });

      if (!res.ok) {
        throw new Error(`Failed to get AI response. Status: ${res.status}`);
      }

      const data = await res.json();
      let botResponse = data.message || "Error fetching response.";

      const newBotMessage = { role: "assistant", content: botResponse };

      if (data.image) {
        setChatHistory((prev) => [...prev, { sender: "Bot", image: data.image }]);
      } else {
        setChatHistory((prev) => [...prev, { sender: "Bot", text: botResponse }]);
      }

      console.log("Saving chat to MongoDB...");
      await fetch("/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.email,
          lessonId, // ✅ Save chat under the specific lesson
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

  // Markdown Renderer with Code Block Styling
  const renderMessage = (msg: { text?: string; image?: string }) => {
    if (msg.image) {
      return (
        <img
          src={msg.image}
          alt="Generated Image"
          className="rounded-lg mt-2 max-w-[300px] sm:max-w-[400px] lg:max-w-[500px] w-full h-auto shadow-lg"
        />
      );
    }

    if (!msg.text) return null;

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-800 text-green-300 p-1 rounded-md">{children}</code>
            );
          },
          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
          h1: ({ children }) => <h1 className="text-2xl font-bold text-white mt-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold text-white mt-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-white mt-2">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc pl-6 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-gray-300">{children}</li>,
          p: ({ children }) => <p className="mb-3 text-gray-300">{children}</p>,
        }}
        className="prose prose-invert max-w-none"
      >
        {msg.text}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-customDark text-white">
      {/* Top Section */}
      <div className="flex justify-between p-4 bg-customGray border-b border-gray-700">
        <div className="font-bold text-lg">Chatbot - {lessonId}</div>
      </div>

      {/* Chat Area */}
      <div ref={chatContainerRef} className="flex-grow bg-customDark overflow-y-auto p-6 text-gray-300 rounded-md min-h-[60vh] sm:min-h-[65vh] lg:min-h-[70vh] custom-scrollbar">
        <div className="space-y-6">
          {chatHistory.map((msg, index) => (
            <div key={index} className="whitespace-pre-wrap break-words">
              <span className={`font-semibold ${msg.sender === "You" ? "text-greenAccent" : "text-white"}`}>
                {msg.sender}:
              </span>{" "}
              {renderMessage(msg)}
            </div>
          ))}
        </div>
      </div>

      {/* Input Section */}
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
          <button onClick={handleSend} className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white rounded-md hover:bg-greenAccent" disabled={loading}>
            {loading ? "⏳" : "➡"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
