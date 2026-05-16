// lib/auth.ts
import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

// Create SQLite database file
const sqliteDb = new Database("auth.db");

export const auth = betterAuth({
  database: sqliteDb,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Auto sign in after signup
  },
  socialProviders: {
    // Optional: Add Google/GitHub later
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
        unique: true,
      },
      walletAddress: {
        type: "string",
        required: false,
        unique: true,
      },
    },
  },
});
