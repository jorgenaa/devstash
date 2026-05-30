import { SignInForm } from "./_form";

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    callbackUrl?: string;
    registered?: string;
  }>;
}) {
  const params = await searchParams;
  return (
    <SignInForm
      error={params.error}
      callbackUrl={params.callbackUrl}
      registered={params.registered === "1"}
    />
  );
}
