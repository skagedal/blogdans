import z from "zod";

export const postCommentSchema = z.object({
  pageId: z.string()
    .min(1, "Page ID is required")
    .max(100, "Page ID cannot exceed 100 characters"),
  comment: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment cannot exceed 1000 characters"),
});

export type PostComment = z.infer<typeof postCommentSchema>;
