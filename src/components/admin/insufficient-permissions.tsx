"use client";

import { ShieldX } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { Card, CardContent } from "../ui/card";

export function InsufficientPermissions() {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <Alert variant="destructive">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>
            You are logged in, but you don't have the necessary privileges to access this page. 
            Please contact an administrator if you believe you should have access.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}