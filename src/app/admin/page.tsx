import { ClientContext } from "@/components/comments/client-context";
import { AdminPageClient } from "./admin-client";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <ClientContext>
      <AdminPageClient />
    </ClientContext>
  );
}
