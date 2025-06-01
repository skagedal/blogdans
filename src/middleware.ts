import { auth as authMiddleware } from "@/auth";
import { logger } from "./logger";

export const config = {
  runtime: "nodejs",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
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
/* eslint-enable @typescript-eslint/no-explicit-any */

export const middleware = createProxy(authMiddleware);
