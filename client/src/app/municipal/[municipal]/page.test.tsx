import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MunicipalRootPage from "./page";
import useAuth from "@/hooks/useAuth";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        replace: replaceMock,
    }),
}));

vi.mock("@/hooks/useAuth", () => ({
    default: vi.fn(),
}));

describe("MunicipalRootPage Redirection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders redirecting message when session is loading and does not redirect", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: null,
            isLoading: true,
            login: vi.fn(),
            logout: vi.fn(),
            isAuthenticated: false,
        });

        render(<MunicipalRootPage />);

        expect(screen.getByText(/redirigiendo.../i)).toBeInTheDocument();
        expect(replaceMock).not.toHaveBeenCalled();
    });

    it("redirects to /login when not authenticated", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: null,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            isAuthenticated: false,
        });

        render(<MunicipalRootPage />);

        expect(replaceMock).toHaveBeenCalledWith("/login");
    });

    it("redirects to /login when authenticated with a non-municipal role (e.g. COMPANY)", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: "COMPANY",
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            isAuthenticated: true,
        });

        render(<MunicipalRootPage />);

        expect(replaceMock).toHaveBeenCalledWith("/login");
    });

    it("redirects to /dashboard when authenticated with MUNICIPAL_ADMIN role", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: "MUNICIPAL_ADMIN",
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            isAuthenticated: true,
        });

        render(<MunicipalRootPage />);

        expect(replaceMock).toHaveBeenCalledWith("/dashboard");
    });

    it("redirects to /dashboard when authenticated with MUNICIPAL_EVALUATOR role", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: "MUNICIPAL_EVALUATOR",
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            isAuthenticated: true,
        });

        render(<MunicipalRootPage />);

        expect(replaceMock).toHaveBeenCalledWith("/dashboard");
    });
});
