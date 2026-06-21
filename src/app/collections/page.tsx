export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { NewCollectionDialog } from "@/components/collections/NewCollectionDialog";
import { Pagination } from "@/components/ui/pagination";
import { getAllCollections, getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getSearchData } from "@/lib/db/search";
import { getEditorPreferences } from "@/lib/db/editor-preferences";
import { COLLECTIONS_PER_PAGE } from "@/lib/db/constants";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ page: pageParam }, session] = await Promise.all([searchParams, auth()]);

  if (!session?.user?.id) redirect("/sign-in");

  const [itemTypes, { favorites, recent }] = await Promise.all([
    getSidebarItemTypes(session.user.id),
    getSidebarCollections(session.user.id),
  ]);

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [{ collections, totalCount }, searchData, editorPreferences] = await Promise.all([
    getAllCollections(session.user.id, page),
    getSearchData(session.user.id),
    getEditorPreferences(session.user.id),
  ]);

  const totalPages = Math.ceil(totalCount / COLLECTIONS_PER_PAGE);

  return (
    <DashboardShell
      sidebarData={{ itemTypes, favorites, recent }}
      user={session.user}
      searchData={searchData}
      editorPreferences={editorPreferences}
      isPro={session.user.isPro}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Collections</h1>
            <p className="text-xs text-muted-foreground">
              {totalCount}{" "}
              {totalCount === 1 ? "collection" : "collections"}
            </p>
          </div>
          <NewCollectionDialog />
        </div>

        {totalCount === 0 ? (
          <p className="text-sm text-muted-foreground">No collections yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          buildHref={(p) => `/collections?page=${p}`}
        />
      </div>
    </DashboardShell>
  );
}
