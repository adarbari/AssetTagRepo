import React from 'react';

/**
 * Generic Error State Component
 *
 * Provides consistent error UI across the application
 */

import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

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
  const errorMessage = typeof error === 'string' ? error : error.message;

  const content = (
    <div className='text-center space-y-4'>
      <div className='flex justify-center'>
        <div className='rounded-full bg-destructive/10 p-6'>
          <AlertTriangle className='h-12 w-12 text-destructive' />
        </div>
      </div>
      <div>
        <h3 className='mb-2'>Something went wrong</h3>
        <p className='text-muted-foreground max-w-md mx-auto'>{errorMessage}</p>
      </div>
      <div className='flex items-center justify-center gap-2'>
        {onBack && (
          <Button variant='outline' onClick={onBack}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Go Back
          </Button>
        )}
        {retry && (
          <Button onClick={retry}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className='flex items-center justify-center h-screen p-8'>
        {content}
      </div>
    );
  }

  return (
    <div className='p-8'>
      <Alert variant='destructive' className='max-w-2xl mx-auto'>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {errorMessage}
          {retry && (
            <Button
              variant='outline'
              size='sm'
              onClick={retry}
              className='mt-2'
            >
              <RefreshCw className='h-4 w-4 mr-2' />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
