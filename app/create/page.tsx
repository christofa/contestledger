"use client";

import { useState } from "react";
import { Lock, Image as ImageIcon, Video, FileText, CheckCircle, Clock } from "lucide-react";

type EntryType = "Image" | "Video" | "Text";

const entryTypes: { type: EntryType; icon: React.ReactNode }[] = [
  { type: "Image", icon: <ImageIcon className="w-5 h-5" /> },
  { type: "Video", icon: <Video className="w-5 h-5" /> },
  { type: "Text", icon: <FileText className="w-5 h-5" /> },
];

const whatHappensNext = [
  "Treasury cell deployed",
  "Contest goes live",
  "Creators submit, voters decide",
  "Winner gets paid + Spore DOB NFT",
];

export default function CreateContestPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [entryType, setEntryType] = useState<EntryType>("Image");
  const [reward, setReward] = useState("1000");
  const [deadline, setDeadline] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-text">
          Create a Contest
        </h1>
        <p className="text-muted font-body mt-1">
          Lock the reward, set the rules, let creators compete.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── LEFT: Form ── */}
        <div className="card p-6 sm:p-8 flex flex-col gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-display font-medium text-text mb-2">
              Contest title
            </label>
            <input
              type="text"
              placeholder="e.g. Best 15-second skate trick"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-display font-medium text-text mb-2">
              Description
            </label>
            <textarea
              placeholder="Rules, judging criteria, vibe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="textarea"
            />
          </div>

          {/* Entry type */}
          <div>
            <label className="block text-sm font-display font-medium text-text mb-2">
              Entry type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {entryTypes.map(({ type, icon }) => (
                <button
                  key={type}
                  onClick={() => setEntryType(type)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border font-display font-medium text-sm transition-all ${
                    entryType === type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface-2 text-muted hover:border-border-bright hover:text-text"
                  }`}
                >
                  {icon}
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Reward + Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-display font-medium text-text mb-2">
                Reward (CKB)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent text-sm font-mono">
                  ⬡
                </span>
                <input
                  type="number"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  className="input pl-7"
                  min={100}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-display font-medium text-text mb-2">
                Deadline
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input pl-9"
                />
              </div>
            </div>
          </div>

          {/* Escrow notice */}
          <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-xl p-4">
            <Lock className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-display font-semibold text-text text-sm">
                Funds secured on-chain ·{" "}
                <span className="text-accent font-mono">Treasury Cell</span>
              </p>
              <p className="text-xs text-muted font-body mt-1">
                When you publish,{" "}
                <span className="text-text font-mono">{reward} CKB</span> will
                be locked in an immutable treasury contract. Only the proven
                winner can unlock the prize.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="btn-outline flex-1 justify-center">
              Save draft
            </button>
            <button className="btn-primary flex-1 justify-center">
              <Lock className="w-4 h-4" />
              Lock {reward} CKB &amp; Publish
            </button>
          </div>
        </div>

        {/* ── RIGHT: Live Preview ── */}
        <div className="flex flex-col gap-6">
          <div className="card p-6 sticky top-24">
            <p className="text-xs font-mono text-muted uppercase tracking-widest mb-4">
              Live Preview
            </p>

            {/* Preview card */}
            <div className="rounded-2xl overflow-hidden border border-border mb-6">
              {/* Gradient area */}
              <div className="h-36 bg-gradient-to-br from-[#1a1f45] to-[#2d1060] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl opacity-20">✦</span>
                </div>
              </div>
              {/* Info */}
              <div className="p-4 bg-surface">
                <h3 className="font-display font-bold text-text text-base mb-1">
                  {title || "Your contest title"}
                </h3>
                <p className="text-xs text-muted font-body mb-3">
                  {description || "Description preview will appear here..."}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-accent">
                    ⬡ {reward || "0"} CKB
                  </span>
                  <span className="badge-type">{entryType.toLowerCase()}</span>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-surface-2 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-accent" />
                <p className="font-display font-semibold text-sm text-text">
                  What happens next
                </p>
              </div>
              <ol className="flex flex-col gap-2">
                {whatHappensNext.map((step, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-muted font-body"
                  >
                    <span className="w-5 h-5 rounded-full bg-surface border border-border text-xs font-mono flex items-center justify-center text-muted flex-shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
