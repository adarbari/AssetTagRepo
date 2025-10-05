/**
 * Generic Loading State Component
 * 
 * Provides consistent loading UI across the application
 */

import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({ 
  message = "Loading...", 
  fullScreen = false,
  size = "md"
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const containerClasses = fullScreen
    ? "flex items-center justify-center h-screen"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin mx-auto mb-4 text-primary`} />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}