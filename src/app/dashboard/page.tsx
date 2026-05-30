import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PinnedItems } from "@/components/dashboard/PinnedItems";
import { RecentCollections } from "@/components/dashboard/RecentCollections";
import { RecentItems } from "@/components/dashboard/RecentItems";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [session, itemTypes, { favorites, recent }] = await Promise.all([
    auth(),
    getSidebarItemTypes(),
    getSidebarCollections(),
  ]);

  return (
    <DashboardShell
      sidebarData={{ itemTypes, favorites, recent }}
      user={session?.user ?? null}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your developer knowledge hub
          </p>
        </header>

        <StatsCards />
        <RecentCollections />
        <PinnedItems />
        <RecentItems />
      </div>
    </DashboardShell>
  );
}
