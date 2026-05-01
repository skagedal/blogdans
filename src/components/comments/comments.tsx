import { MessageSquare } from "lucide-react";
import { FormOrLogin } from "./comment-form";
import { ClientContext } from "./client-context";
import { getUser } from "@/lib/user";
import { CommentsList } from "./comments-list";
import { DiscussLinks } from "./discuss-links";

export const dynamic = "force-dynamic";

type Props = {
  pageId: string;
  hackernews?: string;
  bluesky?: string;
}

export async function Comments({ pageId, hackernews, bluesky }: Props) {
  const user = await getUser();
  console.log('User:', user);

  return (
    <div className="py-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <MessageSquare className="mr-2 h-5 w-5" />
        Comments
      </h2>
      <DiscussLinks hackernews={hackernews} bluesky={bluesky} />
      <ClientContext>
        <FormOrLogin pageId={pageId} user={user} />
        <CommentsList pageId={pageId} />
      </ClientContext>
    </div>
  );
}
