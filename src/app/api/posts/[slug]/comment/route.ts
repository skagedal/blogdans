import { postCommentSchema } from "@/lib/api/comments";
import { request } from "http"
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
    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}