"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertCircle className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Something went wrong loading the dashboard.
      </p>
      <Button variant="outline" size="sm" onClick={reset}>
        <RefreshCw className="mr-2 size-4" />
        Try again
      </Button>
    </div>
  );
}
