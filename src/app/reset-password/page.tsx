import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ token?: string; error?: string }>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token, error } = await searchParams;

  return (
    <main className="mx-auto max-w-md flex-1 p-4">
      <h1 className="text-3xl font-bold mb-8">Set a new password</h1>
      <ResetPasswordForm token={token} error={error} />
    </main>
  );
}
