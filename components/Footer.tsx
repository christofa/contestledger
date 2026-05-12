import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-display font-bold text-lg">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="gradient-text">ContestLedger</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted font-body">
            <Link href="/browse" className="hover:text-text transition-colors">Browse</Link>
            <Link href="/create" className="hover:text-text transition-colors">Create</Link>
            <Link href="/profile" className="hover:text-text transition-colors">Profile</Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted font-mono">
            <span className="px-2 py-1 bg-surface-2 border border-border rounded-md">Powered by CKB</span>
            <span className="px-2 py-1 bg-surface-2 border border-border rounded-md">Spore DOB</span>
            <span className="px-2 py-1 bg-surface-2 border border-border rounded-md">Fiber Network</span>
          </div>
        </div>
        <p className="text-center text-xs text-muted mt-8 font-body">
          © 2025 ContestLedger. All rewards are secured on-chain. Zero trust required.
        </p>
      </div>
    </footer>
  );
}
