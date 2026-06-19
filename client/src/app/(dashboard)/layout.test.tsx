import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DashboardLayout from "./layout";
import useAuth from "@/hooks/useAuth";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
    }),
    usePathname: () => "/admin",
}));

vi.mock("@/hooks/useAuth", () => ({
    default: vi.fn(),
}));

describe("DashboardLayout Route Guard", () => {
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
            <DashboardLayout>
                <div data-testid="child">Protected Content</div>
            </DashboardLayout>
        );

        expect(screen.getByText(/cargando sesión.../i)).toBeInTheDocument();
        expect(screen.queryByTestId("child")).not.toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
    });

    it("redirects to login and returns null when not authenticated", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: null,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        const { container } = render(
            <DashboardLayout>
                <div data-testid="child">Protected Content</div>
            </DashboardLayout>
        );

        expect(pushMock).toHaveBeenCalledWith("/auth/login");
        expect(container.firstChild).toBeNull();
        expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    });

    it("renders Header and children when authenticated", () => {
        vi.mocked(useAuth).mockReturnValue({
            role: "ADMIN",
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(
            <DashboardLayout>
                <div data-testid="child">Protected Content</div>
            </DashboardLayout>
        );

        expect(screen.getByRole("button", { name: /cerrar sesión/i })).toBeInTheDocument();
        expect(screen.getByTestId("child")).toBeInTheDocument();
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
    });
});
