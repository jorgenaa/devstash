export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { UpgradePricingCards } from "@/components/billing/UpgradePricingCards";
import { getShellData } from "@/lib/shell";

export default async function UpgradePage() {
  const { session, isPro, sidebarData, searchData, editorPreferences } = await getShellData();

  if (isPro) {
    redirect("/settings#billing");
  }

  return (
    <DashboardShell
      sidebarData={sidebarData}
      user={session.user}
      searchData={searchData}
      editorPreferences={editorPreferences}
      isPro={isPro}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-10 py-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Upgrade to Pro</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Unlock unlimited items, file uploads, AI features, and more.
          </p>
        </div>

        <UpgradePricingCards />
      </div>
    </DashboardShell>
  );
}
