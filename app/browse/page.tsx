"use client"

import { useState, useEffect } from "react"
import { Search, Flame, TrendingUp, Loader2 } from "lucide-react"
import ContestCard from "@/components/ContestCard"
import { cn } from "@/lib/utils"
import { shannonsToCkb } from "@/lib/ckb-convert"

// Real contest type from our database
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

const TYPE_FILTERS = ["All", "Video", "Image", "Text", "Audio"] as const
const SORT_OPTIONS = ["Newest", "Highest reward", "Ending soon"] as const

type TypeFilter = (typeof TYPE_FILTERS)[number]
type SortOption = (typeof SORT_OPTIONS)[number]

export default function BrowsePage() {
  const [contests, setContests] = useState<ContestFromDB[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All")
  const [sortOption, setSortOption] = useState<SortOption>("Newest")
  const [search, setSearch] = useState("")

  // ── Fetch contests from API on page load ────────────────
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await fetch("/api/contests/list")
        const data = await res.json()

        if (!res.ok) throw new Error(data.error)

        setContests(data.contests)
      } catch (err: any) {
        setError(err.message || "Failed to load contests")
      } finally {
        setLoading(false)
      }
    }

    fetchContests()
  }, [])

  // ── Filter and sort ─────────────────────────────────────
  const filtered = contests
    .filter(c => {
      const matchType =
        typeFilter === "All" ||
        c.entry_type.toLowerCase() === typeFilter.toLowerCase()
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase())
      return matchType && matchSearch
    })
    .sort((a, b) => {
      if (sortOption === "Newest") {
        return new Date(b.created_at).getTime() -
               new Date(a.created_at).getTime()
      }
      if (sortOption === "Highest reward") {
        return b.reward - a.reward
      }
      if (sortOption === "Ending soon") {
        return new Date(a.deadline).getTime() -
               new Date(b.deadline).getTime()
      }
      return 0
    })

  const totalEscrow = contests.reduce((sum, c) => sum + shannonsToCkb(c.reward), 0)

  // ── Trending = top 3 by reward ──────────────────────────
  const trending = [...contests]
    .sort((a, b) => b.reward - a.reward)
    .slice(0, 3)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center
                      justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-text">
            Browse Contests
          </h1>
          <p className="text-muted font-body mt-1">
            {loading ? "Loading..." : `${contests.length} active challenges`}
            {" · "}
            <span className="text-accent font-mono">
              {totalEscrow.toLocaleString()} CKB
            </span>{" "}
            in escrow
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search contests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 w-72 text-sm"
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3
                        text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-body">Fetching contests from chain...</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20
                        rounded-xl text-red-400 text-sm mb-8">
          ❌ {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && contests.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted font-body text-lg mb-2">
            No contests yet
          </p>
          <p className="text-muted font-body text-sm">
            Be the first to create one!
          </p>
        </div>
      )}

      {/* Content — only show when we have contests */}
      {!loading && !error && contests.length > 0 && (
        <>
          {/* Trending section */}
          {trending.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-warning" />
                <h2 className="font-display font-bold text-lg text-text">
                  Trending now
                </h2>
                <span className="text-xs text-muted font-body">
                  — highest reward contests
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2
                              lg:grid-cols-3 gap-5">
                {trending.map(contest => (
                  <ContestCard
                    key={contest.id}
                    contest={adaptContest(contest)}
                    featured
                  />
                ))}
              </div>
            </div>
          )}

          {/* Filters + Sort */}
          <div className="flex flex-col sm:flex-row items-start
                          sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              {TYPE_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-display font-medium border transition-colors",
                    typeFilter === f
                      ? "bg-primary border-primary text-white"
                      : "border-border text-muted hover:border-border-bright hover:text-text bg-transparent"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {SORT_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setSortOption(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-display font-medium border transition-colors",
                    sortOption === s
                      ? "bg-surface-2 border-border-bright text-text"
                      : "border-transparent text-muted hover:text-text bg-transparent"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Contest grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2
                          lg:grid-cols-3 gap-5">
            {filtered.map(contest => (
              <ContestCard
                key={contest.id}
                contest={adaptContest(contest)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-20
                              text-muted font-body">
                No contests match your filters.
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-10 flex items-center justify-center gap-2
                      text-xs text-muted font-mono">
        <TrendingUp className="w-3.5 h-3.5 text-accent" />
        Live on CKB Testnet · Indexed from on-chain cells
      </div>
    </div>
  )
}

// ── Adapter — convert DB shape to ContestCard shape ──────
// Your ContestCard expects the old MOCK_CONTESTS format
// This function bridges the two shapes
function adaptContest(c: ContestFromDB) {
  const deadline = new Date(c.deadline)
  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  )

  const timeLeft =
    diffMs <= 0
      ? "Ended"
      : diffDays > 0
      ? `${diffDays}d ${diffHours}h left`
      : `${diffHours}h left`

  const status =
    diffMs <= 0
      ? "Ended"
      : diffDays <= 2
      ? "Ending Soon"
      : "Active"

  return {
    id: c.id,
    title: c.title,
    host: `${c.creator_address.slice(0, 8)}...${c.creator_address.slice(-4)}`,
    reward: shannonsToCkb(c.reward),   // ← convert here so ContestCard gets CKB
    status: status as "Active" | "Ending Soon" | "Ended",
    entryType: c.entry_type.toUpperCase() as "VIDEO" | "IMAGE" | "TEXT" | "AUDIO",
    entries: 0,
    votes: 0,
    timeLeft,
    gradient: "from-[#1a1f45] to-[#2d1060]",
    txHash: c.tx_hash,
  }
}