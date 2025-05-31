"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { useToast } from "../../hooks/use-toast";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2, UserCircle } from "lucide-react";
import { AuthenticatedUser, User } from "@/lib/user";
import { NotLoggedIn } from "./not-logged-in";
import { Avatar, AvatarImage } from "../ui/avatar";

interface CommentFormProps {
  user: AuthenticatedUser;
  pageId: string;
  onCommentPosted: () => void;
}

const MAX_CHARS = 1000;

async function postComment(pageId: string, commentData: { content: string }) {
  // make a promise that waits for a second and then resolves with a success object
  // This is a placeholder for the actual API call to post the comment
  console.log(`Posting comment for page ${pageId}:`, commentData);
  return await fetch(`/api/posts/${pageId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commentData),
  });
}

export function FormOrLogin({ pageId, user }: { pageId: string; user: User }) {
  switch (user.$case) {
    case "authenticated":
      return (
        <CommentForm pageId={pageId} user={user} onCommentPosted={() => {}} />
      );
    case "anonymous":
      return <NotLoggedIn />;
  }
}

export function CommentForm({
  pageId,
  user,
  onCommentPosted,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const remainingChars = MAX_CHARS - content.length;
  const isOverLimit = remainingChars < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isOverLimit || content.trim() === "" || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const commentData = {
      content: content.trim(),
    };

    try {
      const result = await postComment(pageId, commentData);

      if (result) {
        setContent("");
        toast({
          title: "Comment submitted",
          description: "Your comment is awaiting moderation.",
        });
        onCommentPosted();
      } else {
        toast({
          title: "Failed to submit comment",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-0">
        <div className="flex gap-2 items-center">
          <Avatar className="h-8 w-8">
            {user.photo ? (
              <AvatarImage src={user.photo} alt={user.name} />
            ) : (
              <UserCircle className="h-8 w-8" />
            )}
          </Avatar>
          {user.name}
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6">
          <Textarea
            placeholder="Leave a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="resize-none min-h-[100px]"
            maxLength={MAX_CHARS}
          />
          <div
            className={`text-xs mt-2 text-right ${
              isOverLimit ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {remainingChars} characters remaining
          </div>
        </CardContent>
        <CardFooter className="flex justify-between px-6 pb-6 pt-0">
          <p className="text-xs text-muted-foreground">
            Comments are moderated and will appear after approval.
          </p>
          <Button
            type="submit"
            disabled={isOverLimit || content.trim() === "" || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting
              </>
            ) : (
              "Submit Comment"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
