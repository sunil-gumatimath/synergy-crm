import React from "react";
import PropTypes from "prop-types";

/**
 * ErrorBoundary - Catches render errors in any descendant route/component so a
 * single thrown error shows a recoverable fallback instead of white-screening
 * the whole SPA.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // eslint-disable-next-line no-console
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[var(--bg-body)] p-6">
                    <div className="max-w-md w-full text-center">
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                            Something went wrong
                        </h1>
                        <p className="text-[var(--text-muted)] mb-6">
                            An unexpected error occurred. Your data is safe — you can try again
                            or reload the page.
                        </p>
                        {this.state.error?.message && (
                            <pre className="text-left text-xs bg-[var(--bg-subtle)] text-[var(--text-muted)] p-3 rounded mb-6 overflow-auto max-h-32">
                                {this.state.error.message}
                            </pre>
                        )}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="px-4 py-2 border border-[var(--border)] text-[var(--text-primary)] rounded hover:bg-[var(--bg-subtle)]"
                            >
                                Reload
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
