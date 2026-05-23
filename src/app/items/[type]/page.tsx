import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function ItemTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const title = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <DashboardShell>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">
        Items of type &ldquo;{type}&rdquo; will be listed here.
      </p>
    </DashboardShell>
  );
}
