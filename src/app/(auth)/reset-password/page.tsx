import { ResetPasswordForm, ResetPasswordInvalidToken } from "./_form";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <ResetPasswordInvalidToken />;
  }

  return <ResetPasswordForm token={token} />;
}
