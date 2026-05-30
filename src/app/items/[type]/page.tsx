export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";

export default async function ItemTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const [{ type }, session, itemTypes, { favorites, recent }] =
    await Promise.all([
      params,
      auth(),
      getSidebarItemTypes(),
      getSidebarCollections(),
    ]);
  const title = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <DashboardShell
      sidebarData={{ itemTypes, favorites, recent }}
      user={session?.user ?? null}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">
        Items of type &ldquo;{type}&rdquo; will be listed here.
      </p>
    </DashboardShell>
  );
}
