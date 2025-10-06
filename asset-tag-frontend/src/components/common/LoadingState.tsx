/**
 * Generic Loading State Component
 *
 * Provides consistent loading UI across the application
 */

import React from &apos;react&apos;;
import { Loader2 } from &apos;lucide-react&apos;;

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  size?: &apos;sm&apos; | &apos;md&apos; | &apos;lg&apos;;
}

export function LoadingState({
  message = &apos;Loading...&apos;,
  fullScreen = false,
  size = &apos;md&apos;,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: &apos;h-4 w-4&apos;,
    md: &apos;h-8 w-8&apos;,
    lg: &apos;h-12 w-12&apos;,
  };

  const containerClasses = fullScreen
    ? &apos;flex items-center justify-center h-screen&apos;
    : &apos;flex items-center justify-center p-8&apos;;

  return (
    <div className={containerClasses}>
      <div className=&apos;text-center&apos;>
        <Loader2
          className={`${sizeClasses[size]} animate-spin mx-auto mb-4 text-primary`}
        />
        <p className=&apos;text-muted-foreground&apos;>{message}</p>
      </div>
    </div>
  );
}
