export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { CollectionActions } from "@/components/collections/CollectionActions";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { FileListRow } from "@/components/items/FileListRow";
import { ImageCard } from "@/components/items/ImageCard";
import { ItemCard } from "@/components/items/ItemCard";
import { Pagination } from "@/components/ui/pagination";
import { getCollectionWithItems, getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getSearchData } from "@/lib/db/search";
import { getEditorPreferences } from "@/lib/db/editor-preferences";
import { COLLECTIONS_PER_PAGE } from "@/lib/db/constants";

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ id }, { page: pageParam }, session] = await Promise.all([params, searchParams, auth()]);

  if (!session?.user?.id) redirect("/sign-in");

  const [itemTypes, { favorites, recent }] = await Promise.all([
    getSidebarItemTypes(session.user.id),
    getSidebarCollections(session.user.id),
  ]);

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [result, searchData, editorPreferences] = await Promise.all([
    getCollectionWithItems(session.user.id, id, page),
    getSearchData(session.user.id),
    getEditorPreferences(session.user.id),
  ]);

  if (!result) notFound();

  const { collection, items, totalCount } = result;
  const totalPages = Math.ceil(totalCount / COLLECTIONS_PER_PAGE);

  const imageItems = items.filter((item) => item.type.name === "image");
  const fileItems = items.filter((item) => item.type.name === "file");
  const otherItems = items.filter(
    (item) => item.type.name !== "image" && item.type.name !== "file",
  );

  return (
    <DashboardShell
      sidebarData={{ itemTypes, favorites, recent }}
      user={session.user}
      searchData={searchData}
      editorPreferences={editorPreferences}
      isPro={session.user.isPro}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Link
            href="/collections"
            className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            All Collections
          </Link>

          <div
            className="rounded-lg border-l-4 bg-muted/20 px-4 py-3"
            style={
              collection.accentColor
                ? { borderLeftColor: collection.accentColor }
                : undefined
            }
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-lg font-semibold">{collection.name}</h1>
                {collection.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {collection.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {collection.itemCount}{" "}
                  {collection.itemCount === 1 ? "item" : "items"}
                </p>
              </div>
              <CollectionActions collection={collection} />
            </div>
          </div>
        </div>

        {totalCount === 0 ? (
          <p className="text-sm text-muted-foreground">
            No items in this collection yet.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {imageItems.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Images
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {imageItems.map((item) => (
                    <ImageCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {fileItems.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Files
                </h2>
                <div className="flex flex-col gap-2">
                  {fileItems.map((item) => (
                    <FileListRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {otherItems.length > 0 && (
              <div className="flex flex-col gap-3">
                {(imageItems.length > 0 || fileItems.length > 0) && (
                  <h2 className="text-sm font-medium text-muted-foreground">
                    Items
                  </h2>
                )}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {otherItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          buildHref={(p) => `/collections/${id}?page=${p}`}
        />
      </div>
    </DashboardShell>
  );
}
