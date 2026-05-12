# ContestLedger — Setup Guide

## What's inside

```
contestledger/
├── app/
│   ├── globals.css          ← All styles + CSS variables
│   ├── layout.tsx           ← Root layout (wraps every page with Navbar + Footer)
│   ├── page.tsx             ← Landing page (Hero, stats, How it Works, CTA)
│   ├── browse/
│   │   └── page.tsx         ← Browse Contests page (filters, search, grid)
│   ├── create/
│   │   └── page.tsx         ← Create Contest form (with live preview)
│   ├── contest/
│   │   └── [id]/page.tsx    ← Contest detail (entries, voting, leaderboard, treasury)
│   ├── submit/
│   │   └── [id]/page.tsx    ← Submit entry (file upload + caption)
│   └── profile/
│       └── page.tsx         ← Profile (My Entries, Rewards, Certificates, My Contests tabs)
├── components/
│   ├── Navbar.tsx           ← Sticky top navbar
│   ├── Footer.tsx           ← Footer
│   └── ContestCard.tsx      ← Reusable contest card (used across pages)
├── lib/
│   ├── data.ts              ← All mock data + TypeScript types
│   └── utils.ts             ← cn() helper for Tailwind class merging
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── postcss.config.js
```

---

## Step-by-step setup

### 1. Create a new Next.js project

Open your terminal in VSCode and run:

```bash
bun create next-app contestledger
```

