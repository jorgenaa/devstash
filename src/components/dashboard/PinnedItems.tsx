import { Pin } from "lucide-react";

import { ItemRow } from "@/components/dashboard/ItemRow";
import { mockItems } from "@/lib/mock-data";

export function PinnedItems() {
  const pinned = mockItems
    .filter((item) => item.isPinned)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  if (pinned.length === 0) return null;

  return (
    <section>
      <header className="mb-3 flex items-center gap-2">
        <Pin className="size-4 text-muted-foreground" />
        <h2 className="text-base font-semibold">Pinned</h2>
      </header>

      <div className="flex flex-col gap-3">
        {pinned.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
