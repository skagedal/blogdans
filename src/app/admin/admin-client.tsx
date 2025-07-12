"use client";

import { H2 } from "@/components/ui/typography";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ErrorDisplay } from "@/components/ui/error-display";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Check, X, ChevronLeft, ChevronRight } from "lucide-react";

export function AdminPageClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const trpc = useTRPC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingComments, isLoading: commentsLoading, error: commentsError } = useQuery(
    trpc.admin.getPendingComments.queryOptions()
  );

  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery(
    trpc.admin.getUsers.queryOptions({ page: currentPage, limit: 20 })
  );

  const { data: countData, isLoading: countLoading } = useQuery(
    trpc.test.numberOfPosts.queryOptions()
  );

  const { mutateAsync: approveComment, isPending: isApproving } = useMutation(
    trpc.admin.approveComment.mutationOptions()
  );

  const { mutateAsync: deleteComment, isPending: isDeleting } = useMutation(
    trpc.admin.deleteComment.mutationOptions()
  );

  const handleApproveComment = async (commentId: string) => {
    try {
      await approveComment({ commentId });
      toast({
        title: "Comment approved",
        description: "The comment has been approved and is now visible.",
      });
      queryClient.invalidateQueries(trpc.admin.getPendingComments.queryOptions());
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve comment.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment({ commentId });
      toast({
        title: "Comment deleted",
        description: "The comment has been permanently deleted.",
      });
      queryClient.invalidateQueries(trpc.admin.getPendingComments.queryOptions());
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete comment.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="mx-auto max-w-6xl flex-1 p-4">
      <div className="space-y-8">
        <section>
          <h2>Count data</h2>
          {countLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-lg font-semibold">Number of posts: {countData?.count}</p>
              </CardContent>
            </Card>
          )}
          <H2>Pending Comments</H2>
          {commentsError ? (
            <ErrorDisplay 
              error={commentsError} 
              title="Failed to load pending comments"
            />
          ) : commentsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : pendingComments && pendingComments.length > 0 ? (
            <div className="space-y-4">
              {pendingComments.map((comment) => (
                <Card key={comment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{comment.author_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{comment.author_email}</p>
                        <p className="text-sm text-muted-foreground">
                          Post: {comment.post_id} • {comment.created_at ? new Date(comment.created_at).toLocaleString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{comment.content}</p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApproveComment(comment.id)}
                      disabled={isApproving || isDeleting}
                    >
                      {isApproving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={isApproving || isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No pending comments</p>
              </CardContent>
            </Card>
          )}
        </section>

        <section>
          <H2>Users</H2>
          {usersError ? (
            <ErrorDisplay 
              error={usersError} 
              title="Failed to load users"
            />
          ) : usersLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : usersData ? (
            <div className="space-y-4">
              <div className="grid gap-4">
                {usersData.users.map((user) => (
                  <Card key={user.id}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <img
                          src={user.photo}
                          alt={user.name}
                          className="h-12 w-12 rounded-full"
                        />
                        <div>
                          <CardTitle className="text-lg">{user.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {usersData.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {usersData.page} of {usersData.totalPages} ({usersData.total} total users)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= usersData.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ErrorDisplay 
              error="No user data available"
              title="Failed to load users"
            />
          )}
        </section>
      </div>
    </main>
  );
}