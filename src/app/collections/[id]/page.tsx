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
import { ItemDrawerProvider } from "@/components/items/ItemDrawerContext";
import { getCollectionWithItems, getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, session, itemTypes, { favorites, recent }] = await Promise.all([
    params,
    auth(),
    getSidebarItemTypes(),
    getSidebarCollections(),
  ]);

  if (!session?.user?.id) redirect("/sign-in");

  const result = await getCollectionWithItems(session.user.id, id);
  if (!result) notFound();

  const { collection, items } = result;

  const imageItems = items.filter((item) => item.type.name === "image");
  const fileItems = items.filter((item) => item.type.name === "file");
  const otherItems = items.filter(
    (item) => item.type.name !== "image" && item.type.name !== "file",
  );

  return (
    <DashboardShell
      sidebarData={{ itemTypes, favorites, recent }}
      user={session.user}
    >
      <ItemDrawerProvider>
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

          {items.length === 0 ? (
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
        </div>
      </ItemDrawerProvider>
    </DashboardShell>
  );
}
