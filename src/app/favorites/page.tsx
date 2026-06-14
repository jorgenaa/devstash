export const dynamic = "force-dynamic";

import { Star } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerContext";
import { FavoriteItemRow, FavoriteCollectionRow } from "@/components/favorites/FavoriteRows";
import { getShellData } from "@/lib/shell";
import { getFavoritedItems, getFavoritedCollections } from "@/lib/db/favorites";

export default async function FavoritesPage() {
  const { userId, session, sidebarData, searchData, editorPreferences } =
    await getShellData();

  const [items, collections] = await Promise.all([
    getFavoritedItems(userId),
    getFavoritedCollections(userId),
  ]);

  const isEmpty = items.length === 0 && collections.length === 0;

  return (
    <DashboardShell
      sidebarData={sidebarData}
      user={session.user}
      searchData={searchData}
      editorPreferences={editorPreferences}
    >
      <ItemDrawerProvider>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-lg font-semibold">Favorites</h1>
            <p className="text-xs text-muted-foreground">
              {items.length + collections.length} starred
            </p>
          </div>

          {isEmpty ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Star className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No favorites yet.</p>
              <p className="text-xs text-muted-foreground">
                Star items and collections to find them here quickly.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {items.length > 0 && (
                <section>
                  <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Items — {items.length}
                  </p>
                  <div className="rounded-md border border-border/50">
                    {items.map((item) => (
                      <FavoriteItemRow key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              )}

              {collections.length > 0 && (
                <section>
                  <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Collections — {collections.length}
                  </p>
                  <div className="rounded-md border border-border/50">
                    {collections.map((collection) => (
                      <FavoriteCollectionRow
                        key={collection.id}
                        collection={collection}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </ItemDrawerProvider>
    </DashboardShell>
  );
}
