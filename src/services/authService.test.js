import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "./authService";

// Mock the supabase client
vi.mock("../lib/supabase", () => ({
    supabase: {
        auth: {
            signUp: vi.fn(),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
            getSession: vi.fn(),
            getUser: vi.fn(),
            updateUser: vi.fn(),
            resetPasswordForEmail: vi.fn(),
            onAuthStateChange: vi.fn(),
            mfa: {
                enroll: vi.fn(),
                challenge: vi.fn(),
                verify: vi.fn(),
                unenroll: vi.fn(),
                listFactors: vi.fn(),
                getAuthenticatorAssuranceLevel: vi.fn(),
            },
        },
    },
}));

// Need a second mock for createClient used by admin functions
vi.mock("@supabase/supabase-js", () => ({
    createClient: vi.fn(),
}));

describe("authService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("signIn", () => {
        it("should call supabase signInWithPassword and return user + session", async () => {
            const { supabase } = await import("../lib/supabase");
            const mockUser = { id: "u1", email: "test@test.com" };
            const mockSession = { access_token: "abc" };

            supabase.auth.signInWithPassword.mockResolvedValue({
                data: { user: mockUser, session: mockSession },
                error: null,
            });

            const result = await authService.signIn("test@test.com", "pass123");

            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: "test@test.com",
                password: "pass123",
            });
            expect(result.user).toEqual(mockUser);
            expect(result.session).toEqual(mockSession);
            expect(result.error).toBeNull();
        });

        it("should return error when sign in fails", async () => {
            const { supabase } = await import("../lib/supabase");

            supabase.auth.signInWithPassword.mockResolvedValue({
                data: { user: null, session: null },
                error: new Error("Invalid credentials"),
            });

            const result = await authService.signIn("bad@test.com", "wrong");

            expect(result.user).toBeNull();
            expect(result.session).toBeNull();
            expect(result.error).toBeTruthy();
        });
    });

    describe("signUp", () => {
        it("should call supabase signUp with metadata", async () => {
            const { supabase } = await import("../lib/supabase");
            const mockUser = { id: "u2", email: "new@test.com" };

            supabase.auth.signUp.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            const result = await authService.signUp("new@test.com", "pass123", {
                name: "New User",
            });

            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: "new@test.com",
                password: "pass123",
                options: { data: { name: "New User" } },
            });
            expect(result.user).toEqual(mockUser);
            expect(result.error).toBeNull();
        });
    });

    describe("signOut", () => {
        it("should call supabase signOut", async () => {
            const { supabase } = await import("../lib/supabase");

            supabase.auth.signOut.mockResolvedValue({ error: null });

            const result = await authService.signOut();
            expect(result.error).toBeNull();
        });
    });

    describe("MFA methods", () => {
        it("listMFAFactors should return totp factors", async () => {
            const { supabase } = await import("../lib/supabase");

            supabase.auth.mfa.listFactors.mockResolvedValue({
                data: { totp: [{ id: "f1", status: "verified" }] },
                error: null,
            });

            const result = await authService.listMFAFactors();
            expect(result.factors).toHaveLength(1);
            expect(result.factors[0].id).toBe("f1");
        });

        it("enrollMFA should call mfa.enroll with totp", async () => {
            const { supabase } = await import("../lib/supabase");

            supabase.auth.mfa.enroll.mockResolvedValue({
                data: { id: "f2", totp: { qr_code: "data:image/...", secret: "ABC" } },
                error: null,
            });

            const result = await authService.enrollMFA("My App");
            expect(supabase.auth.mfa.enroll).toHaveBeenCalledWith({
                factorType: "totp",
                friendlyName: "My App",
            });
            expect(result.data.totp.secret).toBe("ABC");
        });

        it("verifyMFA should challenge then verify", async () => {
            const { supabase } = await import("../lib/supabase");

            supabase.auth.mfa.challenge.mockResolvedValue({
                data: { id: "ch1" },
                error: null,
            });
            supabase.auth.mfa.verify.mockResolvedValue({
                data: { session: {} },
                error: null,
            });

            const result = await authService.verifyMFA("f2", "123456");

            expect(supabase.auth.mfa.challenge).toHaveBeenCalledWith({
                factorId: "f2",
            });
            expect(supabase.auth.mfa.verify).toHaveBeenCalledWith({
                factorId: "f2",
                challengeId: "ch1",
                code: "123456",
            });
            expect(result.error).toBeNull();
        });

        it("unenrollMFA should call mfa.unenroll", async () => {
            const { supabase } = await import("../lib/supabase");

            supabase.auth.mfa.unenroll.mockResolvedValue({ error: null });

            const result = await authService.unenrollMFA("f1");
            expect(supabase.auth.mfa.unenroll).toHaveBeenCalledWith({
                factorId: "f1",
            });
            expect(result.error).toBeNull();
        });
    });

    describe("getSession", () => {
        it("should return current session", async () => {
            const { supabase } = await import("../lib/supabase");

            supabase.auth.getSession.mockResolvedValue({
                data: { session: { access_token: "token123" } },
                error: null,
            });

            const result = await authService.getSession();
            expect(result.session.access_token).toBe("token123");
            expect(result.error).toBeNull();
        });
    });
});
