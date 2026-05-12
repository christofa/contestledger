export type EntryType = "VIDEO" | "IMAGE" | "TEXT" | "AUDIO";
export type ContestStatus = "Active" | "Ending Soon" | "Ended";

export interface Contest {
  id: string;
  title: string;
  host: string;
  reward: number;
  status: ContestStatus;
  entryType: EntryType;
  entries: number;
  votes: number;
  timeLeft: string;
  gradient: string;
}

export interface Entry {
  id: string;
  rank: number;
  author: string;
  caption: string;
  votes: number;
  gradient: string;
  verified?: boolean;
}

export interface ProfileStats {
  entered: number;
  votesReceived: number;
  rewardsEarned: number;
  wins: number;
}

export const MOCK_CONTESTS: Contest[] = [
  {
    id: "1",
    title: "60s Dance Challenge — Free Style",
    host: "MoveDAO",
    reward: 7800,
    status: "Active",
    entryType: "VIDEO",
    entries: 502,
    votes: 31204,
    timeLeft: "13d 23h 35m",
    gradient: "from-[#1a2d5a] to-[#3d1060]",
  },
  {
    id: "2",
    title: "Write the Best 1-Line Sci-Fi Story",
    host: "TinyLit",
    reward: 800,
    status: "Active",
    entryType: "TEXT",
    entries: 1042,
    votes: 22510,
    timeLeft: "3d 23h 35m",
    gradient: "from-[#0d2a4a] to-[#1e0d5c]",
  },
  {
    id: "3",
    title: "Cyberpunk Poster Design Challenge",
    host: "ArtDAO",
    reward: 12500,
    status: "Active",
    entryType: "IMAGE",
    entries: 318,
    votes: 14203,
    timeLeft: "6d 23h 35m",
    gradient: "from-[#1a1060] to-[#3a0d70]",
  },
  {
    id: "4",
    title: "Street Photography — Light & Shadow",
    host: "ShutterDAO",
    reward: 2200,
    status: "Ending Soon",
    entryType: "IMAGE",
    entries: 211,
    votes: 9904,
    timeLeft: "1d 5h 35m",
    gradient: "from-[#1a3a5c] to-[#2d1b6e]",
  },
  {
    id: "5",
    title: "Neon Skate — Best 15s Trick Reel",
    host: "Vans x ChainChallenge",
    reward: 5000,
    status: "Ending Soon",
    entryType: "VIDEO",
    entries: 142,
    votes: 8421,
    timeLeft: "2d 3h 35m",
    gradient: "from-[#0d1a5c] to-[#3d0d4a]",
  },
  {
    id: "6",
    title: "Lo-Fi Beat Drop — 30s Loop",
    host: "Nightwave",
    reward: 3200,
    status: "Active",
    entryType: "AUDIO",
    entries: 87,
    votes: 4120,
    timeLeft: "9d 23h 35m",
    gradient: "from-[#1a0d3a] to-[#0d2a3a]",
  },
];

export const MOCK_ENTRIES: Entry[] = [
  {
    id: "1",
    rank: 1,
    author: "@kira",
    caption: "Backside flip under the neon bridge",
    votes: 1820,
    gradient: "from-[#1a2d5a] via-[#1a1060] to-[#3d0d70]",
    verified: true,
  },
  {
    id: "2",
    rank: 2,
    author: "@nova_eth",
    caption: "Sunset grind on the Akihabara rail",
    votes: 1422,
    gradient: "from-[#0d2a4a] via-[#1a0d5c] to-[#2d1060]",
  },
  {
    id: "3",
    rank: 3,
    author: "@pixel.boy",
    caption: "Midnight kickflip combo x3",
    votes: 998,
    gradient: "from-[#1a1060] via-[#2d0d5c] to-[#0d1a3a]",
  },
  {
    id: "4",
    rank: 4,
    author: "@miyu",
    caption: "Manual to nose-grind, first try",
    votes: 760,
    gradient: "from-[#1a0d3a] via-[#3a0d6a] to-[#1a2d5a]",
  },
  {
    id: "5",
    rank: 5,
    author: "@solar",
    caption: "Bowl run with new wheels",
    votes: 612,
    gradient: "from-[#0d1a4a] via-[#2d1060] to-[#3d0d4a]",
  },
  {
    id: "6",
    rank: 6,
    author: "@dreamer",
    caption: "Slow-mo heelflip down 5 stairs",
    votes: 503,
    gradient: "from-[#1a2d5a] via-[#0d1060] to-[#2d0d4a]",
  },
];

export const MOCK_REWARDS = [
  {
    contest: "Cyberpunk Poster Design Challenge",
    date: "2025-04-12",
    amount: 12500,
    tx: "0x9f…b21",
  },
  {
    contest: "Lo-Fi Beat Drop",
    date: "2025-02-22",
    amount: 3200,
    tx: "0x9f…b21",
  },
  {
    contest: "1-Line Sci-Fi Story",
    date: "2024-12-30",
    amount: 800,
    tx: "0x9f…b21",
  },
];

export const MOCK_CERTIFICATES = [
  {
    contest: "Cyberpunk Poster Design Challenge",
    date: "2025-04-12",
    amount: 12500,
  },
  { contest: "Lo-Fi Beat Drop", date: "2025-02-22", amount: 3200 },
  { contest: "1-Line Sci-Fi Story", date: "2024-12-30", amount: 800 },
];
