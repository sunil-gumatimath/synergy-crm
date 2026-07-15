import React from "react";

const RootFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-body)]">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-[var(--text-muted)]">Loading...</p>
        </div>
    </div>
);

export default RootFallback;
