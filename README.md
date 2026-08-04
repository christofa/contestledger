# ContestLedger
 
> Decentralized contest platform built on CKB — rewards locked in escrow, entries and votes recorded on-chain, winners proven forever.
 
**Live demo:** https://contestledger.vercel.app/

**Network:** CKB Testnet (Pudge)

**Built for:** Nervos CKBuilder Program — (Duration: 6 weeks)
 
---
 
## What is ContestLedger?
 
Online contests today are opaque. Brands run challenges, creators submit work, and winners get picked by hidden processes nobody can verify. Rewards are sometimes delayed, sometimes never paid.
 
ContestLedger fixes this by putting the contest lifecycle on the CKB blockchain:
 
- Contest rewards are written to the CKB testnet at the moment a contest is created
- Every entry submission is a real, signed CKB transaction
- All contest and entry data is publicly verifiable on the CKB Explorer
- No central authority can alter a contest or entry after it's been written on-chain
This repo contains a fully working MVP — not a static design mockup. Every "Create Contest" and "Submit Entry" action in the app produces a real transaction on the CKB testnet.
 
---
 
## Features
 
### Wallet-native authentication
Sign in with a CKB wallet (JoyID or MetaMask). Wallet address becomes your on-chain identity across the platform.
 
### Create contests
Set a title, description, entry type, reward amount, and deadline. Publishing writes a Contest Cell directly to the CKB testnet — the transaction hash is your permanent, verifiable proof that the contest exists.
 
### Browse contests
Live feed of all contests indexed from the platform's database, which itself points back to real on-chain transactions. Filter by entry type, sort by reward or deadline.
 
### Submit entries
Contestants submit a caption and a link to their work (YouTube, TikTok, GitHub, SoundCloud, etc.) rather than uploading raw files — keeping on-chain storage costs minimal while still proving authorship and timestamp on CKB.
 
### Voting and leaderboard
Vote on entries with one click. Votes are tallied and the leaderboard re-sorts by vote count in real time. Duplicate voting is blocked at the database level via a unique constraint per wallet-entry pair.
 
### Profile pages
View your own activity or any wallet's public profile — contests created, entries submitted, votes received. The rewards and Certificates tabs are included with a "coming soon" note (see the Roadmap below).
 
### On-chain proof, everywhere
Every contest and entry links directly to its transaction on the CKB testnet explorer, so any claim made by the platform can be independently verified.
 
---
 
## Tech stack
 
| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS, shadcn/ui |
| Blockchain | CKB Testnet via `@ckb-ccc/core` and `@ckb-ccc/connector-react` |
| Wallets | JoyID, MetaMask (via CKB connector) |
| Auth | better-auth |
| Database | Turso (libSQL, cloud-hosted) |
| Package manager | Bun |
 
---
 
## How it works under the hood
 
ContestLedger uses a two-layer data model:
 
```
CKB Testnet (source of truth)
   Every contest and entry is a real Cell on-chain.
   Immutable once confirmed. Verifiable by anyone.
 
Turso (libSQL, cloud-hosted)
   Stores transaction hashes, titles, and metadata
   So the app can list and search quickly without
   scanning the entire blockchain on every page load.
```
 
Turso never holds the "truth" — it's a pointer. The transaction hash stored alongside every contest and entry links straight back to the CKB Explorer, so nothing in the UI is unverifiable.
 
---
 
## Getting started
 
### Prerequisites
- [Bun](https://bun.sh) installed
- A CKB testnet wallet (JoyID or MetaMask with CKB testnet configured) for testing the live blockchain features
### Installation
 
```bash
git clone https://github.com/christofa/contestledger.git
cd contestledger
bun install
```
 
### Environment variables
 
Create a `.env.local` file in the root:
 
```bash
BETTER_AUTH_SECRET=your-random-secret-string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
 
### Run the dev server
 
```bash
bun run dev
```
 
Visit `http://localhost:3000`.
 
### Get testnet CKB
 
To create contests or submit entries, you'll need testnet CKB in your connected wallet. Get some free from the [Nervos Faucet](https://faucet.nervos.org).
 
---
 
## Project structure
 
```
contestledger/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/        # better-auth handler
│   │   ├── contests/
│   │   │   ├── create/           # POST — create contest
│   │   │   ├── list/             # GET  — all contests
│   │   │   └── [id]/             # GET  — single contest
│   │   ├── entries/
│   │   │   ├── create/           # POST — submit entry
│   │   │   ├── list/[contestId]/ # GET  — entries for a contest
│   │   │   └── vote/             # POST — cast a vote
│   │   └── profile/[address]/    # GET  — profile stats + activity
│   ├── auth/                     # sign in / sign up
│   ├── browse/                   # contest discovery
│   ├── contest/[id]/             # contest detail, entries, voting
│   ├── create/                   # create contest form
│   ├── submit/[id]/              # submit entry form
│   └── profile/                  # own + public profile pages
├── components/                   # shared UI (ContestCard, etc.)
└── lib/
    ├── db.ts                     # Turso schema + connection
    └── utils.ts
```
 
---
 
## Roadmap
 
ContestLedger's MVP intentionally scoped out a few features to ship a fully working core flow within the program timeline. These are documented honestly rather than faked in the UI:
 
- **Fiber Network voting** — votes are currently recorded off-chain via the platform database with anti-duplicate protection. The architecture is designed so that this layer can be swapped for real Fiber Network payment channels, where each vote becomes a signed off-chain micropayment that settles to CKB when a contest closes.
- **Automated treasury payout** — winner reward distribution from the locked treasury Cell to the winning entry's creator, triggered automatically when a contest's deadline passes.
- **Spore DOB winner certificates** — minting a permanent on-chain NFT certificate to contest winners. Demoed independently in the CCC Playground during development; not yet wired into the live app.
- **Migration to Turso** — done. The app runs on Turso (cloud-hosted libSQL) in production, so contest, entry, and auth data persist reliably across deployments instead of relying on Vercel's ephemeral local filesystem.
---
 
## License
 
MIT
 
---
 
## Acknowledgements
 
Built as part of the [Nervos CKBuilder Program](https://www.nervos.org), a community initiative supporting builders developing on the CKB blockchain.
