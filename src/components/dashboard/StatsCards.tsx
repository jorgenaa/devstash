import { FolderOpen, Package, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getCollectionStats } from "@/lib/db/collections";
import { mockItems } from "@/lib/mock-data";

type Stat = {
  label: string;
  value: number;
  icon: LucideIcon;
};

export async function StatsCards() {
  const collectionStats = await getCollectionStats();

  const stats: Stat[] = [
    {
      label: "Items",
      value: mockItems.length,
      icon: Package,
    },
    {
      label: "Collections",
      value: collectionStats.total,
      icon: FolderOpen,
    },
    {
      label: "Favorite items",
      value: mockItems.filter((i) => i.isFavorite).length,
      icon: Star,
    },
    {
      label: "Favorite collections",
      value: collectionStats.favorites,
      icon: Star,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm" className="px-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
              <span className="text-2xl font-semibold tabular-nums">
                {stat.value}
              </span>
            </div>
            <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <stat.icon className="size-4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
