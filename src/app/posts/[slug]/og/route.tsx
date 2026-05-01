import { ImageResponse } from "next/og";
import { format } from "date-fns";
import { getPost } from "@/lib/posts";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const post = await getPost(slug).catch(() => null);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 30,
            color: "#94a3b8",
            letterSpacing: "0.02em",
          }}
        >
          skagedal.tech
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {post.title}
          </div>
          {post.summary && (
            <div
              style={{
                fontSize: 32,
                color: "#cbd5e1",
                lineHeight: 1.35,
              }}
            >
              {post.summary}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#94a3b8",
          }}
        >
          <div style={{ display: "flex" }}>
            {format(post.date, "MMMM d, yyyy")}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: "flex", gap: 16 }}>
              {post.tags.slice(0, 3).map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    padding: "6px 16px",
                    border: "1px solid #475569",
                    borderRadius: 999,
                    color: "#cbd5e1",
                    fontSize: 22,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
