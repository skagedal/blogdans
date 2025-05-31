import { PropsWithChildren } from "react";
import { Header } from "./header";
import { Toaster } from "./ui/toaster";

export function Body({ children }: PropsWithChildren<object>) {
  return (
    <body className="root min-h-screen bg-background text-foreground antialiased">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />
        <Toaster />
        {children}
      </div>
    </body>
  );
}
