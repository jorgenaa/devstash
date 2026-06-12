export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { NewCollectionDialog } from "@/components/collections/NewCollectionDialog";
import { getAllCollections, getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getSearchData } from "@/lib/db/search";

export default async function CollectionsPage() {
  const [session, itemTypes, { favorites, recent }] = await Promise.all([
    auth(),
    getSidebarItemTypes(),
    getSidebarCollections(),
  ]);

  if (!session?.user?.id) redirect("/sign-in");

  const [collections, searchData] = await Promise.all([
    getAllCollections(session.user.id),
    getSearchData(session.user.id),
  ]);

  return (
    <DashboardShell
      sidebarData={{ itemTypes, favorites, recent }}
      user={session.user}
      searchData={searchData}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Collections</h1>
            <p className="text-xs text-muted-foreground">
              {collections.length}{" "}
              {collections.length === 1 ? "collection" : "collections"}
            </p>
          </div>
          <NewCollectionDialog />
        </div>

        {collections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No collections yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
