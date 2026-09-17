// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + UI Error Resilience
// MODULE: React Application Global Error Boundary
// ============================================================

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reload: () => void) => ReactNode);
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ResQGrid Error Boundary] Uncaught component exception:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public handleReload = (): void => {
    window.location.reload();
  };

  public handleHome = (): void => {
    window.location.href = '/';
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function' && this.state.error) {
        return this.props.fallback(this.state.error, this.handleReload);
      }

      if (this.props.fallback && typeof this.props.fallback !== 'function') {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0A192F] text-white flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-600/20">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-xl font-black text-white">Component Render Exception</h1>
              <p className="text-xs text-slate-400 mt-1">
                An operational error was caught by the ResQGrid safety perimeter.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 bg-black/40 border border-red-900/40 rounded-xl text-left overflow-x-auto text-[11px] font-mono text-red-300 max-h-36">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Portal
              </button>
              <button
                type="button"
                onClick={this.handleHome}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
