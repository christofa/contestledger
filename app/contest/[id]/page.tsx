"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ccc } from "@ckb-ccc/connector-react"
import {
  Heart, ExternalLink, Lock, Trophy,
  Users, Zap, ChevronLeft, Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

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
    // ── Step 1: Get a challenge from the backend ────────────────────────
    const challengeRes = await fetch(
      `/api/entries/vote/challenge?entryId=${entryId}`
    )
    const challengeData = await challengeRes.json()
    if (!challengeRes.ok) throw new Error(challengeData.error)

    const { message } = challengeData

    // ── Step 2: Ask the wallet to sign the challenge ───────────────────
    const signature = JSON.stringify(await signer.signMessage(message))

    // ── Step 3: Get the voter's address ────────────────────────────────
    const voterAddress = await signer.getRecommendedAddress()

    // ── Step 4: Send everything to the backend ─────────────────────────
    const res = await fetch("/api/entries/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId, voterAddress, message, signature }),
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
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="font-body">Loading contest...</span>
      </div>
    )
  }

  if (error || !contest) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-red-400 font-body mb-4">❌ {error}</p>
        <Link href="/browse" className="btn-outline">← Back to contests</Link>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted font-body mb-6">
        <Link href="/browse" className="hover:text-text flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          Contests
        </Link>
        <span>/</span>
        <span className="text-text-2">{contest.entry_type}</span>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-3 mb-4">
        <span className={isEnded ? "badge-ended" : "badge-active"}>
          <span className={isEnded ? "" : "live-dot"} />
          {isEnded ? "Ended" : "Active"}
        </span>
        <span className="ckb-lock-pill">
          <Lock className="w-3 h-3" />
          {contest.reward.toLocaleString()} CKB locked on-chain
        </span>
      </div>

      <h1 className="font-display font-bold text-3xl sm:text-4xl text-text mb-2">
        {contest.title}
      </h1>
      <p className="text-muted font-body mb-2">
        Hosted by <span className="text-text font-mono">{shortCreator}</span>
      </p>
      {contest.description && (
        <p className="text-muted font-body mb-6 max-w-2xl">{contest.description}</p>
      )}

      {/* CTA + countdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
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
            className="flex items-center gap-1.5 text-xs font-mono text-primary hover:underline"
          >
            View on CKB Explorer
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {!isEnded ? (
          <div>
            <p className="text-xs text-muted font-mono uppercase tracking-widest mb-2">
              Voting closes in
            </p>
            <div className="flex items-center gap-2">
              {[
                { val: String(timer.d).padStart(2, "0"), label: "DAYS" },
                { val: String(timer.h).padStart(2, "0"), label: "HRS" },
                { val: String(timer.m).padStart(2, "0"), label: "MIN" },
                { val: String(timer.s).padStart(2, "0"), label: "SEC" },
              ].map(({ val, label }) => (
                <div key={label} className="w-14 h-14 bg-surface border border-border rounded-xl flex flex-col items-center justify-center">
                  <span className="font-mono font-bold text-xl text-text leading-none">{val}</span>
                  <span className="text-[10px] text-muted font-mono mt-0.5">{label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-sm font-mono text-muted">This contest has ended</span>
        )}
      </div>

      {/* Vote error */}
      {voteError && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          ❌ {voteError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: Entries grid ── */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-xl text-text">Entries</h2>
              <p className="text-xs text-muted font-body flex items-center gap-1 mt-0.5">
                Tap to vote — <Zap className="w-3 h-3 text-accent" />
                <span className="text-accent">Instant via Fiber</span>
              </p>
            </div>
            <span className="text-xs font-mono text-muted bg-surface border border-border rounded-full px-3 py-1">
              1 vote = 0.001 CKB micropayment
            </span>
          </div>

          {entriesLoading && (
            <div className="flex items-center gap-2 text-muted py-10 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-body">Loading entries...</span>
            </div>
          )}

          {!entriesLoading && entries.length === 0 && (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <p className="font-display font-bold text-text mb-1">No entries yet</p>
              <p className="text-sm text-muted font-body">Be the first to submit one!</p>
            </div>
          )}

          {!entriesLoading && entries.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {entries.map((entry, i) => {
                const hasVoted = votedEntries.has(entry.id)
                const shortAuthor = `${entry.creator_address.slice(0, 6)}...${entry.creator_address.slice(-4)}`
                const isVoting = votingId === entry.id

                return (
                  <div
                    key={entry.id}
                    className="rounded-2xl border overflow-hidden transition-all duration-200 hover:border-border-bright group bg-gradient-to-br from-[#1a1f45] to-[#2d1060] border-border"
                  >
                    <div className="p-3 flex justify-between items-start">
                      <span className="text-xs font-mono font-bold text-white/70">#{i + 1}</span>
                    </div>

                    <div className="mx-3 mb-3 h-36 rounded-xl bg-black/20 flex items-center justify-center">
                      <span className="text-white/10 text-4xl">◈</span>
                    </div>

                    <div className="px-3 pb-3">
                      <p className="text-xs text-muted font-mono mb-0.5">{shortAuthor}</p>
                      <p className="font-display text-sm text-text font-medium mb-2 leading-snug">
                        {entry.caption}
                      </p>
                      {entry.project_url && (
                        <a
                          href={entry.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary font-mono mb-3 hover:underline"
                        >
                          View project <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-text-2">
                          {entry.vote_count.toLocaleString()} votes
                        </span>
                        <button
                          onClick={() => handleVote(entry.id)}
                          disabled={isEnded || hasVoted || isVoting}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-display font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                            hasVoted
                              ? "bg-primary/30 text-primary border border-primary/40"
                              : "bg-primary text-white hover:bg-primary-hover active:scale-95"
                          )}
                        >
                          {isVoting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Heart className="w-3.5 h-3.5" fill={hasVoted ? "currentColor" : "none"} />
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
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-warning" />
              <h3 className="font-display font-bold text-text">Leaderboard</h3>
            </div>

            {entries.length === 0 ? (
              <p className="text-xs text-muted font-body">No entries to rank yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {entries.slice(0, 5).map((entry, i) => {
                  const shortAuthor = `${entry.creator_address.slice(0, 6)}...${entry.creator_address.slice(-4)}`
                  return (
                    <div key={entry.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 transition-colors">
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0",
                        i === 0 ? "bg-warning/20 text-warning" : "bg-surface-3 text-muted"
                      )}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-text-2">{shortAuthor}</p>
                        <p className="text-xs text-muted truncate">{entry.caption}</p>
                      </div>
                      <span className="text-sm font-mono font-bold text-accent flex-shrink-0">
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
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent" />
              <h3 className="font-display font-bold text-text text-sm">How voting works</h3>
            </div>
            <p className="text-xs text-muted font-body leading-relaxed mb-4">
              Each vote is a tiny micropayment routed through the Fiber Network — settled in milliseconds, recorded on CKB.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-2 border border-border rounded-xl p-3 text-center">
                <p className="text-xs text-muted font-mono mb-1">VOTE COST</p>
                <p className="font-mono font-bold text-accent">0.001 CKB</p>
              </div>
              <div className="bg-surface-2 border border-border rounded-xl p-3 text-center">
                <p className="text-xs text-muted font-mono mb-1">SETTLE TIME</p>
                <p className="font-mono font-bold text-primary">~0.3s</p>
              </div>
            </div>
          </div>

          {/* Treasury */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-accent" />
              <h3 className="font-display font-bold text-text text-sm">Treasury</h3>
            </div>
            <div className="flex flex-col gap-2.5 text-sm font-body">
              <div className="flex justify-between items-center">
                <span className="text-muted">⬡ Locked</span>
                <span className="font-mono font-bold text-accent">{contest.reward.toLocaleString()} CKB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted flex items-center gap-1"><Users className="w-3 h-3" /> Entries</span>
                <span className="font-mono text-text">{entries.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted flex items-center gap-1"><Heart className="w-3 h-3" /> Votes</span>
                <span className="font-mono text-text">{totalVotes.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-mono text-primary hover:underline"
                >
                  View on CKB Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
