export const dynamic = "force-dynamic"; // ensure this page is never statically generated

import { db } from "@/db/client";
import { sql } from "kysely";
import { markdownComponents } from "@/components/markdown-components";
import Markdown from "react-markdown";
import z from "zod";

const countSchema = z.object({
  count: z.string(),
});

async function fetchPostCount() {
  const result = await db.executeQuery(
    sql`SELECT COUNT(*) AS count FROM post`.compile(db)
  );
  return countSchema.parse(result.rows[0]).count;
}

export default async function AboutPage() {
  const result = await fetchPostCount();

  return (
    <article>
      <Markdown components={markdownComponents}>
        {`
# Markdown Example
There are currently **${result}** posts in the database.
`}
      </Markdown>
    </article>
  );
}
