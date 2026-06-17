"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function CheckoutToast() {
  const searchParams = useSearchParams();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    const status = searchParams.get("checkout");
    if (status === "success") {
      fired.current = true;
      toast.success("You're now on Pro!", { description: "Enjoy unlimited items, uploads, and AI features." });
    } else if (status === "cancelled") {
      fired.current = true;
      toast.info("Checkout cancelled", { description: "You can upgrade any time from Settings." });
    }
  }, [searchParams]);

  return null;
}
