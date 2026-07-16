import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

// A component that throws on render to trigger the boundary.
const Boom = () => {
    throw new Error("kaboom");
};

describe("ErrorBoundary", () => {
    it("renders children when there is no error", () => {
        render(
            <ErrorBoundary>
                <div>Safe content</div>
            </ErrorBoundary>
        );
        expect(screen.getByText("Safe content")).toBeInTheDocument();
    });

    it("renders a fallback with recovery actions when a child throws", () => {
        // Silence React's expected console.error from the thrown render.
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});

        render(
            <ErrorBoundary>
                <Boom />
            </ErrorBoundary>
        );

        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        expect(screen.getByText("Try Again")).toBeInTheDocument();
        expect(screen.getByText("Reload")).toBeInTheDocument();

        spy.mockRestore();
    });
});
