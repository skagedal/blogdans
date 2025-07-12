"use client";

import { TRPCProvider } from "@/lib/trpc/client";
import { AppRouter } from "@/lib/trpc/routers";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import SuperJSON from "superjson";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          console.log('Error:', error)
          // Don't retry 4xx errors
          if (error && typeof error === 'object' && 'status' in error) {
            const status = error.status as number;
            if (status >= 400 && status < 500) {
              return false;
            }
          }
          // Don't retry if we've already tried 3 times
          return failureCount < 3;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;
function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

function getBaseUrl() {
  if (typeof window !== 'undefined')
    return '';
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Wrap the top-level client component in this context
 */
export function ClientContext({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: SuperJSON,
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
