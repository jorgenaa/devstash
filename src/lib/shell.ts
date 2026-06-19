import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getSearchData } from "@/lib/db/search";
import { getEditorPreferences } from "@/lib/db/editor-preferences";

export async function getShellData() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userId = session.user.id;
  const [itemTypes, { favorites, recent }, searchData, editorPreferences] = await Promise.all([
    getSidebarItemTypes(userId),
    getSidebarCollections(userId),
    getSearchData(userId),
    getEditorPreferences(userId),
  ]);

  return {
    session,
    userId: session.user.id,
    isPro: session.user.isPro,
    sidebarData: { itemTypes, favorites, recent },
    searchData,
    editorPreferences,
  };
}
