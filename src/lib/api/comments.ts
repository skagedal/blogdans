import z from "zod";

export const postCommentSchema = z.object({
    comment: z.string().min(1, "Comment cannot be empty").max(1000, "Comment cannot exceed 1000 characters"),
});