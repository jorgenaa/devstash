export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { FileListRow } from "@/components/items/FileListRow";
import { ImageCard } from "@/components/items/ImageCard";
import { ItemCard } from "@/components/items/ItemCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { NewItemDialog, type TypeName } from "@/components/items/NewItemDialog";
import { Pagination } from "@/components/ui/pagination";
import { getSidebarCollections } from "@/lib/db/collections";
import { getItemsByType, getSidebarItemTypes } from "@/lib/db/items";
import { getSearchData } from "@/lib/db/search";
import { getEditorPreferences } from "@/lib/db/editor-preferences";
import { ItemTypeIcon } from "@/lib/item-type-icons";
import { ITEMS_PER_PAGE } from "@/lib/db/constants";
import { isProOnlyType } from "@/lib/usage-limits";

const CREATABLE_TYPES = new Set<string>(["snippet", "prompt", "command", "note", "link", "file", "image"]);

const TYPE_SLUG_MAP: Record<string, string> = {
  snippets: "snippet",
  prompts: "prompt",
  notes: "note",
  commands: "command",
  links: "link",
  files: "file",
  images: "image",
};

export default async function ItemTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ type: slug }, { page: pageParam }, session] = await Promise.all([
    params,
    searchParams,
    auth(),
  ]);

  if (!session?.user?.id) redirect("/sign-in");

  const [itemTypes, { favorites, recent }] = await Promise.all([
    getSidebarItemTypes(session.user.id),
    getSidebarCollections(session.user.id),
  ]);

  const typeName = TYPE_SLUG_MAP[slug];
  if (!typeName) notFound();

  const currentType = itemTypes.find((t) => t.name === typeName);
  if (!currentType) notFound();

  if (isProOnlyType(typeName) && !session.user.isPro) {
    redirect("/upgrade");
  }

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [{ items, totalCount }, searchData, editorPreferences] = await Promise.all([
    getItemsByType(session.user.id, typeName, page),
    getSearchData(session.user.id),
    getEditorPreferences(session.user.id),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const pageTitle = slug.charAt(0).toUpperCase() + slug.slice(1);

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
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${currentType.color}20` }}
            >
              <ItemTypeIcon
                name={currentType.icon}
                className="size-4.5"
                style={{ color: currentType.color }}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{pageTitle}</h2>
              <p className="text-xs text-muted-foreground">
                {totalCount} {totalCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          {CREATABLE_TYPES.has(typeName) && (
            <NewItemDialog defaultType={typeName as TypeName} isPro={session.user.isPro} />
          )}
        </div>

        {totalCount === 0 ? (
          <p className="text-sm text-muted-foreground">
            No {pageTitle.toLowerCase()} yet.
          </p>
        ) : typeName === "image" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ImageCard key={item.id} item={item} />
            ))}
          </div>
        ) : typeName === "file" ? (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <FileListRow key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          buildHref={(p) => `/items/${slug}?page=${p}`}
        />
      </div>
    </DashboardShell>
  );
}
