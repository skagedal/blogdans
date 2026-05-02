import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-md flex-1 p-4">
      <h1 className="text-3xl font-bold mb-8">Reset your password</h1>
      <ForgotPasswordForm />
    </main>
  );
}
