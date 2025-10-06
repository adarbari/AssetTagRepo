import React from &apos;react&apos;;

/**
 * Generic Error State Component
 *
 * Provides consistent error UI across the application
 */

import { AlertTriangle, RefreshCw, ArrowLeft } from &apos;lucide-react&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Alert, AlertDescription, AlertTitle } from &apos;../ui/alert&apos;;

interface ErrorStateProps {
  error: Error | string;
  retry?: () => void;
  onBack?: () => void;
  fullScreen?: boolean;
}

export function ErrorState({
  error,
  retry,
  onBack,
  fullScreen = false,
}: ErrorStateProps) {
  const errorMessage = typeof error === &apos;string&apos; ? error : error.message;

  const content = (
    <div className=&apos;text-center space-y-4&apos;>
      <div className=&apos;flex justify-center&apos;>
        <div className=&apos;rounded-full bg-destructive/10 p-6&apos;>
          <AlertTriangle className=&apos;h-12 w-12 text-destructive&apos; />
        </div>
      </div>
      <div>
        <h3 className=&apos;mb-2&apos;>Something went wrong</h3>
        <p className=&apos;text-muted-foreground max-w-md mx-auto&apos;>{errorMessage}</p>
      </div>
      <div className=&apos;flex items-center justify-center gap-2&apos;>
        {onBack && (
          <Button variant=&apos;outline&apos; onClick={onBack}>
            <ArrowLeft className=&apos;h-4 w-4 mr-2&apos; />
            Go Back
          </Button>
        )}
        {retry && (
          <Button onClick={retry}>
            <RefreshCw className=&apos;h-4 w-4 mr-2&apos; />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className=&apos;flex items-center justify-center h-screen p-8&apos;>
        {content}
      </div>
    );
  }

  return (
    <div className=&apos;p-8&apos;>
      <Alert variant=&apos;destructive&apos; className=&apos;max-w-2xl mx-auto&apos;>
        <AlertTriangle className=&apos;h-4 w-4&apos; />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {errorMessage}
          {retry && (
            <Button
              variant=&apos;outline&apos;
              size=&apos;sm&apos;
              onClick={retry}
              className=&apos;mt-2&apos;
            >
              <RefreshCw className=&apos;h-4 w-4 mr-2&apos; />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
