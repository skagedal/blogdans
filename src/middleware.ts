import { auth as authMiddleware } from "@/auth";
import { logger } from "./logger";

export const config = {
  runtime: "nodejs",
};

function createProxy<T extends (...args: any[]) => any>(targetFunction: T): T {
  return ((...args: Parameters<T>) => {
    if (process.env.MIDDLEWARE === "true") {
      const result = targetFunction(...args);
      logger.info("Invoked auth middleware");
      return result;
    } else {
      console.log('Skipping auth middleware invocation');
    }
  }) as T;
}

export const middleware = createProxy(authMiddleware);
