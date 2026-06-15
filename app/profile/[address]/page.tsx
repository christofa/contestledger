import { ProfilePageClient } from "@/components/profile-page-client"

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ address: string }>
}) {
  const { address } = await params
  return <ProfilePageClient viewAddress={address} />
}