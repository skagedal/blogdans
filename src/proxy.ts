import { auth as authMiddleware } from "@/auth";

export const proxy = authMiddleware;
