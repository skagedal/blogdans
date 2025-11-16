import { db } from "@/db/client";
import { publicProcedure, router } from "../server";
import { sql } from "kysely";
import z from "zod";

const countSchema = z.object({
  count: z.string(),
});

export const testRouter = router({
  numberOfPosts: publicProcedure.query(async ({ }) => {
    const result = await db.executeQuery(sql`SELECT COUNT(*) AS count FROM post`.compile(db));
    const row = countSchema.parse(result.rows[0]);
    return { count: row.count };
  }),
});