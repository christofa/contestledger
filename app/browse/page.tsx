"use client";

import { useState } from "react";
import { Search, Flame, TrendingUp } from "lucide-react";
import ContestCard from "@/components/ContestCard";
import { MOCK_CONTESTS } from "@/lib/data";
import type { EntryType } from "@/lib/data";
import { cn } from "@/lib/utils";

const TYPE_FILTERS = ["All", "Video", "Image", "Text", "Audio"] as const;
const SORT_OPTIONS = ["Trending", "Newest", "Highest reward", "Ending soon"] as const;

type TypeFilter = (typeof TYPE_FILTERS)[number];
type SortOption = (typeof SORT_OPTIONS)[number];

export default function BrowsePage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [sortOption, setSortOption] = useState<SortOption>("Trending");
  const [search, setSearch] = useState("");

  const totalEscrow = MOCK_CONTESTS.reduce((sum, c) => sum + c.reward, 0);

  const filtered = MOCK_CONTESTS.filter((c) => {
    const matchType =
      typeFilter === "All" ||
      c.entryType === typeFilter.toUpperCase();
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.host.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const trending = MOCK_CONTESTS.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-text">
            Browse Contests
          </h1>
          <p className="text-muted font-body mt-1">
            {MOCK_CONTESTS.length} active challenges ·{" "}
            <span className="text-accent font-mono">
              {totalEscrow.toLocaleString()} CKB
            </span>{" "}
            in escrow
          </p>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search contests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 w-72 text-sm"
          />
        </div>
      </div>

      {/* Trending section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-warning" />
          <h2 className="font-display font-bold text-lg text-text">
            Trending now
          </h2>
          <span className="text-xs text-muted font-body">
            — most-voted in the last 24h
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trending.map((contest) => (
            <ContestCard key={contest.id} contest={contest} featured />
          ))}
        </div>
      </div>

      {/* Filters + Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Type filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {TYPE_FILTERS.map((f) => (
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

        {/* Sort options */}
        <div className="flex items-center gap-2 flex-wrap">
          {SORT_OPTIONS.map((s) => (
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((contest) => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-20 text-muted font-body">
            No contests match your filters.
          </div>
        )}
      </div>

      {/* Live footer */}
      <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted font-mono">
        <TrendingUp className="w-3.5 h-3.5 text-accent" />
        Live on CKB Mainnet · Updates every block
      </div>
    </div>
  );
}
