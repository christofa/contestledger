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

  // ✅ Correct hook for @ckb-ccc/connector-react@1.0.34
  const signer = ccc.useSigner()

  // ── Form state ──────────────────────────────────────────
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [entryType, setEntryType] = useState<EntryType>("Image")
  const [reward, setReward] = useState("1000")
  const [deadline, setDeadline] = useState("")

  // ── Transaction state ───────────────────────────────────
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

  // ── Validation ──────────────────────────────────────────
  const isValid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    reward !== "" &&
    Number(reward) >= 100 &&
    deadline !== ""

  // ── Main publish function ───────────────────────────────
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
      // Step 1 — Get creator address
      setStep("signing")
      const address = await signer.getRecommendedAddress()

      // Step 2 — Build contest data
      const contestData = {
        title,
        description,
        entryType,
        reward: Number(reward),
        deadline,
        creator: address,
        status: "active",
        createdAt: new Date().toISOString(),
        platform: "ContestLedger",
      }

      // Step 3 — Convert to hex
      const contestBytes = new TextEncoder().encode(JSON.stringify(contestData))
      const contestHex =
        "0x" +
        Array.from(contestBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")

      // Step 4 — Get lock script
      const { script: creatorLock } = await ccc.Address.fromString(
        address,
        signer.client
      )

      // Step 5 — Calculate capacity
      const minCapacity = BigInt(61 + contestBytes.length) * BigInt(100000000)

      // Step 6 — Build transaction
      const tx = ccc.Transaction.from({
        outputs: [
          {
            capacity: minCapacity,
            lock: creatorLock,
          },
        ],
        outputsData: [contestHex],
      })

      // Step 7 — Complete inputs and fee
      await tx.completeInputsByCapacity(signer)
      await tx.completeFeeBy(signer, 1000)

      // Step 8 — Sign and broadcast
      setStep("broadcasting")
      const txHash = await signer.sendTransaction(tx)
      console.log("Contest TX hash:", txHash)

      // Step 9 — Save to SQLite
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

      // Step 10 — Redirect
      setStep("done")
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Publish error:", err)
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
      setStep("idle")
    }
  }
}
// ── Rest of your JSX stays exactly the same ─────────────
// Just replace {stepLabel} with {currentLabel} in the button
// and replace !wallet with !signer in the warning banner
