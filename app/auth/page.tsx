"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Lock, Mail, User, ArrowRight, Shield, Trophy, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

const trustPoints = [
  { icon: <Shield className="w-4 h-4 text-accent" />, text: "Rewards secured in escrow" },
  { icon: <Trophy className="w-4 h-4 text-warning" />, text: "Wins proven forever on-chain" },
  { icon: <Zap className="w-4 h-4 text-primary" />, text: "Instant Fiber Network voting" },
];

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate auth — replace this with real CKB wallet auth later
    setTimeout(() => {
      setLoading(false);
      router.push("/profile");
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* ── Background effects ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        {/* Bottom-right glow */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#7c5cfc 1px, transparent 1px), linear-gradient(90deg, #7c5cfc 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── LEFT PANEL (decorative — hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-14 border-r border-border">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="gradient-text">ContestLedger</span>
        </Link>

        {/* Centre content */}
        <div className="flex flex-col gap-8">
          {/* Big headline */}
          <div>
            <p className="text-xs font-mono text-accent uppercase tracking-widest mb-4">
              The on-chain contest platform
            </p>
            <h2 className="font-display font-bold text-4xl xl:text-5xl text-text leading-tight">
              Compete. Win.
              <br />
              <span className="gradient-text">Get paid.</span>
              <br />
              Forever on-chain.
            </h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { val: "1,284", label: "Contests" },
              { val: "9.2M", label: "CKB Paid" },
              { val: "42K+", label: "Creators" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-surface border border-border rounded-2xl p-4 text-center"
              >
                <p className="font-display font-bold text-xl gradient-text">{stat.val}</p>
                <p className="text-xs text-muted font-mono mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Trust points */}
          <div className="flex flex-col gap-3">
            {trustPoints.map((point, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0">
                  {point.icon}
                </div>
                <span className="text-sm text-text-2 font-body">{point.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <p className="text-sm text-text-2 font-body italic leading-relaxed">
            "I submitted a skate reel and won 5,000 CKB. The payout hit my wallet
            the second voting closed. Zero waiting, zero middlemen."
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-xs font-bold text-white">K</span>
            </div>
            <div>
              <p className="text-xs font-display font-semibold text-text">@kira</p>
              <p className="text-[10px] text-muted font-mono">3x Contest Winner</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Auth form ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-12 py-16 relative">
        {/* Mobile logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-display font-bold text-lg mb-10 lg:hidden"
        >
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="gradient-text">ContestLedger</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl text-text">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-muted font-body mt-2 text-sm">
              {mode === "login"
                ? "Sign in to access your profile, contests, and rewards."
                : "Join the on-chain contest platform. No gas fees to sign up."}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center bg-surface border border-border rounded-xl p-1 mb-8">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-2.5 rounded-lg font-display font-medium text-sm transition-all duration-200",
                  mode === m
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-muted hover:text-text"
                )}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

           {/* Wallet connect button */}
          <button className="w-full flex items-center justify-center gap-3 border border-border bg-surface hover:border-border-bright hover:bg-surface-2 text-text font-display font-medium py-3 rounded-xl transition-all duration-200 text-sm">
            <Wallet className="w-4 h-4 text-accent" />
            Connect CKB Wallet
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted font-mono">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username — signup only */}
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-display font-medium text-text-2 uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    placeholder="@your_handle"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={mode === "signup"}
                    className="input pl-11"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-display font-medium text-text-2 uppercase tracking-wider mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input pl-11"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-display font-medium text-text-2 uppercase tracking-wider">
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline font-body"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "signup" ? "Min. 8 characters" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                  className="input pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms — signup only */}
            {mode === "signup" && (
              <p className="text-xs text-muted font-body leading-relaxed">
                By signing up, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "btn-primary w-full justify-center py-3 text-base mt-2 transition-all",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch mode link */}
          <p className="text-center text-sm text-muted font-body mt-8">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-primary font-medium hover:underline"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
