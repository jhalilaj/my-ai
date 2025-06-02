"use client";
import { FaGoogle, FaGithub, FaUser } from "react-icons/fa";
import React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: "🤖",
    title: "Automates Lesson Creation",
    description:
      "Generates a structured sequence of 10–30 lessons from uploaded materials or chosen topics, with no prompt crafting required.",
  },
  {
    icon: "🔄",
    title: "Maintains Context",
    description:
      "Keeps each lesson’s dialogue isolated so questions and clarifications stay focused on the current topic.",
  },
  {
    icon: "📝",
    title: "Instant Assessment",
    description:
      "Creates and grades quizzes for each lesson, giving students immediate feedback.",
  },
  {
    icon: "📊",
    title: "Tracks Progress",
    description:
      "Presents a simple dashboard of completed lessons and quiz results to motivate and guide learners.",
  },
  {
    icon: "🧠",
    title: "Multiple AI Engines",
    description:
      "Choose from Gemini, GPT, Llama or DeepSeek to power your personalized tutoring experience.",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen text-white bg-customDark custom-scrollbar overflow-y-auto">
      <section className="flex flex-col md:flex-row items-center justify-between min-h-screen px-6 bg-customDark">

        <div className="md:w-1/2 text-center md:text-left flex flex-col justify-center px-16">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-greenAccent to-white">
              AI Tutor
            </span>
          </h1>
          <p className="text-xl mb-6 max-w-2xl mx-auto md:mx-0">
            Learn faster and more efficiently with your personal AI-powered tutor.
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
  
            <button
              onClick={() => router.push("/signup")}
              className="flex items-center gap-2 w-[250px] px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-greenAccent hover:text-black border border-black transition"
            >
              <FaUser />
              Sign up with Email
            </button>

            <button
              onClick={() => signIn("google")}
              className="flex items-center gap-2 w-[250px] px-6 py-3 bg-greenAccent text-black font-bold rounded-lg hover:bg-white hover:text-greenAccent border border-black transition"
            >
              <FaGoogle />
              Sign up with Google
            </button>

            <button
              onClick={() => signIn("github")}
              className="flex items-center gap-2 w-[250px] px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-greenAccent hover:text-black border border-black transition"
            >
              <FaGithub />
              Sign up with GitHub
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            Sign up to get started. No credit card required.
          </p>
        </div>
        <div className="md:w-1/2 flex justify-center mt-10 md:mt-0">
          <img
            src="/images/HomePageImg.png"
            alt="AI Tutor illustration"
            className="w-full max-w-lg rounded-lg shadow-lg border-4 border-greenAccent"
          />
        </div>
      </section>
      <section className="py-16 px-6 bg-black">
        <h2 className="text-4xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-greenAccent to-white">
          Unlock Your Potential with AI Tutor
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-b from-greenAccent to-black p-6 rounded-lg shadow-lg hover:shadow-xl transition flex flex-col items-start"
            >
              <div className="w-12 h-12 bg-black text-greenAccent flex items-center justify-center rounded-full text-2xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-200">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="py-16 px-6 bg-customGray">
        <h2 className="text-4xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-greenAccent to-white">
          Learn Like Never Before
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-b from-greenAccent to-customGray p-6 rounded-lg">
            <p>
              "AI Tutor helped me master coding in record time. I can't believe
              how easy it is to use and how much I learned in just a few weeks."
            </p>
            <p className="text-right text-greenAccent mt-4">- John Doe</p>
          </div>
          <div className="bg-gradient-to-b from-greenAccent to-customGray p-6 rounded-lg">
            <p>
              "This platform is a game-changer. The personalized learning paths
              made a huge difference for me."
            </p>
            <p className="text-right text-greenAccent mt-4">- Jane Smith</p>
          </div>
        </div>
      </section>

      <footer className="py-10 bg-customDark text-center">
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-greenAccent to-white">
          Ready to Get Started?
        </h2>
        <button
          onClick={() => router.push("/signup")}
          className="px-6 py-3 bg-greenAccent text-black font-semibold rounded-lg hover:bg-white hover:text-greenAccent border border-black transition"
        >
          Start Learning Now →
        </button>
      </footer>
    </div>
  );
}
