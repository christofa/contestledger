"use client";

import { useEffect, useState } from "react";
import { Edit, ExternalLink, Share2, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import ContestCard from "@/components/ContestCard";
import {
  MOCK_CERTIFICATES,
  MOCK_CONTESTS,
  MOCK_ENTRIES,
  MOCK_REWARDS,
} from "@/lib/data";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type Tab = "My Entries" | "Rewards" | "Certificates" | "My Contests";

const TABS: Tab[] = ["My Entries", "Rewards", "Certificates", "My Contests"];

const profileStats = [
  { label: "CONTESTS ENTERED", value: "24" },
  { label: "VOTES RECEIVED", value: "18,420" },
  { label: "REWARDS EARNED", value: "16,500 CKB" },
  { label: "WINS", value: "3" },
];

export function ProfilePageClient() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("My Entries");
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth");
      router.refresh();
    }
  }, [isPending, router, session]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="card mb-8 p-6 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
              <span className="font-display text-2xl font-bold text-white">N</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-text">
                  @nova_eth
                </h1>
                <span className="badge border border-accent/30 bg-accent/10 font-mono text-[10px] text-accent">
                  Verified on CKB
                </span>
              </div>
              <p className="mt-0.5 font-mono text-xs text-muted">
                ckb1qzda...3kpf91 · joined Mar 2024
              </p>
              <p className="mt-1 max-w-sm font-body text-sm text-text-2">
                Visual artist · 3x contest winner · obsessed with neon, motion,
                and on-chain proofs of effort.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-outline gap-2 text-sm">
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button className="btn-primary gap-2 text-sm">
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

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

      <div className="mb-8 flex items-center gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 font-display text-sm font-medium transition-colors",
              tab === t
                ? "border-primary text-text"
                : "border-transparent text-muted hover:text-text-2"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "My Entries" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_ENTRIES.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "overflow-hidden rounded-2xl border border-border bg-gradient-to-br",
                entry.gradient
              )}
            >
              <div className="flex h-40 items-center justify-center">
                <span className="text-4xl text-white/10">◇</span>
              </div>
              <div className="bg-surface p-4">
                <p className="font-display text-sm font-semibold leading-snug text-text">
                  {entry.caption}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-xs text-muted">
                    {entry.author}
                  </span>
                  <span className="font-mono text-sm font-bold text-accent">
                    ♡ {entry.votes.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Rewards" && (
        <div className="card overflow-hidden">
          <table className="w-full font-body text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left font-mono text-xs tracking-wider text-muted uppercase">
                  Contest
                </th>
                <th className="px-6 py-4 text-left font-mono text-xs tracking-wider text-muted uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-left font-mono text-xs tracking-wider text-muted uppercase">
                  Amount
                </th>
                <th className="px-6 py-4 text-left font-mono text-xs tracking-wider text-muted uppercase">
                  TX
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_REWARDS.map((reward, i) => (
                <tr
                  key={i}
                  className="border-b border-border transition-colors last:border-0 hover:bg-surface-2"
                >
                  <td className="px-6 py-4 text-text">{reward.contest}</td>
                  <td className="px-6 py-4 font-mono text-muted">
                    {reward.date}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-accent">
                      {reward.amount.toLocaleString()} CKB
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href="#"
                      className="flex items-center gap-1 font-mono text-muted transition-colors hover:text-primary"
                    >
                      {reward.tx}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Certificates" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_CERTIFICATES.map((cert, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-[#f59e0b]/30 bg-gradient-to-br from-[#92400e] to-[#78350f]"
            >
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="badge border border-warning/30 bg-warning/20 font-mono text-xs text-warning">
                    Spore DOB
                  </span>
                  <span className="font-mono text-xs text-[#fcd34d]/60">
                    {cert.date}
                  </span>
                </div>

                <div className="mb-5 flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/20">
                    <Trophy className="h-10 w-10 text-[#fcd34d]" />
                  </div>
                </div>

                <div className="text-center">
                  <p className="mb-1 font-mono text-xs tracking-widest text-[#fcd34d]/70 uppercase">
                    WINNER
                  </p>
                  <p className="mb-2 font-display text-sm font-bold leading-snug text-[#fef3c7]">
                    {cert.contest}
                  </p>
                  <p className="mb-3 font-mono text-lg font-bold text-[#fcd34d]">
                    {cert.amount.toLocaleString()} CKB
                  </p>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fcd34d]/20 bg-black/20 px-3 py-1 font-mono text-[10px] text-[#fcd34d]/80">
                    Verified on CKB
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "My Contests" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_CONTESTS.slice(0, 3).map((contest) => (
            <ContestCard key={contest.id} contest={contest} />
          ))}
        </div>
      )}
    </div>
  );
}
