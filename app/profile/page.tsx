"use client";

import { useState } from "react";
import { ExternalLink, Trophy, Edit, Share2 } from "lucide-react";
import ContestCard from "@/components/ContestCard";
import {
  MOCK_ENTRIES,
  MOCK_CONTESTS,
  MOCK_REWARDS,
  MOCK_CERTIFICATES,
} from "@/lib/data";
import { cn } from "@/lib/utils";

type Tab = "My Entries" | "Rewards" | "Certificates" | "My Contests";
const TABS: Tab[] = ["My Entries", "Rewards", "Certificates", "My Contests"];

const profileStats = [
  { label: "CONTESTS ENTERED", value: "24" },
  { label: "VOTES RECEIVED", value: "18,420" },
  { label: "REWARDS EARNED", value: "16,500 CKB" },
  { label: "WINS", value: "3" },
];

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("My Entries");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* ── Profile Header ── */}
      <div className="card p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-2xl text-white">N</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl text-text">
                  @nova_eth
                </h1>
                <span className="badge bg-accent/10 border border-accent/30 text-accent text-[10px] font-mono">
                  ✓ Verified on CKB
                </span>
              </div>
              <p className="text-xs text-muted font-mono mt-0.5">
                ckb1qzda…3kpf91 · joined Mar 2024
              </p>
              <p className="text-sm text-text-2 font-body mt-1 max-w-sm">
                Visual artist · 3x contest winner · obsessed with neon, motion,
                and on-chain proofs of effort.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-outline text-sm gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="btn-primary text-sm gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {profileStats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <span
              className={cn(
                "font-display font-bold text-2xl",
                stat.label === "REWARDS EARNED" ? "gradient-text" : "text-accent"
              )}
            >
              {stat.value}
            </span>
            <span className="text-[10px] text-muted font-mono tracking-widest">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 border-b border-border mb-8">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 font-display font-medium text-sm transition-colors border-b-2 -mb-px",
              tab === t
                ? "border-primary text-text"
                : "border-transparent text-muted hover:text-text-2"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}

      {/* MY ENTRIES */}
      {tab === "My Entries" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_ENTRIES.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "rounded-2xl border border-border overflow-hidden bg-gradient-to-br",
                entry.gradient
              )}
            >
              <div className="h-40 flex items-center justify-center">
                <span className="text-white/10 text-4xl">◈</span>
              </div>
              <div className="p-4 bg-surface">
                <p className="font-display font-semibold text-text text-sm leading-snug">
                  {entry.caption}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted font-mono">{entry.author}</span>
                  <span className="text-sm font-mono font-bold text-accent">
                    ♡ {entry.votes.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REWARDS */}
      {tab === "Rewards" && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-xs font-mono text-muted uppercase tracking-wider">
                  Contest
                </th>
                <th className="text-left px-6 py-4 text-xs font-mono text-muted uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-xs font-mono text-muted uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-6 py-4 text-xs font-mono text-muted uppercase tracking-wider">
                  TX
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_REWARDS.map((reward, i) => (
                <tr
                  key={i}
                  className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors"
                >
                  <td className="px-6 py-4 text-text">{reward.contest}</td>
                  <td className="px-6 py-4 text-muted font-mono">{reward.date}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-accent">
                      {reward.amount.toLocaleString()} CKB
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href="#"
                      className="flex items-center gap-1 font-mono text-muted hover:text-primary transition-colors"
                    >
                      {reward.tx}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CERTIFICATES */}
      {tab === "Certificates" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_CERTIFICATES.map((cert, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-[#f59e0b]/30 bg-gradient-to-br from-[#92400e] to-[#78350f]"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="badge bg-warning/20 border border-warning/30 text-warning text-xs font-mono">
                    ⬡ Spore DOB
                  </span>
                  <span className="text-xs text-[#fcd34d]/60 font-mono">{cert.date}</span>
                </div>

                {/* Trophy icon */}
                <div className="flex items-center justify-center mb-5">
                  <div className="w-20 h-20 rounded-full bg-black/20 flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-[#fcd34d]" />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs font-mono text-[#fcd34d]/70 uppercase tracking-widest mb-1">
                    WINNER
                  </p>
                  <p className="font-display font-bold text-[#fef3c7] text-sm leading-snug mb-2">
                    {cert.contest}
                  </p>
                  <p className="font-mono font-bold text-[#fcd34d] text-lg mb-3">
                    ⬡ {cert.amount.toLocaleString()} CKB
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#fcd34d]/80 bg-black/20 border border-[#fcd34d]/20 rounded-full px-3 py-1">
                    ✓ Verified on CKB
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MY CONTESTS */}
      {tab === "My Contests" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_CONTESTS.slice(0, 3).map((contest) => (
            <ContestCard key={contest.id} contest={contest} />
          ))}
        </div>
      )}
    </div>
  );
}
