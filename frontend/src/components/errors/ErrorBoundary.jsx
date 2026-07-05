import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * ErrorBoundary
 *
 * Class component — catches JS render errors in its subtree and shows
 * a fallback UI with a retry option.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeFeatureComponent />
 *   </ErrorBoundary>
 *
 *   Or with a custom fallback:
 *   <ErrorBoundary fallback={<p>Something broke.</p>}>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Swap with a real logging service (Sentry etc.) in production
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30">
            <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Something went wrong
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <Button variant="outline" size="sm" className="mt-5" onClick={this.handleReset}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
