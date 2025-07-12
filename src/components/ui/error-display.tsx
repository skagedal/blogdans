import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { AlertTriangle } from "lucide-react";

interface ErrorDisplayProps {
  error: Error | { message: string; code?: string | number } | string;
  title?: string;
  className?: string;
}

export function ErrorDisplay({ error, title = "Error", className }: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || "An unexpected error occurred";
  
  const errorCode = typeof error === 'object' && error !== null && 'code' in error 
    ? error.code 
    : null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="space-y-1">
          <p>{errorMessage}</p>
          {errorCode && (
            <p className="text-xs font-mono opacity-75">
              Error code: {errorCode}
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}