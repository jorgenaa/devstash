import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getSearchData } from "@/lib/db/search";

/**
 * Fetches all data needed to render DashboardShell on a protected page.
 * Redirects to /sign-in if the user is not authenticated.
 */
export async function getShellData() {
  const [session, itemTypes, { favorites, recent }] = await Promise.all([
    auth(),
    getSidebarItemTypes(),
    getSidebarCollections(),
  ]);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const searchData = await getSearchData(session.user.id);

  return {
    session,
    userId: session.user.id,
    sidebarData: { itemTypes, favorites, recent },
    searchData,
  };
}
