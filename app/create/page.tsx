"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ccc } from "@ckb-ccc/connector-react"
import {
  Lock,
  Image as ImageIcon,
  Video,
  FileText,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react"
import { ckbToShannons } from "@/lib/ckb-convert"

type EntryType = "Image" | "Video" | "Text"
type Step = "idle" | "signing" | "broadcasting" | "saving" | "done"

const entryTypes: { type: EntryType; icon: React.ReactNode }[] = [
  { type: "Image", icon: <ImageIcon className="h-5 w-5" /> },
  { type: "Video", icon: <Video className="h-5 w-5" /> },
  { type: "Text", icon: <FileText className="h-5 w-5" /> },
]

const whatHappensNext = [
  "Treasury cell deployed",
  "Contest goes live",
  "Creators submit, voters decide",
  "Winner gets paid + Spore DOB NFT",
]

export default function CreateContestPage() {
  const router = useRouter()
  const signer = ccc.useSigner()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [entryType, setEntryType] = useState<EntryType>("Image")
  const [reward, setReward] = useState("1000")
  const [deadline, setDeadline] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<Step>("idle")

  const stepLabel: Record<Step, string> = {
    idle: `Lock ${reward} CKB & Publish`,
    signing: "Waiting for wallet...",
    broadcasting: "Broadcasting to CKB...",
    saving: "Saving contest...",
    done: "Done!",
  }

  const currentLabel = stepLabel[step]

  const isValid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    reward !== "" &&
    Number(reward) >= 100 &&
    deadline !== ""

  const handlePublish = async () => {
    if (!isValid) {
      setError("Please fill in all fields. Minimum reward is 100 CKB.")
      return
    }
    if (!signer) {
      setError("Please connect your CKB wallet first.")
      return
    }

    setLoading(true)
    setError("")

    try {
      setStep("signing")
      const address = await signer.getRecommendedAddress()

     const contestData = {
  title,
  description,
  entryType,
  reward: Number(ckbToShannons(Number(reward))), // ← store shannons on-chain
  deadline,
  creator: address,
  status: "active",
  createdAt: new Date().toISOString(),
  platform: "ContestLedger",
}

      const contestBytes = new TextEncoder().encode(JSON.stringify(contestData))
      const contestHex =
        "0x" +
        Array.from(contestBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")

      const { script: creatorLock } = await ccc.Address.fromString(
        address,
        signer.client
      )

      const minCapacity =
        BigInt(61 + contestBytes.length + 500) * BigInt(100000000)
 
      const tx = ccc.Transaction.from({
        outputs: [{ capacity: minCapacity, lock: creatorLock }],
        outputsData: [contestHex],
      })

      await tx.completeInputsByCapacity(signer)
      await tx.completeFeeBy(signer, 1000)

      setStep("broadcasting")
      const txHash = await signer.sendTransaction(tx)
      console.log("Contest TX hash:", txHash)

      setStep("saving")
      const res = await fetch("/api/contests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          entryType,
          reward,
          deadline,
          txHash,
          creatorAddress: address,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setStep("done")
      router.push("/browse")
    } catch (err: any) {
      console.error("Publish error:", err)
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
      setStep("idle")
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-text sm:text-4xl">
          Create a Contest
        </h1>
        <p className="mt-1 font-body text-muted">
          Lock the reward, set the rules, let creators compete.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* ── LEFT: Form ── */}
        <div className="card flex flex-col gap-6 p-6 sm:p-8">
          {/* Title */}
          <div>
            <label className="mb-2 block font-display text-sm font-medium text-text">
              Contest title
            </label>
            <input
              type="text"
              placeholder="e.g. Best 15-second skate trick"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block font-display text-sm font-medium text-text">
              Description
            </label>
            <textarea
              placeholder="Rules, judging criteria, vibe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="textarea"
            />
          </div>

          {/* Entry type */}
          <div>
            <label className="mb-2 block font-display text-sm font-medium text-text">
              Entry type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {entryTypes.map(({ type, icon }) => (
                <button
                  key={type}
                  onClick={() => setEntryType(type)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 font-display text-sm font-medium transition-all ${
                    entryType === type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface-2 text-muted hover:border-border-bright hover:text-text"
                  }`}
                >
                  {icon}
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Reward + Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-display text-sm font-medium text-text">
                Reward (CKB)
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 font-mono text-sm text-accent">
                  ⬡
                </span>
                <input
                  type="number"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  className="input pl-7"
                  min={100}
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block font-display text-sm font-medium text-text">
                End date
              </label>
              <div className="relative">
                <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input pl-9"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted font-body">
                Pick the date the contest should end.
              </p>
            </div>
          </div>

          {/* Escrow notice */}
          <div className="flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4">
            <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
            <div>
              <p className="font-display text-sm font-semibold text-text">
                Funds secured on-chain ·{" "}
                <span className="font-mono text-accent">Treasury Cell</span>
              </p>
              <p className="mt-1 font-body text-xs text-muted">
                When you publish,{" "}
                <span className="font-mono text-text">{reward} CKB</span> will
                be locked in an immutable treasury contract. Only the proven
                winner can unlock the prize.
              </p>
            </div>
          </div>

          {/* Wallet not connected warning */}
          {!signer && (
            <div className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3">
              <span className="text-sm text-yellow-400">⚠️</span>
              <p className="text-sm text-yellow-400">
                Connect your CKB wallet to publish a contest
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
          <div className="flex gap-3">
            <button
              className="btn-outline flex-1 justify-center"
              disabled={loading}
            >
              Save draft
            </button>
            <button
              onClick={handlePublish}
              disabled={loading || !isValid || !signer}
              className="btn-primary flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {currentLabel}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Live Preview ── */}
        <div className="flex flex-col gap-6">
          <div className="card sticky top-24 p-6">
            <p className="mb-4 font-mono text-xs tracking-widest text-muted uppercase">
              Live Preview
            </p>

            <div className="mb-6 overflow-hidden rounded-2xl border border-border">
              <div className="relative h-36 bg-gradient-to-br from-[#1a1f45] to-[#2d1060]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl opacity-20">✦</span>
                </div>
              </div>
              <div className="bg-surface p-4">
                <h3 className="mb-1 font-display text-base font-bold text-text">
                  {title || "Your contest title"}
                </h3>
                <p className="mb-3 font-body text-xs text-muted">
                  {description || "Description preview will appear here..."}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-accent">
                    ⬡ {reward || "0"} CKB
                  </span>
                  <span className="badge-type">{entryType.toLowerCase()}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent" />
                <p className="font-display text-sm font-semibold text-text">
                  What happens next
                </p>
              </div>
              <ol className="flex flex-col gap-2">
                {whatHappensNext.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 font-body text-sm text-muted"
                  >
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-border bg-surface font-mono text-xs text-muted">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
