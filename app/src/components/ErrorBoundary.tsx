import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <AlertTriangle
              size={32}
              className="mx-auto text-[var(--color-warm)] mb-4"
            />
            <h1 className="serif text-2xl mb-2">Something went wrong</h1>
            <p className="text-sm text-[var(--color-ink-3)] mb-4">
              The app hit an unexpected error. Reload the page to try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-md bg-[var(--color-accent)] text-[#f6f2ea] text-sm hover:bg-[var(--color-accent-2)]"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
