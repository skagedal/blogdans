"use client";

import { MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Alert, AlertDescription } from "../ui/alert";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";

export function NotLoggedIn() {
  const pathname = usePathname();
  const href = `/login?next=${encodeURIComponent(pathname)}`;
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            Please sign in to leave a comment. You can sign in with Google or
            with an email address and password.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-end px-6 pb-6 pt-0">
        <Button asChild>
          <Link href={href}>Sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
