import { auth as authMiddleware } from "@/auth";

export const config = {
  runtime: "nodejs",
};

export const middleware = authMiddleware;
