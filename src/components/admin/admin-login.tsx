import { Shield } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "../ui/alert";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";

export function AdminLogin() {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access the admin panel. You need administrator privileges to view this page.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-end px-6 pb-6 pt-0">
        <Button asChild>
          <Link href="/login?next=/admin">Sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
