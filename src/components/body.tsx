import { PropsWithChildren } from "react";
import { Header } from "./header";
import { Toaster } from "./ui/toaster";

export function Body({ children }: PropsWithChildren<object>) {
  return (
    <body className="min-h-screen bg-white text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />
        <Toaster />
        {children}
      </div>
    </body>
  );
}
