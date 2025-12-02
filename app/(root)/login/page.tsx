"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { FaGoogle, FaGithub } from "react-icons/fa";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = emailIsValid && password;

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "AccessDenied") {
      setError(
        "This email is already registered with a password. Please use email/password to log in."
      );
    }
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (result?.error) {
      setError(result.error);
    } else {
      window.location.href = "/";
    }
  };

const handleGuestLogin = async () => {
  const result = await signIn("credentials", {
    redirect: false,
    email: "guest@demo.com",
    password: "Golem2019@",
  });
  if (!result?.error) {
    window.location.href = "/";
  } else {
    setError(result.error || "Guest login failed.");
  }
};


  return (
    <main className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="w-full max-w-md bg-white border-4 border-greenAccent rounded-xl shadow-lg p-8 text-black space-y-6">
        <h1 className="text-3xl font-bold text-center">Login to AI Tutor</h1>
        {error && (
          <p className="text-center text-red-500 font-semibold">{error}</p>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
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

        <div className="h-px bg-gray-300 my-2" />

        <div className="flex flex-col gap-4">
          {/* Guest Login */}
          <button
            onClick={handleGuestLogin}
            type="button"
            className="flex items-center justify-center gap-2 bg-yellow-400 text-black font-semibold py-3 px-6 rounded-md hover:scale-105 transition-all w-full"
          >
            Login as Guest
          </button>

          {/* Social Logins */}
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

        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="text-greenAccent hover:underline font-semibold"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
