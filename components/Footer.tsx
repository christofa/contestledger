import Link from "next/link"
import { Zap } from "lucide-react"

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="gradient-text">ContestLedger</span>
          </div>

          <div className="flex items-center gap-6 font-body text-sm text-muted">
            <Link href="/browse" className="transition-colors hover:text-text">
              Browse
            </Link>
            <Link href="/create" className="transition-colors hover:text-text">
              Create
            </Link>
            <Link href="/profile" className="transition-colors hover:text-text">
              Profile
            </Link>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-muted">
            <span className="rounded-md border border-border bg-surface-2 px-2 py-1">
              Powered by CKB
            </span>
            <span className="rounded-md border border-border bg-surface-2 px-2 py-1">
              Spore DOB
            </span>
            <span className="rounded-md border border-border bg-surface-2 px-2 py-1">
              Fiber Network
            </span>
          </div>
        </div>
        <p className="mt-8 text-center font-body text-xs text-muted">
          © 2025 ContestLedger. All rewards are secured on-chain. Zero trust
          required.
        </p>
      </div>
    </footer>
  )
}
