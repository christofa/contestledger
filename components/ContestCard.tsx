import Link from "next/link"
import { Clock, Users, Heart, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Contest } from "@/lib/data"

interface ContestCardProps {
  contest: Contest
  featured?: boolean
}

export default function ContestCard({
  contest,
  featured = false,
}: ContestCardProps) {
  const typeColors: Record<string, string> = {
    VIDEO: "text-[#5b8fff] border-[#5b8fff]/30 bg-[#5b8fff]/10",
    IMAGE: "text-[#a78bfa] border-[#a78bfa]/30 bg-[#a78bfa]/10",
    TEXT: "text-[#34d399] border-[#34d399]/30 bg-[#34d399]/10",
    AUDIO: "text-[#fb923c] border-[#fb923c]/30 bg-[#fb923c]/10",
  }

  return (
    <Link href={`/contest/${contest.id}`}>
      <div
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:-translate-y-1 hover:border-border-bright hover:shadow-lg hover:shadow-primary/10",
          featured ? "h-full" : ""
        )}
      >
        {/* Gradient image area */}
        <div
          className={cn(
            "w-full bg-gradient-to-br",
            contest.gradient,
            featured ? "h-48" : "h-40"
          )}
        >
          {/* Status badge */}
          <div className="flex items-start justify-between p-3">
            <span
              className={cn(
                "badge text-xs font-medium",
                contest.status === "Active"
                  ? "border border-success/30 bg-success/20 text-success"
                  : "border border-warning/30 bg-warning/20 text-warning"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  contest.status === "Active" ? "bg-success" : "bg-warning"
                )}
              />
              {contest.status}
            </span>
            <span
              className={cn(
                "badge border text-xs",
                typeColors[contest.entryType]
              )}
            >
              {contest.entryType}
            </span>
          </div>

          {/* CKB lock pill at bottom */}
          <div className="absolute right-0 bottom-[calc(100%-160px)] left-0 mt-auto flex justify-start px-3 pb-3">
            {/* handled below */}
          </div>
        </div>

        {/* CKB lock badge overlapping */}
        <div className="relative z-10 -mt-3 px-3">
          <span className="ckb-lock-pill">
            <Lock className="h-3 w-3" />
            {contest.reward.toLocaleString()} CKB locked on-chain
          </span>
        </div>

        {/* Content */}
        <div className="bg-surface p-3 pt-2">
          <h3 className="mb-1 line-clamp-2 font-display text-sm leading-snug font-semibold text-text">
            {contest.title}
          </h3>
          <p className="mb-3 font-body text-xs text-muted">by {contest.host}</p>

          <div className="flex items-center justify-between text-xs text-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {contest.timeLeft}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {contest.entries.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {contest.votes.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="font-mono text-sm font-semibold text-accent">
              ⬡ {contest.reward.toLocaleString()} CKB
            </span>
            <span className="text-xs text-primary transition-transform group-hover:translate-x-0.5">
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
