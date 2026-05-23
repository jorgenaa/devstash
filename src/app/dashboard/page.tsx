import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            DS
          </div>
          <span className="text-sm font-semibold">DevStash</span>
        </div>
        <div className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items…"
            className="pl-8"
            aria-label="Search items"
          />
        </div>
        <div className="flex flex-1 justify-end">
          <Button>
            <Plus className="size-4" />
            New Item
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-60 border-r border-border bg-sidebar p-4">
          <h2 className="text-lg font-semibold">Sidebar</h2>
        </aside>
        <main className="flex-1 p-6">
          <h2 className="text-lg font-semibold">Main</h2>
        </main>
      </div>
    </div>
  );
}
