"use client";

import { useState } from "react";
import { PanelLeft, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sidebar, type SidebarData, type SidebarUser } from "@/components/dashboard/Sidebar";
import { NewItemDialog } from "@/components/items/NewItemDialog";
import { NewCollectionDialog } from "@/components/collections/NewCollectionDialog";

export function DashboardShell({
  children,
  sidebarData,
  user,
}: {
  children: React.ReactNode;
  sidebarData: SidebarData;
  user: SidebarUser | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
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
            placeholder="Search items…"
            className="pl-8"
            aria-label="Search items"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <NewCollectionDialog />
          <NewItemDialog />
        </div>
      </header>

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
    </div>
  );
}
