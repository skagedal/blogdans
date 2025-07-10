import { MessageSquare } from "lucide-react";
import { FormOrLogin } from "./comment-form";
import { ClientContext } from "./client-context";
import { Service } from "@/lib/service";

export const dynamic = "force-dynamic";

type Props = {
  pageId: string;
}

const service = new Service();

export async function Comments({ pageId }: Props) {
  const user = await service.getCurrentUser();

  return (
    <div className="py-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <MessageSquare className="mr-2 h-5 w-5" />
        Comments
      </h2>
      <ClientContext>
        <FormOrLogin pageId={pageId} user={user} />
      </ClientContext>
      
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No comments yet. Be the first to comment!</p>
      </div>
    </div>
  );
}
