import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PinnedItems } from "@/components/dashboard/PinnedItems";
import { RecentCollections } from "@/components/dashboard/RecentCollections";
import { RecentItems } from "@/components/dashboard/RecentItems";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getSearchData } from "@/lib/db/search";
import { getEditorPreferences } from "@/lib/db/editor-preferences";
import { DEFAULT_EDITOR_PREFERENCES } from "@/types/editor-preferences";
import type { SearchData } from "@/lib/db/search";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [session, itemTypes, { favorites, recent }] = await Promise.all([
    auth(),
    getSidebarItemTypes(),
    getSidebarCollections(),
  ]);

  const userId = session?.user?.id;
  const [searchData, editorPreferences] = await Promise.all([
    userId ? getSearchData(userId) : Promise.resolve<SearchData>({ items: [], collections: [] }),
    userId ? getEditorPreferences(userId) : Promise.resolve(DEFAULT_EDITOR_PREFERENCES),
  ]);

  return (
    <DashboardShell
      sidebarData={{ itemTypes, favorites, recent }}
      user={session?.user ?? null}
      searchData={searchData}
      editorPreferences={editorPreferences}
      isPro={session?.user?.isPro ?? false}
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
