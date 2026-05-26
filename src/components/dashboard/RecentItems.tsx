import { Clock } from "lucide-react";

import { ItemRow } from "@/components/dashboard/ItemRow";
import { getRecentItems } from "@/lib/db/items";

export async function RecentItems() {
  const recent = await getRecentItems(10);

  return (
    <section>
      <header className="mb-3 flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <h2 className="text-base font-semibold">Recent</h2>
      </header>

      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {recent.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
