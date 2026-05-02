"use client";

import { MessageSquare } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";

export function NotLoggedIn() {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            Please log in to leave a comment. Currently, only Google login is
            supported. If this is a problem for you, and you would like to
            comment on the blog, please contact me through any of the means
            listed at the site footer.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-end px-6 pb-6 pt-0">
        <Button onClick={() => authClient.signIn.social({ provider: "google", callbackURL: window.location.pathname })}>
          Log in with Google
        </Button>
      </CardFooter>
    </Card>
  );
}
