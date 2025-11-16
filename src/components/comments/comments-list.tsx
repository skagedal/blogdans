"use client";

import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarImage } from "../ui/avatar";
import { MessageSquare, UserCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type CommentsListProps = {
  pageId: string;
}

export function CommentsList({ pageId }: CommentsListProps) {
  const trpc = useTRPC();
  const { data: comments, isLoading } = useQuery(
    trpc.post.getComments.queryOptions({ postId: pageId })
  );

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Loading comments...</p>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                {comment.author_photo ? (
                  <AvatarImage src={comment.author_photo} alt={comment.author_name} />
                ) : (
                  <UserCircle className="h-10 w-10" />
                )}
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-semibold">{comment.author_name}</span>
                  {comment.created_at && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
