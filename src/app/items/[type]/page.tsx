export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { ItemCard } from "@/components/items/ItemCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getSidebarCollections } from "@/lib/db/collections";
import { getItemsByType, getSidebarItemTypes } from "@/lib/db/items";
import { ItemTypeIcon } from "@/lib/item-type-icons";

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
}: {
  params: Promise<{ type: string }>;
}) {
  const [{ type: slug }, session, itemTypes, { favorites, recent }] =
    await Promise.all([
      params,
      auth(),
      getSidebarItemTypes(),
      getSidebarCollections(),
    ]);

  if (!session?.user?.id) redirect("/sign-in");

  const typeName = TYPE_SLUG_MAP[slug];
  if (!typeName) notFound();

  const currentType = itemTypes.find((t) => t.name === typeName);
  if (!currentType) notFound();

  const items = await getItemsByType(session.user.id, typeName);

  const pageTitle = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <DashboardShell
      sidebarData={{ itemTypes, favorites, recent }}
      user={session.user}
    >
      <div className="flex flex-col gap-6">
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
            <h2 className="text-lg font-semibold">{pageTitle}</h2>
            <p className="text-xs text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No {pageTitle.toLowerCase()} yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
