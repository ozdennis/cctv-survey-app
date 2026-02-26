"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formattedEmail = `${username.trim()}@cctv.com`;

      if (isSignUp) {
        // Sign up flow
        const { error, data } = await supabase.auth.signUp({ email: formattedEmail, password });
        if (error) {
          setErrorMsg("Registration failed: " + error.message);
        } else {
          setSuccessMsg("Registration successful! You can now sign in.");
          setIsSignUp(false);
          setPassword("");
        }
      } else {
        // Login flow
        const { error, data } = await supabase.auth.signInWithPassword({ email: formattedEmail, password });
        if (error) {
          setErrorMsg("Login failed: " + error.message);
        } else if (data.user) {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please check your network or credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen" />

      <main className="relative z-10 w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 mb-4 bg-white/10 rounded-full p-2">
            <Image
              src="/logo.svg"
              alt="Company Logo"
              fill
              className="object-contain drop-shadow-md brightness-200 invert"
            />
          </div>
          <h1 className="text-2xl font-bold text-white text-center">
            PT. Pantauan Nusantara
          </h1>
          <p className="text-sm text-slate-400">CCTV Project Survey Portal</p>
        </div>

        {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
          <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/50 rounded-lg text-orange-400 text-sm">
            <strong>Environment Variables Missing:</strong> Please add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your Vercel Project Settings and <strong>redeploy</strong>.
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent rounded-lg transition-all"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-primary focus:border-transparent rounded-lg transition-all"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : (isSignUp ? "Create Account" : "Sign In")}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); setSuccessMsg(""); }}
              className="text-sm text-slate-400 hover:text-primary transition-colors focus:outline-none focus:underline"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Register"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
