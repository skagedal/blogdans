"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

const MIN_PASSWORD = 12;

type Mode = "sign-in" | "sign-up";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "sign-in") {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message ?? "Sign in failed");
      } else {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name: name.trim(),
        });
        if (error) throw new Error(error.message ?? "Sign up failed");
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      toast({
        title: mode === "sign-in" ? "Sign in failed" : "Sign up failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  const onGoogle = async () => {
    setSubmitting(true);
    await authClient.signIn.social({ provider: "google", callbackURL: next });
  };

  const isSignUp = mode === "sign-up";

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMode("sign-in")}
            className={`px-3 py-1 rounded-md ${mode === "sign-in" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("sign-up")}
            className={`px-3 py-1 rounded-md ${mode === "sign-up" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
          >
            Create account
          </button>
        </div>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={isSignUp ? MIN_PASSWORD : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {isSignUp && (
              <p className="text-xs text-muted-foreground">
                At least {MIN_PASSWORD} characters.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSignUp ? "Creating account" : "Signing in"}
              </>
            ) : isSignUp ? (
              "Create account"
            ) : (
              "Sign in"
            )}
          </Button>
          <div className="flex items-center gap-3 w-full text-xs text-muted-foreground">
            <div className="flex-1 border-t" />
            <span>or</span>
            <div className="flex-1 border-t" />
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={onGoogle}
            className="w-full"
          >
            Continue with Google
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
