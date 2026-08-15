"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ccc } from "@ckb-ccc/connector-react"
import { shannonsToCkb } from "@/lib/ckb-convert"
import {
  ChevronLeft,
  Lock,
  FileSignature,
  Loader2,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react"

type ContestFromDB = {
  id: string
  title: string
  entry_type: string
  reward: number
  deadline: string
  creator_address: string
  tx_hash: string
}

type Step = "idle" | "signing" | "broadcasting" | "saving" | "done"

export default function SubmitEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const signer = ccc.useSigner()

  const [contestId, setContestId] = useState("")
  const [contest, setContest] = useState<ContestFromDB | null>(null)
  const [contestLoading, setContestLoading] = useState(true)
  const [contestError, setContestError] = useState("")

  const [caption, setCaption] = useState("")
  const [projectUrl, setProjectUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<Step>("idle")

  const stepLabel: Record<Step, string> = {
    idle: "Submit Entry",
    signing: "Waiting for wallet...",
    broadcasting: "Broadcasting to CKB...",
    saving: "Saving entry...",
    done: "Done!",
  }

  // ── Resolve params (Next.js 15) ─────────────────────────
  useEffect(() => {
    params.then((p) => setContestId(p.id))
  }, [params])

  // ── Fetch contest details ───────────────────────────────
  useEffect(() => {
    if (!contestId) return

    const fetchContest = async () => {
      try {
        const res = await fetch(`/api/contests/${contestId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setContest(data.contest)
      } catch (err: any) {
        setContestError(err.message || "Contest not found")
      } finally {
        setContestLoading(false)
      }
    }

    fetchContest()
  }, [contestId])

  const isValid = caption.trim().length > 0 && projectUrl.trim().length > 0

  // ── Submit handler ──────────────────────────────────────
  const handleSubmit = async () => {
    if (!isValid) {
      setError("Please fill in both the caption and project link.")
      return
    }

    if (!signer) {
      setError("Please connect your CKB wallet first.")
      return
    }

    if (!contest) return

    setLoading(true)
    setError("")

    try {
      setStep("signing")
      const address = await signer.getRecommendedAddress()

      // Contest outpoint = contest TX hash + output index 0
      const contestOutpoint = `${contest.tx_hash}:0x0`

      // Build entry data for on-chain storage
      const entryData = {
        contestId,
        contestOutpoint, // ← now verifiable from chain
        caption,
        projectUrl,
        creator: address,
        timestamp: new Date().toISOString(),
        platform: "ContestLedger",
      }

      // Convert to hex
      const entryBytes = new TextEncoder().encode(JSON.stringify(entryData))
      const entryHex =
        "0x" +
        Array.from(entryBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")

      // Get creator lock script
      const { script: creatorLock } = await ccc.Address.fromString(
        address,
        signer.client
      )

      // Calculate capacity with buffer
      const minCapacity =
        BigInt(61 + entryBytes.length + 500) * BigInt(100000000)

      // Build transaction
      const tx = ccc.Transaction.from({
        outputs: [{ capacity: minCapacity, lock: creatorLock }],
        outputsData: [entryHex],
      })

      await tx.completeInputsByCapacity(signer)
      await tx.completeFeeBy(signer, 1000)

      // Sign and broadcast
      setStep("broadcasting")
      const txHash = await signer.sendTransaction(tx)
      console.log("Entry TX hash:", txHash)

      // Save to SQLite
      setStep("saving")
      const res = await fetch("/api/entries/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contestId,
          contestOutpoint,
          caption,
          projectUrl,
          txHash,
          creatorAddress: address,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Redirect back to contest
      setStep("done")
      router.push(`/contest/${contestId}`)
    } catch (err: any) {
      console.error("Submit error:", err)
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
      setStep("idle")
    }
  }

  // ── Loading contest ─────────────────────────────────────
  if (contestLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="font-body">Loading contest...</span>
      </div>
    )
  }

  // ── Contest not found ───────────────────────────────────
  if (contestError || !contest) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="mb-4 font-body text-red-400">❌ {contestError}</p>
        <Link href="/browse" className="btn-outline">
          ← Back to contests
        </Link>
      </div>
    )
  }

  const isEnded = new Date(contest.deadline) < new Date()
  const shortAddress = signer ? "Connected ✓" : "Not connected"

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Back */}
      <Link
        href={`/contest/${contestId}`}
        className="mb-6 flex items-center gap-1 font-body text-sm text-muted transition-colors hover:text-text"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to contest
      </Link>

      <h1 className="mb-1 font-display text-3xl font-bold text-text">
        Submit your entry
      </h1>
      <p className="mb-8 font-body text-muted">{contest.title}</p>

      {/* Contest ended warning */}
      {isEnded && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          ❌ This contest has ended. Submissions are closed.
        </div>
      )}

      <div className="card flex flex-col gap-6 p-6 sm:p-8">
        {/* Wallet status */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 p-3">
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`h-2 w-2 rounded-full ${
                signer ? "bg-accent" : "bg-red-400"
              }`}
            />
            <span className="font-body text-muted">Wallet</span>
            <span className="font-mono text-xs text-text">{shortAddress}</span>
          </div>
          <span className="ckb-lock-pill text-xs">
            <Lock className="h-3 w-3" />
            {shannonsToCkb(contest.reward).toLocaleString()} CKB locked
          </span>
        </div>

        {/* Project URL */}
        <div>
          <label className="mb-2 block font-display text-sm font-medium text-text">
            Project link <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <LinkIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=... or any public link"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              className="input pl-9"
              disabled={isEnded || loading}
            />
          </div>
          <p className="mt-1.5 font-body text-xs text-muted">
            Link to where voters can see your work — YouTube, TikTok, Instagram,
            SoundCloud, GitHub, Google Drive, etc.
          </p>

          {/* Preview link if valid URL */}
          {projectUrl.length > 0 && (
            <a
              href={projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Preview link
            </a>
          )}
        </div>

        {/* Caption */}
        <div>
          <label className="mb-2 block font-display text-sm font-medium text-text">
            Caption <span className="text-red-400">*</span>
          </label>
          <textarea
            placeholder="Tell voters what makes your entry special..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="textarea"
            disabled={isEnded || loading}
          />
          <p className="mt-1.5 font-body text-xs text-muted">
            {caption.length}/280 characters
          </p>
        </div>

        {/* Wallet warning */}
        {!signer && (
          <div className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3">
            <span className="text-sm text-yellow-400">⚠️</span>
            <p className="text-sm text-yellow-400">
              Connect your CKB wallet to submit an entry
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            ❌ {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 font-body text-xs text-muted">
            <FileSignature className="h-3.5 w-3.5" />
            Requires 1 wallet signature · Stored on CKB
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/contest/${contestId}`}
              className="btn-outline px-4 py-2 text-sm"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading || !isValid || !signer || isEnded}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {stepLabel[step]}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
