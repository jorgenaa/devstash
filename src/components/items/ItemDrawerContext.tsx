"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { ItemDetailDrawer } from "@/components/items/ItemDetailDrawer";

type ItemDrawerContextType = {
  openDrawer: (itemId: string) => void;
};

const ItemDrawerContext = createContext<ItemDrawerContextType | null>(null);

export function useItemDrawer() {
  const ctx = useContext(ItemDrawerContext);
  if (!ctx) throw new Error("useItemDrawer must be used within ItemDrawerProvider");
  return ctx;
}

export function ItemDrawerProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function openDrawer(itemId: string) {
    setSelectedId(itemId);
    setOpen(true);
  }

  return (
    <ItemDrawerContext.Provider value={{ openDrawer }}>
      {children}
      <ItemDetailDrawer
        itemId={selectedId}
        open={open}
        onOpenChange={setOpen}
      />
    </ItemDrawerContext.Provider>
  );
}
