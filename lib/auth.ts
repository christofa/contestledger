// lib/auth.ts
import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

// Create SQLite database file
const sqliteDb = new Database("auth.db");

export const auth = betterAuth({
  database: sqliteDb,
  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
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
