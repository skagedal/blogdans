"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";

const MIN_PASSWORD = 12;

export function ResetPasswordForm({ token, error }: { token?: string; error?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (error || !token) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          <p>This reset link is invalid or has expired.</p>
          <Button asChild>
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (resetError) throw new Error(resetError.message ?? "Reset failed");
      toast({
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });
      router.push("/login");
      router.refresh();
    } catch (err) {
      toast({
        title: "Couldn't reset your password",
        description: err instanceof Error ? err.message : "Try requesting a new reset link.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">New password</label>
            <input
              id="password"
              type="password"
              required
              minLength={MIN_PASSWORD}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">At least {MIN_PASSWORD} characters.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating
              </>
            ) : (
              "Set new password"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
