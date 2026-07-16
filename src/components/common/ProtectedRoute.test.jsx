import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { AuthContext } from "../../contexts/AuthContext";
import { isAllowedRole } from "../../utils/roles";

// Provide a fixed user (or null) to ProtectedRoute without the real auth flow.
const renderWithUser = (ui, user) =>
    render(
        <AuthContext.Provider value={{ user, loading: false, profileLoaded: true }}>
            <MemoryRouter initialEntries={["/protected"]}>{ui}</MemoryRouter>
        </AuthContext.Provider>
    );

describe("ProtectedRoute", () => {
    it("redirects unauthenticated users to /login", () => {
        renderWithUser(
            <Routes>
                <Route
                    path="/protected"
                    element={
                        <ProtectedRoute>
                            <div>Secret</div>
                        </ProtectedRoute>
                    }
                />
                <Route path="/login" element={<div>Login Page</div>} />
            </Routes>,
            null
        );
        expect(screen.getByText("Login Page")).toBeInTheDocument();
        expect(screen.queryByText("Secret")).not.toBeInTheDocument();
    });

    it("renders children for an allowed role", () => {
        renderWithUser(
            <Routes>
                <Route
                    path="/protected"
                    element={
                        <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                            <div>Admin Panel</div>
                        </ProtectedRoute>
                    }
                />
            </Routes>,
            { role: "Admin" }
        );
        expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    });

    it("blocks a user whose role is not allowed", () => {
        renderWithUser(
            <Routes>
                <Route
                    path="/protected"
                    element={
                        <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                            <div>Admin Panel</div>
                        </ProtectedRoute>
                    }
                />
            </Routes>,
            { role: "Employee" }
        );
        expect(screen.getByText("Access Denied")).toBeInTheDocument();
        expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
    });
});

describe("isAllowedRole", () => {
    it("is case-insensitive and accepts normalized roles", () => {
        expect(isAllowedRole("admin", ["Admin"])).toBe(true);
        expect(isAllowedRole("MANAGER", ["Admin", "Manager"])).toBe(true);
        expect(isAllowedRole("Employee", ["Admin", "Manager"])).toBe(false);
        expect(isAllowedRole(null, ["Admin"])).toBe(false);
    });
});
