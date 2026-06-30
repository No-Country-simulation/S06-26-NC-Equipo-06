import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "./page";
import { AuthProvider } from "@/context/AuthContext";
import useAuth from "@/hooks/useAuth";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
    }),
    usePathname: () => "/auth/login",
}));

vi.mock("@/hooks/useAuth", () => ({
    default: vi.fn(),
}));

// Mock del componente LoginForm para aislar la página
vi.mock("./components/LoginForm", () => ({
    default: () => <div data-testid="login-form">Mocked LoginForm</div>,
}));

describe("Login Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderLogin = () => {
        return render(
            <AuthProvider>
                <Login />
            </AuthProvider>
        );
    };

    it("renders loading message when session is loading", () => {
        vi.mocked(useAuth).mockReturnValue({
            login: vi.fn(),
            logout: vi.fn(),
            role: null,
            isLoading: true,
            isAuthenticated: false,
        });

        renderLogin();
        expect(screen.getByText(/cargando\.\.\./i)).toBeInTheDocument();
        expect(screen.queryByTestId("login-form")).not.toBeInTheDocument();
    });

    it("renders the heading and LoginForm when not logged in", () => {
        vi.mocked(useAuth).mockReturnValue({
            login: vi.fn(),
            logout: vi.fn(),
            role: null,
            isLoading: false,
            isAuthenticated: false,
        });

        renderLogin();
        expect(screen.getByText("Lictia")).toBeInTheDocument();
        expect(screen.getByAltText("Logo Lictia")).toBeInTheDocument();
        expect(screen.getByTestId("login-form")).toBeInTheDocument();
    });

    it("redirects to /admin when user is authenticated with ADMIN role", async () => {
        vi.mocked(useAuth).mockReturnValue({
            login: vi.fn(),
            logout: vi.fn(),
            role: "ADMIN",
            isLoading: false,
            isAuthenticated: true,
        });

        renderLogin();

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith("/admin");
        });
    });

    it("redirects to /company when user is authenticated with COMPANY role", async () => {
        vi.mocked(useAuth).mockReturnValue({
            login: vi.fn(),
            logout: vi.fn(),
            role: "COMPANY",
            isLoading: false,
            isAuthenticated: true,
        });

        renderLogin();

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith("/company");
        });
    });

    it("redirects to /municipal when user is authenticated with MUNICIPAL_ADMIN role", async () => {
        vi.mocked(useAuth).mockReturnValue({
            login: vi.fn(),
            logout: vi.fn(),
            role: "MUNICIPAL_ADMIN",
            isLoading: false,
            isAuthenticated: true,
        });

        renderLogin();

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith("/municipal");
        });
    });
});
