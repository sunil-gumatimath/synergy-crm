import { describe, it, expect } from "vitest";
import {
    normalizeRole,
    isAdminRole,
    isManagerRole,
    isAdminOrManagerRole,
    isAllowedRole,
} from "./roles";

describe("normalizeRole", () => {
    it("should normalize 'admin' to 'Admin'", () => {
        expect(normalizeRole("admin")).toBe("Admin");
        expect(normalizeRole("ADMIN")).toBe("Admin");
        expect(normalizeRole("Admin")).toBe("Admin");
        expect(normalizeRole("  admin  ")).toBe("Admin");
    });

    it("should normalize 'manager' to 'Manager'", () => {
        expect(normalizeRole("manager")).toBe("Manager");
        expect(normalizeRole("MANAGER")).toBe("Manager");
    });

    it("should normalize 'employee' to 'Employee'", () => {
        expect(normalizeRole("employee")).toBe("Employee");
        expect(normalizeRole("EMPLOYEE")).toBe("Employee");
    });

    it("should return empty string for null/undefined", () => {
        expect(normalizeRole(null)).toBe("");
        expect(normalizeRole(undefined)).toBe("");
        expect(normalizeRole("")).toBe("");
    });

    it("should return the original value for unknown roles", () => {
        expect(normalizeRole("SuperUser")).toBe("SuperUser");
    });
});

describe("isAdminRole", () => {
    it("should return true for admin variants", () => {
        expect(isAdminRole("admin")).toBe(true);
        expect(isAdminRole("Admin")).toBe(true);
    });

    it("should return false for non-admin", () => {
        expect(isAdminRole("Employee")).toBe(false);
        expect(isAdminRole("Manager")).toBe(false);
    });
});

describe("isManagerRole", () => {
    it("should return true for manager variants", () => {
        expect(isManagerRole("manager")).toBe(true);
    });

    it("should return false for non-manager", () => {
        expect(isManagerRole("Admin")).toBe(false);
    });
});

describe("isAdminOrManagerRole", () => {
    it("should return true for both admin and manager", () => {
        expect(isAdminOrManagerRole("admin")).toBe(true);
        expect(isAdminOrManagerRole("manager")).toBe(true);
    });

    it("should return false for employee", () => {
        expect(isAdminOrManagerRole("employee")).toBe(false);
    });
});

describe("isAllowedRole", () => {
    it("should check if role is in allowed list (case-insensitive)", () => {
        expect(isAllowedRole("admin", ["Admin", "Manager"])).toBe(true);
        expect(isAllowedRole("MANAGER", ["Admin", "Manager"])).toBe(true);
        expect(isAllowedRole("employee", ["Admin", "Manager"])).toBe(false);
    });

    it("should handle empty allowed list", () => {
        expect(isAllowedRole("admin", [])).toBe(false);
    });
});
