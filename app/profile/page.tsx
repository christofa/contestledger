"use client"

import { ProfilePageClient } from "@/components/profile-page-client"

export default function ProfilePage() {
  // No address — ProfilePageClient resolves it from the connected wallet
  return <ProfilePageClient />
}