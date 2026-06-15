"use client"

import { useEffect, useState } from "react"
import { Edit, ExternalLink, LogOut, Share2, Trophy, Loader2 } from "lucide-react"
import { ccc } from "@ckb-ccc/connector-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Tab = "My Entries" | "Rewards" | "Certificates" | "My Contests"
const TABS: Tab[] = ["My Entries", "Rewards", "Certificates", "My Contests"]

type EntryRow = {
  id: string
  contest_id: string
  caption: string
  project_url: string
  vote_count: number
  tx_hash: string
  created_at: string
  contest_title: string | null
}

type ContestRow = {
  id: string
  title: string
  description: string
  entry_type: string
  reward: number
  deadline: string
  tx_hash: string
  status: string
  created_at: string
}

type ProfileData = {
  address: string
  entries: EntryRow[]
  contests: ContestRow[]
  stats: {
    contestsEntered: number
    votesReceived: number
    rewardsEarned: number
    wins: number
  }
}

export function ProfilePageClient({ viewAddress }: { viewAddress?: string }) {
  const router = useRouter()
  const signer = ccc.useSigner()
  const { disconnect } = ccc.useCcc()

  const isOwnProfile = !viewAddress

  const [address, setAddress] = useState<string | null>(viewAddress ?? null)
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tab, setTab] = useState<Tab>("My Entries")
  const [loggingOut, setLoggingOut] = useState(false)

  // ── Resolve own address from wallet ─────────────────────
  useEffect(() => {
    if (viewAddress) return

    if (!signer) {
      router.replace("/auth")
      return
    }

    signer.getRecommendedAddress().then(setAddress)
  }, [signer, viewAddress, router])

  // ── Fetch profile data once address is known ────────────
  useEffect(() => {
    if (!address) return

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile/${address}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setData(json)
      } catch (err: any) {
        setError(err.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [address])

  async function handleSignOut() {
    setLoggingOut(true)
    try {
      disconnect()
      router.replace("/auth")
      router.refresh()
    } finally {
      setLoggingOut(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────
  if (loading || !address) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="card p-6 text-sm text-muted flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading profile...
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="card p-6 text-sm text-red-400">
          ❌ {error || "Profile not found"}
        </div>
      </div>
    )
  }

  const shortAddress = `${address.slice(0, 10)}...${address.slice(-6)}`

  const profileStats = [
    { label: "CONTESTS ENTERED", value: data.stats.contestsEntered.toString() },
    { label: "VOTES RECEIVED", value: data.stats.votesReceived.toLocaleString() },
    { label: "REWARDS EARNED", value: `${data.stats.rewardsEarned.toLocaleString()} CKB` },
    { label: "WINS", value: data.stats.wins.toString() },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

      {/* Header */}
      <div className="card mb-8 p-6 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
              <span className="font-display text-2xl font-bold text-white">
                {address.slice(5, 6).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-text">
                  {shortAddress}
                </h1>
                <span className="badge border border-accent/30 bg-accent/10 font-mono text-[10px] text-accent">
                  Verified on CKB
                </span>
              </div>
              <p className="mt-0.5 font-mono text-xs text-muted break-all">
                {address}
              </p>
              <p className="mt-1 max-w-sm font-body text-sm text-text-2">
                {isOwnProfile
                  ? "Your ContestLedger activity — entries, contests, and on-chain proof."
                  : "On-chain activity for this ContestLedger creator."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="btn-outline gap-2 text-sm">
              <Share2 className="h-4 w-4" />
              Share
            </button>

            {isOwnProfile && (
              <>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  className="btn-outline gap-2 text-sm disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? "Logging out..." : "Log out"}
                </button>
                <button className="btn-primary gap-2 text-sm">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {profileStats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <span
              className={cn(
                "font-display text-2xl font-bold",
                stat.label === "REWARDS EARNED" ? "gradient-text" : "text-accent"
              )}
            >
              {stat.value}
            </span>
            <span className="font-mono text-[10px] tracking-widest text-muted">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-8 flex items-center gap-1 border-b border-border overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 font-display text-sm font-medium transition-colors whitespace-nowrap",
              tab === t
                ? "border-primary text-text"
                : "border-transparent text-muted hover:text-text-2"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* My Entries */}
      {tab === "My Entries" && (
        data.entries.length === 0 ? (
          <EmptyState
            title="No entries yet"
            description={
              isOwnProfile
                ? "Submit your first entry to a contest to see it here."
                : "This creator hasn't submitted any entries yet."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.entries.map((entry) => (
              <div
                key={entry.id}
                className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#1a1f45] to-[#2d1060]"
              >
                <div className="flex h-32 items-center justify-center">
                  <span className="text-4xl text-white/10">◇</span>
                </div>
                <div className="bg-surface p-4">
                  <Link
                    href={`/contest/${entry.contest_id}`}
                    className="text-xs text-muted font-mono hover:text-primary"
                  >
                    {entry.contest_title || "View contest"}
                  </Link>
                  <p className="font-display text-sm font-semibold leading-snug text-text mt-1 mb-2">
                    {entry.caption}
                  </p>
                  <div className="flex items-center justify-between">
                    {entry.project_url && (
                      <a
                        href={entry.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                      >
                        View project
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <span className="font-mono text-sm font-bold text-accent">
                      ♡ {entry.vote_count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Rewards */}
      {tab === "Rewards" && (
        <EmptyState
          title="No rewards yet"
          description="Rewards appear here automatically once a contest ends and the treasury pays out the winner on-chain."
        />
      )}

      {/* Certificates */}
      {tab === "Certificates" && (
        <EmptyState
          title="No certificates yet"
          description="Winning a contest mints a permanent Spore DOB certificate to your wallet — it will appear here."
          icon={<Trophy className="h-8 w-8 text-muted" />}
        />
      )}

      {/* My Contests */}
      {tab === "My Contests" && (
        data.contests.length === 0 ? (
          <EmptyState
            title="No contests created"
            description={
              isOwnProfile
                ? "Create your first contest to see it here."
                : "This creator hasn't launched any contests yet."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.contests.map((contest) => (
              <Link
                key={contest.id}
                href={`/contest/${contest.id}`}
                className="card p-5 hover:border-border-bright transition-colors block"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="badge-type">
                    {contest.entry_type.toLowerCase()}
                  </span>
                  <span className={cn(
                    "text-xs font-mono",
                    contest.status === "active" ? "text-accent" : "text-muted"
                  )}>
                    {contest.status}
                  </span>
                </div>
                <h3 className="font-display font-bold text-text mb-1">
                  {contest.title}
                </h3>
                <p className="text-xs text-muted font-body mb-3 line-clamp-2">
                  {contest.description}
                </p>
                <span className="font-mono font-bold text-accent">
                  ⬡ {contest.reward.toLocaleString()} CKB
                </span>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  )
}

// ── Empty state component ─────────────────────────────────
function EmptyState({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon?: React.ReactNode
}) {
  return (
    <div className="card flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 border border-border">
        {icon || <span className="text-2xl text-muted">○</span>}
      </div>
      <p className="font-display font-bold text-text mb-1">{title}</p>
      <p className="text-sm text-muted font-body max-w-sm">{description}</p>
    </div>
  )
} 
