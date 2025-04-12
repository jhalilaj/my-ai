"use client";
import { FaGoogle, FaGithub, FaUser } from "react-icons/fa";
import React from "react";
import { signIn } from "next-auth/react";
import { Mail, Github, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    return (
        <div className="min-h-screen text-white bg-customDark custom-scrollbar overflow-y-auto">

            {/* Hero Section */}
            <section className="flex flex-col md:flex-row items-center justify-between min-h-screen px-6 bg-customDark">
                {/* Text Section */}
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
                        {/* Email */}
                        <button
                            onClick={() => router.push("/signup")}
                            className="flex items-center gap-2 w-[250px] px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-greenAccent hover:text-black border border-black transition"
                        >
                            <FaUser />
                            Sign up with Email
                        </button>

                        {/* Google */}
                        <button
                            onClick={() => signIn("google")}
                            className="flex items-center gap-2 w-[250px] px-6 py-3 bg-greenAccent text-black font-bold rounded-lg hover:bg-white hover:text-greenAccent border border-black transition"
                        >
                            <FaGoogle />
                            Sign up with Google
                        </button>

                        {/* GitHub */}
                        <button
                            onClick={() => signIn("github")}
                            className="flex items-center gap-2 w-[250px] px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-greenAccent hover:text-black border border-black transition"
                        >
                            <FaGithub />
                            Sign up with GitHub
                        </button>
                    </div>


                    <p className="mt-4 text-sm text-gray-400">
                        Sign Up to get started. No credit card required.
                    </p>
                </div>

                {/* Image Section */}
                <div className="md:w-1/2 flex justify-center mt-10 md:mt-0">
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRunmi53X6qZ4xx-toqwEhtqnCtlOqfl0VAVg&s"
                        alt="AI Tutor illustration"
                        className="w-full max-w-lg rounded-lg shadow-lg border-4 border-greenAccent"
                    />
                </div>
            </section>

            {/* Feature Highlight Section */}
            <section className="py-16 px-6 bg-black">
                <h2 className="text-4xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-greenAccent to-white">
                    Unlock Your Potential with AI Tutor
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Personalized Learning Paths",
                            description:
                                "Tailored educational journeys based on your strengths and weaknesses.",
                            icon: "🧑‍🎓",
                        },
                        {
                            title: "Voice-Activated Learning",
                            description:
                                "Engage hands-free with AI and receive verbal explanations.",
                            icon: "🎙️",
                        },
                        {
                            title: "AI-Powered Study Partner",
                            description:
                                "Organize your study schedule and track progress with AI.",
                            icon: "📘",
                        },
                        {
                            title: "Instant Help with Any Topic",
                            description:
                                "Get immediate, step-by-step assistance from AI 24/7.",
                            icon: "💡",
                        },
                    ].map((feature, index) => (
                        <div
                            key={index}
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

            {/* Testimonial Section */}
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

            {/* Footer Call-to-Action */}
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
