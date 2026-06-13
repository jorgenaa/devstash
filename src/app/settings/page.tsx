import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getProfileData } from "@/lib/db/profile";
import { getShellData } from "@/lib/shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { EditorPreferencesForm } from "@/components/settings/EditorPreferencesForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { session, userId, sidebarData, searchData, editorPreferences } = await getShellData();

  const profile = await getProfileData(userId);

  if (!profile) {
    redirect("/sign-in");
  }

  return (
    <DashboardShell
      sidebarData={sidebarData}
      user={session.user}
      searchData={searchData}
      editorPreferences={editorPreferences}
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings
          </p>
        </header>

        {/* Editor preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Editor Preferences</CardTitle>
            <CardDescription>Customize the code editor appearance and behavior</CardDescription>
          </CardHeader>
          <CardContent>
            <EditorPreferencesForm />
          </CardContent>
        </Card>

        {/* Change password */}
        {profile.hasPassword && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Password</CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Danger zone */}
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
            <p className="text-xs text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <DeleteAccountDialog />
        </div>
      </div>
    </DashboardShell>
  );
}
