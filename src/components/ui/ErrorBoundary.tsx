import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional label for debugging — appears in console errors */
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render errors in children and shows a fallback instead of crashing the entire page.
 * Wrap individual sections so one failure doesn't kill the whole app.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const label = this.props.name ?? 'Unknown';
    console.error(`[ErrorBoundary:${label}]`, error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className='rounded-lg border border-kapwa-border-danger bg-kapwa-bg-danger-weak p-6 text-center'>
          <p className='text-kapwa-text-danger text-sm font-medium'>
            Something went wrong loading this section.
          </p>
          <button
            type='button'
            onClick={() => this.setState({ hasError: false, error: null })}
            className='mt-2 text-xs text-kapwa-text-link hover:underline'
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
