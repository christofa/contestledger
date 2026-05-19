"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Zap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  Shield,
  Trophy,
  Wallet,
} from "lucide-react"
import { ccc } from "@ckb-ccc/connector-react"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

type Mode = "login" | "signup"

const trustPoints = [
  {
    icon: <Shield className="h-4 w-4 text-accent" />,
    text: "Rewards secured in escrow",
  },
  {
    icon: <Trophy className="h-4 w-4 text-warning" />,
    text: "Wins proven forever on-chain",
  },
  {
    icon: <Zap className="h-4 w-4 text-primary" />,
    text: "Instant Fiber Network voting",
  },
]

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { data: session, isPending } = authClient.useSession()
  const { open, isOpen, signerInfo, wallet } = ccc.useCcc()
  const signer = ccc.useSigner()

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/profile")
    }
  }, [isPending, router, session])

  useEffect(() => {
    if (signer) {
      router.replace("/profile")
    }
  }, [router, signer])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (mode === "login") {
        const { error } = await authClient.signIn.email({
          email,
          password,
        })

        if (error) {
          throw new Error(error.message || "Sign in failed")
        }

        router.push("/profile")
        return
      }

      const { error } = await authClient.signUp.email({
        email,
        password,
        name: username,
      })

      if (error) {
        throw new Error(error.message || "Sign up failed")
      }

      router.push("/profile")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Authentication failed"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleWalletConnect() {
    setLoading(true)
    setError("")

    try {
      if (!signer) {
        await open()
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Wallet connection failed"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#7c5cfc 1px, transparent 1px), linear-gradient(90deg, #7c5cfc 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative hidden flex-col justify-between border-r border-border p-14 lg:flex lg:w-1/2">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-bold"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="gradient-text">ContestLedger</span>
        </Link>

        <div className="flex flex-col gap-8">
          <div>
            <p className="mb-4 font-mono text-xs tracking-widest text-accent uppercase">
              The on-chain contest platform
            </p>
            <h2 className="font-display text-4xl leading-tight font-bold text-text xl:text-5xl">
              Compete. Win.
              <br />
              <span className="gradient-text">Get paid.</span>
              <br />
              Forever on-chain.
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { val: "1,284", label: "Contests" },
              { val: "9.2M", label: "CKB Paid" },
              { val: "42K+", label: "Creators" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border bg-surface p-4 text-center"
              >
                <p className="gradient-text font-display text-xl font-bold">
                  {stat.val}
                </p>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {trustPoints.map((point, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                  {point.icon}
                </div>
                <span className="font-body text-sm text-text-2">
                  {point.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="font-body text-sm leading-relaxed text-text-2 italic">
            "I submitted a skate reel and won 5,000 CKB. The payout hit my
            wallet the second voting closed. Zero waiting, zero middlemen."
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
              <span className="text-xs font-bold text-white">K</span>
            </div>
            <div>
              <p className="font-display text-xs font-semibold text-text">
                @kira
              </p>
              <p className="font-mono text-[10px] text-muted">
                3x Contest Winner
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center px-6 py-16 sm:px-12 lg:w-1/2">
        <Link
          href="/"
          className="mb-10 flex items-center gap-2 font-display text-lg font-bold lg:hidden"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text">ContestLedger</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-text">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 font-body text-sm text-muted">
              {mode === "login"
                ? "Sign in to access your profile, contests, and rewards."
                : "Join the on-chain contest platform. No gas fees to sign up."}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="mb-8 flex items-center rounded-xl border border-border bg-surface p-1">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m)
                  setError("")
                }}
                className={cn(
                  "flex-1 rounded-lg py-2.5 font-display text-sm font-medium transition-all duration-200",
                  mode === m
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-muted hover:text-text"
                )}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleWalletConnect}
            disabled={loading || isOpen}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface py-3 font-display text-sm font-medium text-text transition-all duration-200 hover:border-border-bright hover:bg-surface-2 disabled:opacity-50"
          >
            <Wallet className="h-4 w-4 text-accent" />
            {loading || isOpen
              ? "Opening wallet..."
              : signer
                ? `Connected: ${wallet?.name ?? "CKB Wallet"}`
                : "Connect CKB Wallet"}
          </button>
          {signerInfo && (
            <p className="mt-3 text-center font-mono text-xs text-accent">
              Wallet connected successfully
            </p>
          )}

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-xs text-muted">
              or continue with
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div>
                <label className="mb-2 block font-display text-xs font-medium tracking-wider text-text-2 uppercase">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="@your_handle"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="input pl-11"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block font-display text-xs font-medium tracking-wider text-text-2 uppercase">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted" />
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

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block font-display text-xs font-medium tracking-wider text-text-2 uppercase">
                  Password
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    className="font-body text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    mode === "signup"
                      ? "Min. 8 characters"
                      : "Enter your password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                  className="input pr-11 pl-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-muted transition-colors hover:text-text"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <p className="font-body text-xs leading-relaxed text-muted">
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

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "btn-primary mt-2 w-full justify-center py-3 text-base transition-all",
                loading && "cursor-not-allowed opacity-70"
              )}
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
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
                      d="M4 12a8 8 0 0 1 8-8v8H4z"
                    />
                  </svg>
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center font-body text-sm text-muted">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup")
                    setError("")
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login")
                    setError("")
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
