import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfilePageClient } from "@/components/profile-page-client";
import { auth } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  return <ProfilePageClient />;
}
