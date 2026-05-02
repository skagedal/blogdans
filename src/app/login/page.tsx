import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ next?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : "/";

  if (session) {
    redirect(safeNext);
  }

  return (
    <main className="mx-auto max-w-md flex-1 p-4">
      <h1 className="text-3xl font-bold mb-8">Sign in</h1>
      <LoginForm next={safeNext} />
    </main>
  );
}
