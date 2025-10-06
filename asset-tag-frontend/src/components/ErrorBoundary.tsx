import React, { Component, ReactNode } from &apos;react&apos;;
import { AlertTriangle } from &apos;lucide-react&apos;;
import { Button } from &apos;../ui/button&apos;;
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from &apos;../ui/card&apos;;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Filter out CSS security errors - these are harmless
    const errorMessage = error.message || &apos;&apos;;
    if (
      errorMessage.includes(&apos;cssRules&apos;) ||
      errorMessage.includes(&apos;CSSStyleSheet&apos;) ||
      errorMessage.includes(&apos;Cannot access rules&apos;)
    ) {
      // Don&apos;t show error UI for CSS security errors
      this.setState({ hasError: false });
      return;
    }

    // Log error details for debugging
// // // // // // // console.error(&apos;Error caught by ErrorBoundary:&apos;, error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className=&apos;flex items-center justify-center min-h-screen p-4 bg-muted/30&apos;>
          <Card className=&apos;max-w-2xl w-full&apos;>
            <CardHeader>
              <div className=&apos;flex items-center gap-3 mb-2&apos;>
                <div className=&apos;p-2 rounded-lg bg-destructive/10&apos;>
                  <AlertTriangle className=&apos;h-6 w-6 text-destructive&apos; />
                </div>
                <div>
                  <CardTitle>Something went wrong</CardTitle>
                  <CardDescription>
                    An error occurred while rendering this component
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className=&apos;space-y-4&apos;>
              {this.state.error && (
                <div className=&apos;p-4 bg-muted rounded-lg&apos;>
                  <p className=&apos;text-sm font-medium mb-2&apos;>Error Details:</p>
                  <code className=&apos;text-xs text-muted-foreground block whitespace-pre-wrap&apos;>
                    {this.state.error.toString()}
                  </code>
                </div>
              )}

              {process.env.NODE_ENV === &apos;development&apos; &&
                this.state.errorInfo && (
                  <details className=&apos;p-4 bg-muted rounded-lg&apos;>
                    <summary className=&apos;text-sm font-medium cursor-pointer mb-2&apos;>
                      Component Stack (Development Only)
                    </summary>
                    <code className=&apos;text-xs text-muted-foreground block whitespace-pre-wrap mt-2&apos;>
                      {this.state.errorInfo.componentStack}
                    </code>
                  </details>
                )}

              <div className=&apos;flex gap-2&apos;>
                <Button onClick={this.handleReset}>Try Again</Button>
                <Button
                  variant=&apos;outline&apos;
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
