import Link from "next/link";
import { Clock, Users, Heart, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Contest } from "@/lib/data";

interface ContestCardProps {
  contest: Contest;
  featured?: boolean;
}

export default function ContestCard({ contest, featured = false }: ContestCardProps) {
  const typeColors: Record<string, string> = {
    VIDEO: "text-[#5b8fff] border-[#5b8fff]/30 bg-[#5b8fff]/10",
    IMAGE: "text-[#a78bfa] border-[#a78bfa]/30 bg-[#a78bfa]/10",
    TEXT: "text-[#34d399] border-[#34d399]/30 bg-[#34d399]/10",
    AUDIO: "text-[#fb923c] border-[#fb923c]/30 bg-[#fb923c]/10",
  };

  return (
    <Link href={`/contest/${contest.id}`}>
      <div
        className={cn(
          "group relative rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:border-border-bright hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 cursor-pointer",
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
          <div className="p-3 flex justify-between items-start">
            <span
              className={cn(
                "badge text-xs font-medium",
                contest.status === "Active"
                  ? "bg-success/20 text-success border border-success/30"
                  : "bg-warning/20 text-warning border border-warning/30"
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
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
          <div className="absolute bottom-[calc(100%-160px)] left-0 right-0 flex justify-start px-3 pb-3 mt-auto">
            {/* handled below */}
          </div>
        </div>

        {/* CKB lock badge overlapping */}
        <div className="px-3 -mt-3 relative z-10">
          <span className="ckb-lock-pill">
            <Lock className="w-3 h-3" />
            {contest.reward.toLocaleString()} CKB locked on-chain
          </span>
        </div>

        {/* Content */}
        <div className="p-3 pt-2 bg-surface">
          <h3 className="font-display font-semibold text-sm text-text leading-snug line-clamp-2 mb-1">
            {contest.title}
          </h3>
          <p className="text-xs text-muted font-body mb-3">by {contest.host}</p>

          <div className="flex items-center justify-between text-xs text-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {contest.timeLeft}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {contest.entries.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {contest.votes.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="font-mono font-semibold text-accent text-sm">
              ⬡ {contest.reward.toLocaleString()} CKB
            </span>
            <span className="text-xs text-primary group-hover:translate-x-0.5 transition-transform">
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
