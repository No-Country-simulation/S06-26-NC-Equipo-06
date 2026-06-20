import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRequireRole } from "./useRequireRole";
import useAuth from "@/hooks/useAuth";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}));

vi.mock("@/hooks/useAuth", () => ({
    default: vi.fn(),
}));

describe("useRequireRole Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns isLoading: true when session is loading", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: null,
            isLoading: true,
            login: vi.fn(),
            logout: vi.fn(),
        });

        const { result } = renderHook(() => useRequireRole(["ADMIN"]));

        expect(result.current.isLoading).toBe(true);
        expect(result.current.isAuthorized).toBe(false);
        expect(pushMock).not.toHaveBeenCalled();
    });

    it("redirects to default login path when not authenticated and isLoading is false", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: null,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        const { result } = renderHook(() => useRequireRole(["ADMIN"]));

        expect(result.current.isLoading).toBe(false);
        expect(result.current.isAuthorized).toBe(false);
        expect(pushMock).toHaveBeenCalledWith("/auth/login");
    });

    it("redirects to custom login path when specified and not authenticated", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: null,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        const { result } = renderHook(() => useRequireRole(["ADMIN"], "/custom-login"));

        expect(result.current.isLoading).toBe(false);
        expect(result.current.isAuthorized).toBe(false);
        expect(pushMock).toHaveBeenCalledWith("/custom-login");
    });

    it("redirects to / when user is authenticated with an unauthorized role", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: "COMPANY",
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        const { result } = renderHook(() => useRequireRole(["ADMIN"]));

        expect(result.current.isLoading).toBe(false);
        expect(result.current.isAuthorized).toBe(false);
        expect(pushMock).toHaveBeenCalledWith("/");
    });

    it("allows access and returns isAuthorized: true when user has an authorized role", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: "ADMIN",
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        const { result } = renderHook(() => useRequireRole(["ADMIN"]));

        expect(result.current.isLoading).toBe(false);
        expect(result.current.isAuthorized).toBe(true);
        expect(pushMock).not.toHaveBeenCalled();
    });

    it("allows access if user has one of multiple allowed roles", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: "MUNICIPAL_EVALUATOR",
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        const { result } = renderHook(() => useRequireRole(["MUNICIPAL_ADMIN", "MUNICIPAL_EVALUATOR"]));

        expect(result.current.isLoading).toBe(false);
        expect(result.current.isAuthorized).toBe(true);
        expect(pushMock).not.toHaveBeenCalled();
    });
});
