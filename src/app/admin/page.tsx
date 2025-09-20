import { ClientContext } from "@/components/comments/client-context";
import { AdminPageClient } from "./admin-client";
import { getUser } from "@/lib/user";
import { AdminLogin } from "@/components/admin/admin-login";
import { InsufficientPermissions } from "@/components/admin/insufficient-permissions";
import { getPermissions } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getUser();
  
  if (user.$case === "anonymous") {
    return (
      <main className="mx-auto max-w-6xl flex-1 p-4">
        <div className="space-y-8">
          <section>
            <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
            <AdminLogin />
          </section>
        </div>
      </main>
    );
  }
  
  if (!getPermissions(user).has('admin:read')) {
    return (
      <main className="mx-auto max-w-6xl flex-1 p-4">
        <div className="space-y-8">
          <section>
            <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
            <InsufficientPermissions />
          </section>
        </div>
      </main>
    );
  }

  return (
    <ClientContext>
      <AdminPageClient />
    </ClientContext>
  );
}
