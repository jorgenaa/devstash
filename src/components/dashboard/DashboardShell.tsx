"use client";

import { useEffect, useState } from "react";
import { PanelLeft, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sidebar, type SidebarData, type SidebarUser } from "@/components/dashboard/Sidebar";
import { NewItemDialog } from "@/components/items/NewItemDialog";
import { NewCollectionDialog } from "@/components/collections/NewCollectionDialog";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerContext";
import { CommandPalette } from "@/components/search/CommandPalette";
import { EditorPreferencesProvider } from "@/contexts/editor-preferences-context";
import type { SearchData } from "@/lib/db/search";
import { DEFAULT_EDITOR_PREFERENCES, type EditorPreferences } from "@/types/editor-preferences";

export function DashboardShell({
  children,
  sidebarData,
  user,
  searchData,
  editorPreferences = DEFAULT_EDITOR_PREFERENCES,
}: {
  children: React.ReactNode;
  sidebarData: SidebarData;
  user: SidebarUser | null;
  searchData: SearchData;
  editorPreferences?: EditorPreferences;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <EditorPreferencesProvider initial={editorPreferences}>
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            DS
          </div>
          <span className="hidden text-sm font-semibold sm:inline">
            DevStash
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle sidebar"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <PanelLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden md:inline-flex"
          onClick={() => setCollapsed((v) => !v)}
        >
          <PanelLeft className="size-4" />
        </Button>

        <div className="relative mx-auto w-full max-w-xl">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search… ⌘K"
            className="cursor-pointer pl-8"
            aria-label="Open search"
            readOnly
            onClick={() => setPaletteOpen(true)}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <NewCollectionDialog />
          <NewItemDialog />
        </div>
      </header>

      <ItemDrawerProvider>
        <CommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          searchData={searchData}
        />

        <div className="flex min-h-0 flex-1">
          <aside className="hidden border-r border-sidebar-border md:flex">
            <Sidebar data={sidebarData} user={user} collapsed={collapsed} />
          </aside>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent
              side="left"
              className="w-64 bg-sidebar p-0 sm:max-w-xs"
              showCloseButton={false}
            >
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Sidebar data={sidebarData} user={user} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </ItemDrawerProvider>
    </div>
    </EditorPreferencesProvider>
  );
}
