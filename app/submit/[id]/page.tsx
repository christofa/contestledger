"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Upload, Lock, FileSignature } from "lucide-react";
import { MOCK_CONTESTS } from "@/lib/data";

export default function SubmitEntryPage({ params }: { params: { id: string } }) {
  const contest = MOCK_CONTESTS.find((c) => c.id === params.id) || MOCK_CONTESTS[1];
  const [caption, setCaption] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        href={`/contest/${contest.id}`}
        className="flex items-center gap-1 text-sm text-muted hover:text-text font-body mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to contest
      </Link>

      <h1 className="font-display font-bold text-3xl text-text mb-1">
        Submit your entry
      </h1>
      <p className="text-muted font-body mb-8">{contest.title}</p>

      <div className="card p-6 sm:p-8 flex flex-col gap-6">
        {/* Wallet + escrow */}
        <div className="flex items-center justify-between p-3 bg-surface-2 border border-border rounded-xl">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-muted font-body">Wallet connected</span>
            <span className="font-mono text-text">0xA2…f91</span>
          </div>
          <span className="ckb-lock-pill text-xs">
            <Lock className="w-3 h-3" />
            {contest.reward.toLocaleString()} CKB locked on-chain
          </span>
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-display font-medium text-text mb-2">
            Upload
          </label>
          <div
            className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : file
                ? "border-accent bg-accent/5"
                : "border-border hover:border-border-bright"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            {file ? (
              <>
                <p className="font-display font-semibold text-accent">{file.name}</p>
                <p className="text-xs text-muted font-body">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
                </p>
              </>
            ) : (
              <>
                <p className="font-display font-semibold text-text">
                  Drag &amp; drop your file
                </p>
                <p className="text-xs text-muted font-body">
                  or click to browse · max 100MB · image / video / text
                </p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            accept="image/*,video/*,.txt,.md"
          />
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-display font-medium text-text mb-2">
            Caption
          </label>
          <textarea
            placeholder="Tell the voters what makes your entry special..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="textarea"
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted font-body">
            <FileSignature className="w-3.5 h-3.5" />
            Submission requires 1 signature · No gas fee
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/contest/${contest.id}`}
              className="btn-outline text-sm px-4 py-2"
            >
              Cancel
            </Link>
            <button className="btn-primary text-sm px-4 py-2">
              Submit Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
