"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type RequestedType = "vendor" | "other";

function LoginContent() {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [requestedType, setRequestedType] = useState<RequestedType>("vendor");
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
      let authEmail = email.trim();

      // Allow 'admin' to bypass email formatting
      if (!authEmail.includes('@')) {
        if (authEmail.toLowerCase() === 'admin') {
          authEmail = 'admin@cctv.com';
        } else {
          setErrorMsg("Please enter a valid email address.");
          setLoading(false);
          return;
        }
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: {
            data: {
              full_name: fullName || null,
              company_name: requestedType === "vendor" ? companyName || null : null,
              requested_type: requestedType,
            },
          },
        });
        if (error) {
          setErrorMsg("Registration failed: " + error.message);
        } else {
          setSuccessMsg(
            "Registration successful. Your account will be reviewed by an administrator before access is granted.",
          );
          setIsSignUp(false);
          setPassword("");
        }
      } else {
        // Login flow
        const { error, data } = await supabase.auth.signInWithPassword({ email: authEmail, password });
        if (error) {
          setErrorMsg("Login failed: " + error.message);
        } else if (data.user) {
          const hostname = window.location.hostname;
          if (hostname.includes('sales.') || hostname.includes('vendor.') || hostname.includes('finance.')) {
            window.location.href = "/";
          } else {
            window.location.href = "/";
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred. Please check your network or credentials.";
      setErrorMsg(msg);
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
          <div className="relative w-48 h-20 mb-4 bg-white rounded-xl p-2 shadow-sm border border-slate-200">
            <Image
              src="/logo-transparent.png"
              alt="PT.PN Logo"
              fill
              className="object-contain p-2"
              priority
            />
          </div>
          <h1 className="text-2xl font-syne font-bold text-white text-center tracking-tight">
            PT. Pantauan Nusantara
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-widest">CCTV Project Survey Portal</p>
        </div>

        {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
          <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/50 rounded-lg text-orange-400 text-sm">
            <strong>Environment Variables Missing:</strong> Please add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your Vercel Project Settings and <strong>redeploy</strong>.
          </div>
        )}

        {searchParams?.get("reason") === "no_role" && !errorMsg && !successMsg && (
          <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/50 rounded-lg text-orange-300 font-medium text-xs text-center">
            Your account does not have any roles yet. Please wait for an administrator to approve and assign access.
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 font-medium text-sm text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/50 rounded-lg text-emerald-400 font-medium text-sm text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Username or Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 rounded-lg transition-all font-medium"
              placeholder="admin"
              required
            />
          </div>
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 rounded-lg transition-all font-medium"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-300 mb-2">
                  I am registering as
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestedType("vendor")}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-semibold ${
                      requestedType === "vendor"
                        ? "border-sky-500 bg-sky-500/10 text-sky-300"
                        : "border-slate-700 bg-slate-900 text-slate-300"
                    }`}
                  >
                    Vendor
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestedType("other")}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-semibold ${
                      requestedType === "other"
                        ? "border-slate-500 bg-slate-500/10 text-slate-200"
                        : "border-slate-700 bg-slate-900 text-slate-300"
                    }`}
                  >
                    Other
                  </button>
                </div>
              </div>
              {requestedType === "vendor" && (
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 rounded-lg transition-all font-medium"
                    placeholder="Vendor company"
                    required
                  />
                </div>
              )}
          </>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 rounded-lg transition-all font-medium"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider text-sm mt-4"
          >
            {loading ? "Authenticating..." : (isSignUp ? "Create Account" : "Sign In")}
          </button>

          <div className="text-center mt-6 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); setSuccessMsg(""); }}
              className="text-sm font-semibold text-slate-400 hover:text-white transition-colors focus:outline-none"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Register"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
