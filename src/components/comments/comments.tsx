import { User } from "@/lib/user";
import { MessageSquare } from "lucide-react";
import { headers } from "next/headers";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { NotLoggedIn } from "./not-logged-in";
import { CommentForm, FormOrLogin } from "./comment-form";

export const dynamic = "force-dynamic";

async function getUser(): Promise<User> {
  const h = await headers();
  const email = h.get("x-email");
  const name = h.get("x-user");
  if (email && name) {
    return {
      $case: "authenticated",
      email,
      name,
    };
  } else {
    return {
      $case: "anonymous",
    };
  }
}

export async function Comments() {
  const user = await getUser();

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <MessageSquare className="mr-2 h-5 w-5" />
        Comments
      </h2>
      <FormOrLogin pageId="test" user={user} />
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No comments yet. Be the first to comment!</p>
      </div>
    </div>
  );
}
