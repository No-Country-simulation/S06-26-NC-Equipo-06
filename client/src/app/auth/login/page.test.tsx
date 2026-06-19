import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "./page";
import { loginService } from "@/services/auth.service";
import { AuthProvider } from "@/context/AuthContext";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
    }),
    usePathname: () => "/auth/login",
}));

vi.mock("@/services/auth.service", () => ({
    loginService: vi.fn().mockResolvedValue({
        success: true,
        code: "200",
        message: "Login correcto",
        role: "ADMIN",
    }),
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

    it("renders the login form elements correctly", () => {
        renderLogin();

        expect(screen.getByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
    });

    it("shows validation error messages when submitting empty fields", async () => {
        renderLogin();

        const submitButton = screen.getByRole("button", { name: /entrar/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/el correo electrónico es requerido/i)).toBeInTheDocument();
            expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
        });
    });

    it("shows error for invalid email format and too short password", async () => {
        renderLogin();

        const emailInput = screen.getByLabelText(/correo electrónico/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);

        // Change email and blur to trigger validation
        fireEvent.change(emailInput, { target: { value: "invalid-email" } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
            expect(screen.getByText(/el correo electrónico no es válido/i)).toBeInTheDocument();
        });

        // Change password and blur to trigger validation
        fireEvent.change(passwordInput, { target: { value: "123" } });
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
        });
    });

    it("submits the form successfully with valid values", async () => {
        renderLogin();

        const emailInput = screen.getByLabelText(/correo electrónico/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);
        const submitButton = screen.getByRole("button", { name: /entrar/i });

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(loginService).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "password123",
            });
        });
    });

    it("redirects to /admin when user has ADMIN role", async () => {
        vi.mocked(loginService).mockResolvedValueOnce({
            success: true,
            code: "200",
            message: "Login correcto",
            role: "ADMIN",
        });

        renderLogin();

        const emailInput = screen.getByLabelText(/correo electrónico/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);
        const submitButton = screen.getByRole("button", { name: /entrar/i });

        fireEvent.change(emailInput, { target: { value: "admin@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith("/admin");
        });
    });

    it("redirects to /tenant when user has COMPANY role", async () => {
        vi.mocked(loginService).mockResolvedValueOnce({
            success: true,
            code: "200",
            message: "Login correcto",
            role: "COMPANY",
        });

        renderLogin();

        const emailInput = screen.getByLabelText(/correo electrónico/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);
        const submitButton = screen.getByRole("button", { name: /entrar/i });

        fireEvent.change(emailInput, { target: { value: "company@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith("/tenant");
        });
    });

    it("redirects to /municipal when user has MUNICIPAL_ADMIN role", async () => {
        vi.mocked(loginService).mockResolvedValueOnce({
            success: true,
            code: "200",
            message: "Login correcto",
            role: "MUNICIPAL_ADMIN",
        });

        renderLogin();

        const emailInput = screen.getByLabelText(/correo electrónico/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);
        const submitButton = screen.getByRole("button", { name: /entrar/i });

        fireEvent.change(emailInput, { target: { value: "muniadmin@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith("/municipal");
        });
    });
});
