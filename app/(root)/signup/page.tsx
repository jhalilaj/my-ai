"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { Github, Mail } from "lucide-react"; // Optional icon set for consistency

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isMatching = confirmPassword === password && confirmPassword.length > 0;
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const canSubmit = emailIsValid && password && confirmPassword && isMatching;

  return (
    <main className="min-h-screen flex items-center justify-center bg-primary text-white px-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row border-4 border-greenAccent rounded-xl shadow-lg overflow-hidden">

        {/* ✅ Left Section */}
        <div className="w-full md:w-1/2 p-8 space-y-6 bg-customDark z-20">
          <h1 className="text-4xl font-bold">
            Join <span className="text-greenAccent">AI Tutor</span>
          </h1>
          <p className="text-lg text-gray-300">
            Sign up to get started with your personal AI-powered tutor. No credit card required.
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => signIn("google")}
              type="button"
              className="flex items-center justify-center gap-2 bg-greenAccent text-black font-semibold py-3 px-6 rounded-md hover:scale-105 transition-all w-full"
            >
              <Mail size={18} />
              Sign up with Google
            </button>

            <button
              onClick={() => signIn("github")}
              type="button"
              className="flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 px-6 rounded-md hover:scale-105 transition-all w-full"
            >
              <Github size={18} />
              Sign up with GitHub
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-greenAccent hover:underline">
              Login here
            </Link>
          </p>
        </div>

        {/* ✅ Divider with blur */}
        <div className="hidden md:block w-[2px] bg-white/20 blur-lg" />

        {/* ✅ Right Section */}
        <div className="w-full md:w-1/2 p-8 bg-white text-black space-y-4 z-20">
          <h2 className="text-2xl font-semibold mb-2">Or sign up with Email</h2>

          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email address"
              className="border border-gray-400 rounded-md p-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password input with toggle */}
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

            {/* Confirm password with validation */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                className={`border rounded-md p-3 w-full pr-10 ${
                  confirmPassword.length > 0
                    ? isMatching
                      ? "border-green-500"
                      : "border-red-500"
                    : "border-gray-400"
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-3 top-3 text-gray-600"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Create Account Button + Tooltip */}
            <div className="relative group w-full">
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full text-black font-semibold py-3 px-6 rounded-md transition-all ${
                  canSubmit
                    ? "bg-greenAccent hover:scale-105"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Create Account
              </button>

              {!canSubmit && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-sm rounded-md px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-lg">
                  {email.trim() === ""
                    ? "Email is required."
                    : !emailIsValid
                    ? "Please enter a valid email."
                    : !password
                    ? "Password is required."
                    : !confirmPassword
                    ? "Confirm your password."
                    : "Passwords do not match."}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default SignupPage;
