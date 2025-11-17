"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { useToast } from "../../hooks/use-toast";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2, LogOut, UserCircle } from "lucide-react";
import { BlogdansUser, User } from "@/lib/user";
import { NotLoggedIn } from "./not-logged-in";
import { Avatar, AvatarImage } from "../ui/avatar";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { handleLogout } from "@/lib/login";

interface CommentFormProps {
  user: BlogdansUser;
  pageId: string;
  onCommentPosted: () => void;
}

const MAX_CHARS = 1000;

export function FormOrLogin({ pageId, user }: { pageId: string; user: User }) {
  switch (user.$case) {
    case "authenticated":
      return (
        <CommentForm pageId={pageId} user={user.info} onCommentPosted={() => {}} />
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
  const { toast } = useToast();
  const trpc = useTRPC();

  const { mutateAsync: submitComment, isPending: isSubmitting } = useMutation(trpc.post.submitComment.mutationOptions());

  const remainingChars = MAX_CHARS - content.length;
  const isOverLimit = remainingChars < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const comment = content.trim();

    try {
      const result = await submitComment({ pageId, comment });

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
    } 
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-0">
        <div className="flex gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring">
                <Avatar className="h-8 w-8 cursor-pointer">
                  {user.photo ? (
                    <AvatarImage src={user.photo} alt={user.name} />
                  ) : (
                    <UserCircle className="h-8 w-8" />
                  )}
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Avatar className="h-8 w-8">
                  {user.photo ? (
                    <AvatarImage src={user.photo} alt={user.name} />
                  ) : (
                    <UserCircle className="h-8 w-8" />
                  )}
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => await handleLogout()}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
