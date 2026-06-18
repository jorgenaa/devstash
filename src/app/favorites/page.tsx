export const dynamic = "force-dynamic";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerContext";
import { FavoritesList } from "@/components/favorites/FavoritesList";
import { getShellData } from "@/lib/shell";
import { getFavoritedItems, getFavoritedCollections } from "@/lib/db/favorites";

export default async function FavoritesPage() {
  const { userId, session, isPro, sidebarData, searchData, editorPreferences } =
    await getShellData();

  const [items, collections] = await Promise.all([
    getFavoritedItems(userId),
    getFavoritedCollections(userId),
  ]);

  return (
    <DashboardShell
      sidebarData={sidebarData}
      user={session.user}
      searchData={searchData}
      editorPreferences={editorPreferences}
      isPro={isPro}
    >
      <ItemDrawerProvider>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-lg font-semibold">Favorites</h1>
            <p className="text-xs text-muted-foreground">
              {items.length + collections.length} starred
            </p>
          </div>

          <FavoritesList items={items} collections={collections} />
        </div>
      </ItemDrawerProvider>
    </DashboardShell>
  );
}
