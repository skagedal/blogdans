import { db } from "@/db/client";
import { publicProcedure, router } from "../server";
import { sql } from "kysely";

export const testRouter = router({
  numberOfPosts: publicProcedure.query(async ({ }) => {
    const result = await db.executeQuery(sql`SELECT COUNT(*) AS count FROM post`.compile(db));
    const row = result.rows[0]
    return { count: JSON.stringify(row) };
  }),
});