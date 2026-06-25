import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminLayout from "./layout";
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

describe("AdminLayout Role Guard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading message when session is loading", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: null,
            isLoading: true,
            login: vi.fn(),
            logout: vi.fn(),
            isAuthenticated: false,
        });

        render(
            <AdminLayout>
                <div data-testid="child">Protected Admin Content</div>
            </AdminLayout>
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
            isAuthenticated: false,
        });

        const { container } = render(
            <AdminLayout>
                <div data-testid="child">Protected Admin Content</div>
            </AdminLayout>
        );

        expect(pushMock).toHaveBeenCalledWith("/auth/login");
        expect(container.firstChild).toBeNull();
    });

    it("redirects to / and returns null when authenticated with unauthorized role (e.g. COMPANY)", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: "COMPANY",
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            isAuthenticated: true,
        });

        const { container } = render(
            <AdminLayout>
                <div data-testid="child">Protected Admin Content</div>
            </AdminLayout>
        );

        expect(pushMock).toHaveBeenCalledWith("/");
        expect(container.firstChild).toBeNull();
    });

    it("renders Header and children when authenticated with ADMIN role", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: "ADMIN",
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            isAuthenticated: true,
        });

        render(
            <AdminLayout>
                <div data-testid="child">Protected Admin Content</div>
            </AdminLayout>
        );

        expect(screen.getByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument();
        expect(screen.getByTestId("child")).toBeInTheDocument();
        expect(screen.getByText("Protected Admin Content")).toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
    });
});
