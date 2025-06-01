import { H2 } from "@/components/ui/typography";
import { getUser } from "@/lib/user";

export default async function AdminPage() {
  const user = await getUser();

  return (
    <main className="mx-auto max-w-3xl flex-1 p-4">
      <div>
        <section>
            <H2>Self</H2>
            <pre><code>{JSON.stringify(user,null,2)}</code></pre>
        </section>
        <section>
          <H2>Users</H2>
        </section>
      </div>
    </main>
  );
}
