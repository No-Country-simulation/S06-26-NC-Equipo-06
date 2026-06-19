import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CompanyLayout from "./layout";
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

describe("CompanyLayout Role Guard", () => {
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
            <CompanyLayout>
                <div data-testid="child">Protected Company Content</div>
            </CompanyLayout>
        );

        expect(screen.getByText(/cargando sesión.../i)).toBeInTheDocument();
        expect(screen.queryByTestId("child")).not.toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
    });

    it("redirects to /auth/login and returns null when not authenticated", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: null,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        const { container } = render(
            <CompanyLayout>
                <div data-testid="child">Protected Company Content</div>
            </CompanyLayout>
        );

        expect(pushMock).toHaveBeenCalledWith("/auth/login");
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
            <CompanyLayout>
                <div data-testid="child">Protected Company Content</div>
            </CompanyLayout>
        );

        expect(pushMock).toHaveBeenCalledWith("/");
        expect(container.firstChild).toBeNull();
    });

    it("renders Header and children when authenticated with COMPANY role", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: "COMPANY",
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(
            <CompanyLayout>
                <div data-testid="child">Protected Company Content</div>
            </CompanyLayout>
        );

        expect(screen.getByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument();
        expect(screen.getByTestId("child")).toBeInTheDocument();
        expect(screen.getByText("Protected Company Content")).toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
    });
});
