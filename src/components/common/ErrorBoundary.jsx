import React from "react";
import PropTypes from "prop-types";
import { AlertTriangle, RefreshCw } from "../../lib/icons";

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 * Displays a fallback UI when an error occurs
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console for debugging
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        // Optionally reload the page
        if (this.props.onRetry) {
            this.props.onRetry();
        }
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {this.props.message || "We encountered an unexpected error. Please try again."}
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-48">
                                <p className="text-sm font-mono text-red-600">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <pre className="text-xs text-gray-500 mt-2 whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}
                        <button
                            onClick={this.handleRetry}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node,
    message: PropTypes.string,
    onRetry: PropTypes.func
};

export default ErrorBoundary;
