import { db } from "@/db/client";
import { sql } from "kysely";
import { markdownComponents } from "@/components/markdown-components";
import Markdown from "react-markdown";
import z from "zod";

const countSchema = z.object({
  count: z.string(),
});

export default async function AboutPage() {
  const result = await db.executeQuery(
    sql`SELECT COUNT(*) AS count FROM post`.compile(db)
  );
  const row = countSchema.parse(result.rows[0]);
  
  return (
    <article>
      <Markdown components={markdownComponents}>
        {`
# Markdown Example
There are currently **${row.count}** posts in the database.
`}
      </Markdown>
    </article>
  );
}
