import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getSearchData } from "@/lib/db/search";
import { getEditorPreferences } from "@/lib/db/editor-preferences";

export async function getShellData() {
  const [session, itemTypes, { favorites, recent }] = await Promise.all([
    auth(),
    getSidebarItemTypes(),
    getSidebarCollections(),
  ]);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [searchData, editorPreferences] = await Promise.all([
    getSearchData(session.user.id),
    getEditorPreferences(session.user.id),
  ]);

  return {
    session,
    userId: session.user.id,
    sidebarData: { itemTypes, favorites, recent },
    searchData,
    editorPreferences,
  };
}
