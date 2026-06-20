import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MunicipalDashboardLayout from "./layout";
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

describe("MunicipalDashboardLayout Role Guard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading message when session is loading", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: null,
            isLoading: true,
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(
            <MunicipalDashboardLayout>
                <div data-testid="child">Municipal Dashboard Content</div>
            </MunicipalDashboardLayout>
        );

        expect(screen.getByText(/cargando sesión.../i)).toBeInTheDocument();
        expect(screen.queryByTestId("child")).not.toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
    });

    it("redirects to local /login and returns null when not authenticated", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: null,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        const { container } = render(
            <MunicipalDashboardLayout>
                <div data-testid="child">Municipal Dashboard Content</div>
            </MunicipalDashboardLayout>
        );

        expect(pushMock).toHaveBeenCalledWith("/login");
        expect(container.firstChild).toBeNull();
    });

    it("redirects to / and returns null when authenticated with unauthorized role (e.g. ADMIN)", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: "ADMIN",
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        const { container } = render(
            <MunicipalDashboardLayout>
                <div data-testid="child">Municipal Dashboard Content</div>
            </MunicipalDashboardLayout>
        );

        expect(pushMock).toHaveBeenCalledWith("/");
        expect(container.firstChild).toBeNull();
    });

    it("renders Header and children when authenticated with MUNICIPAL_ADMIN role", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: "MUNICIPAL_ADMIN",
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(
            <MunicipalDashboardLayout>
                <div data-testid="child">Municipal Dashboard Content</div>
            </MunicipalDashboardLayout>
        );

        expect(screen.getByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument();
        expect(screen.getByTestId("child")).toBeInTheDocument();
        expect(screen.getByText("Municipal Dashboard Content")).toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
    });

    it("renders Header and children when authenticated with MUNICIPAL_EVALUATOR role", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: "MUNICIPAL_EVALUATOR",
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(
            <MunicipalDashboardLayout>
                <div data-testid="child">Municipal Dashboard Content</div>
            </MunicipalDashboardLayout>
        );

        expect(screen.getByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument();
        expect(screen.getByTestId("child")).toBeInTheDocument();
        expect(screen.getByText("Municipal Dashboard Content")).toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
    });
});
