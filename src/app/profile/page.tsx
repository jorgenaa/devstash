import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getProfileData } from "@/lib/db/profile";
import { getShellData } from "@/lib/shell";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ItemTypeIcon } from "@/lib/item-type-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { session, userId, sidebarData, searchData } = await getShellData();

  const profile = await getProfileData(userId);

  if (!profile) {
    redirect("/sign-in");
  }

  const joined = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(profile.createdAt);

  return (
    <DashboardShell
      sidebarData={sidebarData}
      user={session.user}
      searchData={searchData}
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Your account information
          </p>
        </header>

        {/* User info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <UserAvatar name={profile.name ?? profile.email} image={profile.image} size="lg" />
            <div className="flex flex-col gap-0.5">
              {profile.name && (
                <p className="font-medium">{profile.name}</p>
              )}
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground">Joined {joined}</p>
            </div>
          </CardContent>
        </Card>

        {/* Usage stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage</CardTitle>
            <CardDescription>
              {profile.itemStats.total} items across {profile.collectionTotal} collection
              {profile.collectionTotal !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {profile.itemStats.byType.map((t) => (
                <div
                  key={t.name}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
                >
                  <ItemTypeIcon
                    name={t.icon}
                    className="size-4 shrink-0"
                    style={{ color: t.color }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium capitalize">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
