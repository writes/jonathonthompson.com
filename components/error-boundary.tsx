'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaHome, FaRedo } from 'react-icons/fa';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to Sentry, LogRocket, etc.
      this.logErrorToService(error, errorInfo);
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // Implementation for error logging service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  reset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} reset={this.reset} />;
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-red-500/30">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-red-500/20 rounded-full">
              <FaExclamationTriangle className="text-4xl text-red-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white text-center mb-4">
            Oops! Something went wrong
          </h1>

          <p className="text-gray-300 text-center mb-6">
            We encountered an unexpected error. The error has been logged and we'll look into it.
          </p>

          {isDevelopment && (
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-red-400 mb-2">Error Details (Development Only):</h3>
              <pre className="text-xs text-gray-400 overflow-auto">
                {error.toString()}
                {error.stack && (
                  <>
                    {'\n\nStack trace:\n'}
                    {error.stack}
                  </>
                )}
              </pre>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={reset}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <FaRedo />
              Try Again
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/"
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <FaHome />
              Go Home
            </motion.a>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Error ID: {generateErrorId()}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function generateErrorId(): string {
  return `ERR_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}