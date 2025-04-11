"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { FaGoogle, FaGithub } from "react-icons/fa";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = emailIsValid && password;

  // ✅ Auto scroll to bottom on load
  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md bg-white border-4 border-greenAccent rounded-xl shadow-lg p-8 text-black space-y-6">

        {/* Title */}
        <h1 className="text-3xl font-bold text-center">Login to AI Tutor</h1>

        {/* Email/password form */}
        <form className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email address"
            className="border border-gray-400 rounded-md p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="border border-gray-400 rounded-md p-3 w-full pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-3 text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Login button with tooltip */}
          <div className="relative group w-full">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full font-semibold py-3 px-6 rounded-md transition-all ${
                canSubmit
                  ? "bg-greenAccent text-black hover:scale-105"
                  : "bg-gray-300 text-black cursor-not-allowed"
              }`}
            >
              Login
            </button>

            {!canSubmit && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-sm rounded-md px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-lg">
                {email.trim() === ""
                  ? "Email is required."
                  : !emailIsValid
                  ? "Please enter a valid email."
                  : "Password is required."}
              </div>
            )}
          </div>
        </form>

        {/* Divider */}
        <div className="h-px bg-gray-300 my-2" />

        {/* Social login buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => signIn("google")}
            type="button"
            className="flex items-center justify-center gap-2 bg-greenAccent text-black font-semibold py-3 px-6 rounded-md hover:scale-105 transition-all w-full"
          >
            <FaGoogle />
            Login with Google
          </button>

          <button
            onClick={() => signIn("github")}
            type="button"
            className="flex items-center justify-center gap-2 bg-black text-white font-semibold py-3 px-6 rounded-md hover:scale-105 transition-all w-full"
          >
            <FaGithub />
            Login with GitHub
          </button>
        </div>

        {/* Footer link */}
        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-greenAccent hover:underline font-semibold">
            Sign up here
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
