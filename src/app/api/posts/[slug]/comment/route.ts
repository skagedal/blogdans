import { db } from "@/db/client";
import { postCommentSchema } from "@/lib/api/comments";
import z from "zod";

const paramsSchema = z.object({
  slug: z.string(),
});

interface Props {
  params: Promise<z.infer<typeof paramsSchema>>;
}

export async function POST(request: Request, props: Props) {
  const params = paramsSchema.parse(await props.params);
  const body = postCommentSchema.parse(await request.json());

  console.log(`Received comment for post ${params.slug}:`, body);
  db.insertInto("comment").values({
    author_id: '647009de-8600-46f7-987e-6bb957244c91',
    post_id: params.slug,
    content: body.comment,
  }).execute().catch((error) => {
    console.error(`Failed to insert comment for post ${params.slug}:`, error);
    return new Response(JSON.stringify({ success: false, error: "Failed to post comment" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
