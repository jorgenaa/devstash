import Link from "next/link";

import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { getRecentCollections } from "@/lib/db/collections";

export async function RecentCollections() {
  const collections = await getRecentCollections(6);

  return (
    <section>
      <header className="mb-3 flex items-end justify-between">
        <h2 className="text-base font-semibold">Collections</h2>
        <Link
          href="/collections"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          View all
        </Link>
      </header>

      {collections.length === 0 ? (
        <p className="text-sm text-muted-foreground">No collections yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </section>
  );
}
