import { describe, it, expect, vi, beforeEach } from "vitest";
import { employeeService } from "./employeeService";

// Mock the supabase client
vi.mock("../lib/supabase", () => {
    const mockRange = vi.fn();
    const mockOrder = vi.fn(() => ({ range: mockRange }));
    const mockSelect = vi.fn(() => ({ order: mockOrder }));
    const mockFrom = vi.fn(() => ({
        select: mockSelect,
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
    }));

    return {
        supabase: {
            from: mockFrom,
        },
    };
});

describe("employeeService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getAll", () => {
        it("should accept default pagination params", async () => {
            const { supabase } = await import("../lib/supabase");

            // Set up the chain to resolve
            const mockRange = vi.fn().mockResolvedValue({
                data: [{ id: 1, name: "Test User" }],
                error: null,
                count: 1,
            });
            const mockOrder = vi.fn(() => ({ range: mockRange }));
            const mockSelect = vi.fn(() => ({ order: mockOrder }));
            supabase.from.mockReturnValue({ select: mockSelect });

            const result = await employeeService.getAll();

            expect(supabase.from).toHaveBeenCalledWith("employees");
            expect(mockSelect).toHaveBeenCalledWith("*", { count: "exact" });
            expect(mockRange).toHaveBeenCalledWith(0, 49); // page 1, pageSize 50
            expect(result.data).toHaveLength(1);
            expect(result.error).toBeNull();
        });

        it("should use custom page and pageSize", async () => {
            const { supabase } = await import("../lib/supabase");

            const mockRange = vi.fn().mockResolvedValue({
                data: [],
                error: null,
                count: 0,
            });
            const mockOrder = vi.fn(() => ({ range: mockRange }));
            const mockSelect = vi.fn(() => ({ order: mockOrder }));
            supabase.from.mockReturnValue({ select: mockSelect });

            await employeeService.getAll({ page: 3, pageSize: 10 });

            // page 3, pageSize 10 → from=20, to=29
            expect(mockRange).toHaveBeenCalledWith(20, 29);
        });

        it("should handle errors gracefully", async () => {
            const { supabase } = await import("../lib/supabase");

            const mockRange = vi.fn().mockResolvedValue({
                data: null,
                error: new Error("Database error"),
                count: null,
            });
            const mockOrder = vi.fn(() => ({ range: mockRange }));
            const mockSelect = vi.fn(() => ({ order: mockOrder }));
            supabase.from.mockReturnValue({ select: mockSelect });

            const result = await employeeService.getAll();

            expect(result.data).toEqual([]);
            expect(result.count).toBe(0);
            expect(result.error).toBeTruthy();
        });
    });

    describe("search", () => {
        it("should accept query string with default pagination", async () => {
            const { supabase } = await import("../lib/supabase");

            const mockRange = vi.fn().mockResolvedValue({
                data: [{ id: 1, name: "John Doe" }],
                error: null,
                count: 1,
            });
            const mockOrder = vi.fn(() => ({ range: mockRange }));
            const mockOr = vi.fn(() => ({ order: mockOrder }));
            const mockSelect = vi.fn(() => ({ or: mockOr }));
            supabase.from.mockReturnValue({ select: mockSelect });

            const result = await employeeService.search("John");

            expect(mockOr).toHaveBeenCalledWith(
                expect.stringContaining("name.ilike.%John%")
            );
            expect(mockRange).toHaveBeenCalledWith(0, 49);
            expect(result.data).toHaveLength(1);
        });
    });

    describe("filter", () => {
        it("should filter by department with pagination", async () => {
            const { supabase } = await import("../lib/supabase");

            const mockRange = vi.fn().mockResolvedValue({
                data: [],
                error: null,
                count: 0,
            });
            const mockOrder = vi.fn(() => ({ range: mockRange }));
            const mockEq = vi.fn(() => ({ order: mockOrder }));
            const mockSelect = vi.fn(() => ({ eq: mockEq }));
            supabase.from.mockReturnValue({ select: mockSelect });

            await employeeService.filter({
                department: "Engineering",
                page: 2,
                pageSize: 20,
            });

            expect(mockEq).toHaveBeenCalledWith("department", "Engineering");
            expect(mockRange).toHaveBeenCalledWith(20, 39); // page 2 of 20
        });
    });
});
