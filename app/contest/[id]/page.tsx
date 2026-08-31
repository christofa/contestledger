"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ccc } from "@ckb-ccc/connector-react"
import {
  Heart,
  ExternalLink,
  Lock,
  Trophy,
  Users,
  Zap,
  ChevronLeft,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { shannonsToCkb } from "@/lib/ckb-convert"

type ContestFromDB = {
  id: string
  title: string
  description: string
  entry_type: string
  reward: number
  deadline: string
  tx_hash: string
  creator_address: string
  status: string
  created_at: string
}

type EntryFromDB = {
  id: string
  contest_id: string
  caption: string
  project_url: string
  creator_address: string
  tx_hash: string
  vote_count: number
  created_at: string
}

function useCountdown(deadline: string) {
  const getTimeLeft = () => {
    const diff = new Date(deadline).getTime() - Date.now()
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 }
    return {
      d: Math.floor(diff / (1000 * 60 * 60 * 24)),
      h: Math.floor((diff / (1000 * 60 * 60)) % 24),
      m: Math.floor((diff / (1000 * 60)) % 60),
      s: Math.floor((diff / 1000) % 60),
    }
  }

  const [time, setTime] = useState(getTimeLeft)

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [deadline])

  return time
}

export default function ContestDetailPage() {
  const params = useParams<{ id: string }>()
  const id = typeof params.id === "string" ? params.id : ""
  const signer = ccc.useSigner()

  const [contest, setContest] = useState<ContestFromDB | null>(null)
  const [entries, setEntries] = useState<EntryFromDB[]>([])
  const [loading, setLoading] = useState(true)
  const [entriesLoading, setEntriesLoading] = useState(true)
  const [error, setError] = useState("")
  const [votingId, setVotingId] = useState<string | null>(null)
  const [voteError, setVoteError] = useState("")
  const [votedEntries, setVotedEntries] = useState<Set<string>>(new Set())

  // ── Fetch contest ────────────────────────────────────────
  useEffect(() => {
    const fetchContest = async () => {
      if (!id) {
        setError("Contest not found")
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/contests/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setContest(data.contest)
      } catch (err: any) {
        setError(err.message || "Contest not found")
      } finally {
        setLoading(false)
      }
    }
    fetchContest()
  }, [id])

  // ── Fetch entries ────────────────────────────────────────
  const fetchEntries = async () => {
    if (!id) return
    try {
      const res = await fetch(`/api/entries/list/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEntries(data.entries)
    } catch (err) {
      console.error("Failed to load entries:", err)
    } finally {
      setEntriesLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [id])

  const timer = useCountdown(contest?.deadline ?? new Date().toISOString())

  // ── Vote handler ─────────────────────────────────────────
async function handleVote(entryId: string) {
  setVoteError("")

  if (!signer) {
    setVoteError("Connect your wallet to vote")
    return
  }

  if (votedEntries.has(entryId)) return

  setVotingId(entryId)

  try {
    // ── Find the entry to get its tx_hash ───────────────────────────────
    const entry = entries.find(e => e.id === entryId)
    if (!entry) throw new Error("Entry not found")

    const voterAddress = await signer.getRecommendedAddress()

    // ── Build the Vote Cell data ────────────────────────────────────────
    const entryOutpoint = `${entry.tx_hash}:0x0`
    const contestOutpoint = contest?.tx_hash ? `${contest.tx_hash}:0x0` : ""

    const voteData = {
      kind: "vote",
      version: 1,
      entryOutpoint,
      contestOutpoint,
      voter: voterAddress,
      timestamp: new Date().toISOString(),
      platform: "ContestLedger",
    }

    // ── Encode to hex ───────────────────────────────────────────────────
    const voteBytes = new TextEncoder().encode(JSON.stringify(voteData))
    const voteHex =
      "0x" +
      Array.from(voteBytes)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")

    // ── Build the CKB transaction ───────────────────────────────────────
    const { script: voterLock } = await ccc.Address.fromString(
      voterAddress,
      signer.client
    )

    const minCapacity =
      BigInt(61 + voteBytes.length + 100) * BigInt(100_000_000)

    const tx = ccc.Transaction.from({
      outputs: [{ capacity: minCapacity, lock: voterLock }],
      outputsData: [voteHex],
    })

    await tx.completeInputsByCapacity(signer)
    await tx.completeFeeBy(signer, 1000)

    // ── Sign and broadcast ──────────────────────────────────────────────
    const txHash = await signer.sendTransaction(tx)
    console.log("Vote TX hash:", txHash)

    // ── Send txHash to backend for verification ─────────────────────────
    const res = await fetch("/api/entries/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId, voterAddress, txHash }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error)

    // ── Update local state ──────────────────────────────────────────────
    setEntries(prev =>
      prev
        .map(e => e.id === entryId
          ? { ...e, vote_count: data.entry.vote_count }
          : e
        )
        .sort((a, b) => b.vote_count - a.vote_count)
    )
    setVotedEntries(prev => new Set([...prev, entryId]))

  } catch (err: any) {
    setVoteError(err.message || "Vote failed")
  } finally {
    setVotingId(null)
  }
}

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="font-body">Loading contest...</span>
      </div>
    )
  }

  if (error || !contest) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="mb-4 font-body text-red-400">❌ {error}</p>
        <Link href="/browse" className="btn-outline">
          ← Back to contests
        </Link>
      </div>
    )
  }

  const isEnded =
    contest.status.toLowerCase() === "ended" ||
    new Date(contest.deadline) < new Date()
  const shortCreator = `${contest.creator_address.slice(0, 8)}...${contest.creator_address.slice(-4)}`
  const explorerUrl = `https://pudge.explorer.nervos.org/transaction/${contest.tx_hash}`
  const totalVotes = entries.reduce((sum, e) => sum + e.vote_count, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 font-body text-sm text-muted">
        <Link
          href="/browse"
          className="flex items-center gap-1 hover:text-text"
        >
          <ChevronLeft className="h-4 w-4" />
          Contests
        </Link>
        <span>/</span>
        <span className="text-text-2">{contest.entry_type}</span>
      </div>

      {/* Status badges */}
      <div className="mb-4 flex items-center gap-3">
        <span className={isEnded ? "badge-ended" : "badge-active"}>
          <span className={isEnded ? "" : "live-dot"} />
          {isEnded ? "Ended" : "Active"}
        </span>
        <span className="ckb-lock-pill">
          <Lock className="h-3 w-3" />
          {shannonsToCkb(contest.reward).toLocaleString()} CKB locked on-chain
        </span>
      </div>

      <h1 className="mb-2 font-display text-3xl font-bold text-text sm:text-4xl">
        {contest.title}
      </h1>
      <p className="mb-2 font-body text-muted">
        Hosted by <span className="font-mono text-text">{shortCreator}</span>
      </p>
      {contest.description && (
        <p className="mb-6 max-w-2xl font-body text-muted">
          {contest.description}
        </p>
      )}

      {/* CTA + countdown */}
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          {!isEnded && (
            <Link href={`/submit/${contest.id}`} className="btn-primary">
              Submit Entry
            </Link>
          )}
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs text-primary hover:underline"
          >
            View on CKB Explorer
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {!isEnded ? (
          <div>
            <p className="mb-2 font-mono text-xs tracking-widest text-muted uppercase">
              Voting closes in
            </p>
            <div className="flex items-center gap-2">
              {[
                { val: String(timer.d).padStart(2, "0"), label: "DAYS" },
                { val: String(timer.h).padStart(2, "0"), label: "HRS" },
                { val: String(timer.m).padStart(2, "0"), label: "MIN" },
                { val: String(timer.s).padStart(2, "0"), label: "SEC" },
              ].map(({ val, label }) => (
                <div
                  key={label}
                  className="flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-border bg-surface"
                >
                  <span className="font-mono text-xl leading-none font-bold text-text">
                    {val}
                  </span>
                  <span className="mt-0.5 font-mono text-[10px] text-muted">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <span className="font-mono text-sm text-muted">
            This contest has ended
          </span>
        )}
      </div>

      {/* Vote error */}
      {voteError && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          ❌ {voteError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* ── LEFT: Entries grid ── */}
        <div className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-text">
                Entries
              </h2>
              <p className="mt-0.5 flex items-center gap-1 font-body text-xs text-muted">
                Tap to vote — <Zap className="h-3 w-3 text-accent" />
                <span className="text-accent">Instant via Fiber</span>
              </p>
            </div>
            <span className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-muted">
              1 vote = 0.001 CKB micropayment
            </span>
          </div>

          {entriesLoading && (
            <div className="flex items-center justify-center gap-2 py-10 text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-body text-sm">Loading entries...</span>
            </div>
          )}

          {!entriesLoading && entries.length === 0 && (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <p className="mb-1 font-display font-bold text-text">
                No entries yet
              </p>
              <p className="font-body text-sm text-muted">
                Be the first to submit one!
              </p>
            </div>
          )}

          {!entriesLoading && entries.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {entries.map((entry, i) => {
                const hasVoted = votedEntries.has(entry.id)
                const shortAuthor = `${entry.creator_address.slice(0, 6)}...${entry.creator_address.slice(-4)}`
                const isVoting = votingId === entry.id

                return (
                  <div
                    key={entry.id}
                    className="group overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#1a1f45] to-[#2d1060] transition-all duration-200 hover:border-border-bright"
                  >
                    <div className="flex items-start justify-between p-3">
                      <span className="font-mono text-xs font-bold text-white/70">
                        #{i + 1}
                      </span>
                    </div>

                    <div className="mx-3 mb-3 flex h-36 items-center justify-center rounded-xl bg-black/20">
                      <span className="text-4xl text-white/10">◈</span>
                    </div>

                    <div className="px-3 pb-3">
                      <p className="mb-0.5 font-mono text-xs text-muted">
                        {shortAuthor}
                      </p>
                      <p className="mb-2 font-display text-sm leading-snug font-medium text-text">
                        {entry.caption}
                      </p>
                      {entry.project_url && (
                        <a
                          href={entry.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mb-3 flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                        >
                          View project <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm text-text-2">
                          {entry.vote_count.toLocaleString()} votes
                        </span>
                        <button
                          onClick={() => handleVote(entry.id)}
                          disabled={isEnded || hasVoted || isVoting}
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-display text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40",
                            hasVoted
                              ? "border border-primary/40 bg-primary/30 text-primary"
                              : "bg-primary text-white hover:bg-primary-hover active:scale-95"
                          )}
                        >
                          {isVoting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Heart
                              className="h-3.5 w-3.5"
                              fill={hasVoted ? "currentColor" : "none"}
                            />
                          )}
                          {hasVoted ? "Voted" : "Vote"}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="flex flex-col gap-5">
          {/* Leaderboard */}
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-warning" />
              <h3 className="font-display font-bold text-text">Leaderboard</h3>
            </div>

            {entries.length === 0 ? (
              <p className="font-body text-xs text-muted">
                No entries to rank yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {entries.slice(0, 5).map((entry, i) => {
                  const shortAuthor = `${entry.creator_address.slice(0, 6)}...${entry.creator_address.slice(-4)}`
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2"
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold",
                          i === 0
                            ? "bg-warning/20 text-warning"
                            : "bg-surface-3 text-muted"
                        )}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs text-text-2">
                          {shortAuthor}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {entry.caption}
                        </p>
                      </div>
                      <span className="flex-shrink-0 font-mono text-sm font-bold text-accent">
                        {entry.vote_count.toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* How voting works */}
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              <h3 className="font-display text-sm font-bold text-text">
                How voting works
              </h3>
            </div>
            <p className="mb-4 font-body text-xs leading-relaxed text-muted">
              Each vote is a tiny micropayment routed through the Fiber Network
              — settled in milliseconds, recorded on CKB.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-surface-2 p-3 text-center">
                <p className="mb-1 font-mono text-xs text-muted">VOTE COST</p>
                <p className="font-mono font-bold text-accent">0.001 CKB</p>
              </div>
              <div className="rounded-xl border border-border bg-surface-2 p-3 text-center">
                <p className="mb-1 font-mono text-xs text-muted">SETTLE TIME</p>
                <p className="font-mono font-bold text-primary">~0.3s</p>
              </div>
            </div>
          </div>

          {/* Treasury */}
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-accent" />
              <h3 className="font-display text-sm font-bold text-text">
                Treasury
              </h3>
            </div>
            <div className="flex flex-col gap-2.5 font-body text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">⬡ Locked</span>
                <span className="font-mono font-bold text-accent">
                  {shannonsToCkb(contest.reward).toLocaleString()} CKB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted">
                  <Users className="h-3 w-3" /> Entries
                </span>
                <span className="font-mono text-text">{entries.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-muted">
                  <Heart className="h-3 w-3" /> Votes
                </span>
                <span className="font-mono text-text">
                  {totalVotes.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-2">
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-mono text-xs text-primary hover:underline"
                >
                  View on CKB Explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
