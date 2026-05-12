"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ExternalLink, Lock, Trophy, Users, Zap, ChevronLeft } from "lucide-react";
import { MOCK_ENTRIES, MOCK_CONTESTS } from "@/lib/data";
import { cn } from "@/lib/utils";

// Simple countdown timer hook
function useCountdown(targetDays: number) {
  const [time, setTime] = useState({ d: targetDays, h: 23, m: 53, s: 4 });
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { d, h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; d--; }
        if (d < 0) return prev;
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

export default function ContestDetailPage({ params }: { params: { id: string } }) {
  const contest = MOCK_CONTESTS.find((c) => c.id === params.id) || MOCK_CONTESTS[1];
  const timer = useCountdown(3);
  const [votedEntries, setVotedEntries] = useState<Set<string>>(new Set());

  function handleVote(entryId: string) {
    setVotedEntries((prev) => new Set([...prev, entryId]));
  }

  const totalVotes = MOCK_ENTRIES.reduce((sum, e) => sum + e.votes, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted font-body mb-6">
        <Link href="/browse" className="hover:text-text flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" />
          Contests
        </Link>
        <span>/</span>
        <span className="text-text-2">{contest.entryType}</span>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-3 mb-4">
        <span className="badge-active">
          <span className="live-dot" />
          Active
        </span>
        <span className="ckb-lock-pill">
          <Lock className="w-3 h-3" />
          {contest.reward.toLocaleString()} CKB locked on-chain
        </span>
      </div>

      {/* Title */}
      <h1 className="font-display font-bold text-3xl sm:text-4xl text-text mb-2">
        {contest.title}
      </h1>
      <p className="text-muted font-body mb-6">
        Hosted by{" "}
        <span className="text-text">{contest.host}</span> ·{" "}
        {contest.entries.toLocaleString()} entries · {contest.votes.toLocaleString()} votes
      </p>

      {/* Top row: CTA + countdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-3">
          <Link href={`/submit/${contest.id}`} className="btn-primary">
            Submit Entry
          </Link>
          <button className="btn-outline gap-2">
            <span>Share</span>
          </button>
        </div>

        {/* Countdown */}
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
              <div
                key={label}
                className="w-14 h-14 bg-surface border border-border rounded-xl flex flex-col items-center justify-center"
              >
                <span className="font-mono font-bold text-xl text-text leading-none">
                  {val}
                </span>
                <span className="text-[10px] text-muted font-mono mt-0.5">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main layout: entries + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── LEFT: Entries grid ── */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-xl text-text">Entries</h2>
              <p className="text-xs text-muted font-body flex items-center gap-1 mt-0.5">
                Tap to vote —{" "}
                <Zap className="w-3 h-3 text-accent" />
                <span className="text-accent">Instant via Fiber</span>
              </p>
            </div>
            <span className="text-xs font-mono text-muted bg-surface border border-border rounded-full px-3 py-1">
              1 vote = 0.001 CKB micropayment
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_ENTRIES.map((entry) => {
              const hasVoted = votedEntries.has(entry.id);
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "rounded-2xl border overflow-hidden transition-all duration-200 hover:border-border-bright group",
                    "bg-gradient-to-br",
                    entry.gradient,
                    "border-border"
                  )}
                >
                  {/* Top labels */}
                  <div className="p-3 flex justify-between items-start">
                    <span className="text-xs font-mono font-bold text-white/70">
                      #{entry.rank}
                    </span>
                    {entry.verified && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-accent bg-accent/10 border border-accent/20 rounded-full px-2 py-0.5">
                        ✓ Verified on CKB
                      </span>
                    )}
                  </div>

                  {/* Image placeholder */}
                  <div className="mx-3 mb-3 h-36 rounded-xl bg-black/20 flex items-center justify-center">
                    <span className="text-white/10 text-4xl">◈</span>
                  </div>

                  {/* Caption + vote */}
                  <div className="px-3 pb-3">
                    <p className="text-xs text-muted font-mono mb-0.5">
                      {entry.author}
                    </p>
                    <p className="font-display text-sm text-text font-medium mb-3 leading-snug">
                      {entry.caption}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-text-2">
                        {entry.votes.toLocaleString()} votes
                      </span>
                      <button
                        onClick={() => handleVote(entry.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-display font-medium transition-all",
                          hasVoted
                            ? "bg-primary/30 text-primary border border-primary/40"
                            : "bg-primary text-white hover:bg-primary-hover active:scale-95"
                        )}
                      >
                        <Heart
                          className="w-3.5 h-3.5"
                          fill={hasVoted ? "currentColor" : "none"}
                        />
                        {hasVoted ? "Voted" : "Vote"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="flex flex-col gap-5">
          {/* Leaderboard */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-warning" />
              <h3 className="font-display font-bold text-text">Leaderboard</h3>
            </div>
            <div className="flex flex-col gap-2">
              {MOCK_ENTRIES.slice(0, 5).map((entry, i) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 transition-colors"
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0",
                      i === 0
                        ? "bg-warning/20 text-warning"
                        : "bg-surface-3 text-muted"
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-text-2">{entry.author}</p>
                    <p className="text-xs text-muted truncate">{entry.caption}</p>
                  </div>
                  <span className="text-sm font-mono font-bold text-accent flex-shrink-0">
                    {entry.votes.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* How voting works */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent" />
              <h3 className="font-display font-bold text-text text-sm">
                How voting works
              </h3>
            </div>
            <p className="text-xs text-muted font-body leading-relaxed mb-4">
              Each vote is a tiny micropayment routed through the Fiber Network
              — settled in milliseconds, recorded on CKB.
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
                <span className="font-mono font-bold text-accent">
                  {contest.reward.toLocaleString()} CKB
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted flex items-center gap-1">
                  <Users className="w-3 h-3" /> Entries
                </span>
                <span className="font-mono text-text">{contest.entries.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Votes
                </span>
                <span className="font-mono text-text">{totalVotes.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <a
                  href="#"
                  className="flex items-center gap-1.5 text-primary text-xs font-mono hover:underline"
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
  );
}
