import Link from "next/link";
import { Zap, Shield, Trophy, ArrowRight, Lock } from "lucide-react";
import ContestCard from "@/components/ContestCard";
import { MOCK_CONTESTS } from "@/lib/data";

const stats = [
  { value: "1,284", label: "CONTESTS RUN" },
  { value: "9.2M", label: "CKB REWARDS PAID" },
  { value: "42,109", label: "CREATORS PAID" },
  { value: "2.1M", label: "VOTES ON-CHAIN" },
];

const howItWorks = [
  {
    icon: <Shield className="w-6 h-6 text-accent" />,
    number: "1",
    title: "Create",
    desc: "Spin up a contest, lock the reward in an on-chain treasury. Funds can't be touched until a winner is proven.",
  },
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    number: "2",
    title: "Submit",
    desc: "Creators upload entries to IPFS — content lives forever, ownership is provable.",
  },
  {
    icon: <Trophy className="w-6 h-6 text-warning" />,
    number: "3",
    title: "Win",
    desc: "The community votes via Fiber micropayments. Winners get tokens and a Spore DOB certificate NFT.",
  },
];

const trustFeatures = [
  {
    icon: <Shield className="w-5 h-5 text-accent" />,
    title: "Escrow secured",
    desc: "Rewards lock in a treasury cell — verifiable any time.",
  },
  {
    icon: <Zap className="w-5 h-5 text-primary" />,
    title: "Instant voting",
    desc: "Sub-second micropayments via Fiber. No gas spikes.",
  },
  {
    icon: <Trophy className="w-5 h-5 text-warning" />,
    title: "Fair payout",
    desc: "Smart contract pays winners the moment voting closes.",
  },
];

export default function HomePage() {
  const featuredContests = MOCK_CONTESTS.slice(0, 3);

  return (
    <div className="relative overflow-hidden">
      {/* Hero background glow */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── HERO ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        {/* Powered by pill */}
        <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-1.5 text-xs font-mono text-muted mb-8">
          <Zap className="w-3 h-3 text-accent" />
          Powered by CKB · Spore DOB · Fiber Network
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-text leading-tight mb-6">
          Win. Create.{" "}
          <span className="gradient-text">Get Paid.</span>
          <br />
          On-chain.
        </h1>

        <p className="text-text-2 text-lg sm:text-xl font-body max-w-2xl mx-auto mb-10 leading-relaxed">
          The decentralized contest platform where rewards are locked in escrow,
          votes happen at the speed of light, and winners are proven forever.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/create" className="btn-primary text-base px-7 py-3">
            <Zap className="w-5 h-5" />
            Create a Contest
          </Link>
          <Link href="/browse" className="btn-outline text-base px-7 py-3">
            Browse Contests
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted font-body">
          {["Rewards in escrow", "Votes on blockchain", "Winners proven forever"].map(
            (item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {item}
              </span>
            )
          )}
        </div>
      </section>

      {/* ── FEATURED CONTESTS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredContests.map((contest) => (
            <ContestCard key={contest.id} contest={contest} featured />
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="stat-card text-center"
            >
              <span className="font-display font-bold text-3xl gradient-text">
                {stat.value}
              </span>
              <span className="text-xs text-muted font-mono tracking-widest">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 text-center">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-text mb-2">
          How it works
        </h2>
        <p className="text-muted font-body mb-12">Three steps. Zero trust required.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {howItWorks.map((step) => (
            <div
              key={step.number}
              className="card p-8 text-left relative overflow-hidden group hover:border-border-bright transition-colors"
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full" />
              <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-5">
                {step.icon}
              </div>
              <h3 className="font-display font-bold text-xl text-text mb-2">
                {step.title}
              </h3>
              <p className="text-text-2 font-body text-sm leading-relaxed">
                {step.desc}
              </p>
              <div className="absolute top-6 right-6 font-display font-bold text-5xl text-border select-none">
                {step.number}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUST FEATURES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="card p-1 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {trustFeatures.map((feat) => (
              <div key={feat.title} className="flex items-start gap-4 p-6">
                <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center flex-shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <p className="font-display font-semibold text-text mb-1">
                    {feat.title}
                  </p>
                  <p className="text-sm text-muted font-body">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-28 text-center">
        <div className="card p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-text mb-3 relative">
            Ready to launch your first challenge?
          </h2>
          <p className="text-muted font-body mb-8 relative">
            Lock a reward, share the link, watch creators compete.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
            <Link href="/create" className="btn-primary text-base px-7 py-3">
              <Lock className="w-4 h-4" />
              Create a Contest
            </Link>
            <Link href="/browse" className="btn-outline text-base px-7 py-3">
              Browse Contests
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
