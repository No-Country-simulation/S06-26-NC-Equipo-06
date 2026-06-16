import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Login from "./page";
import { loginService } from "@/services/auth.service";

vi.mock("@/services/auth.service", () => ({
    loginService: vi.fn().mockResolvedValue({ success: true, token: "mock-jwt-token" }),
}));

describe("Login Page", () => {
    it("renders the login form elements correctly", () => {
        render(<Login />);

        expect(screen.getByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
    });

    it("shows validation error messages when submitting empty fields", async () => {
        render(<Login />);

        const submitButton = screen.getByRole("button", { name: /entrar/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/el correo electrónico es requerido/i)).toBeInTheDocument();
            expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
        });
    });

    it("shows error for invalid email format and too short password", async () => {
        render(<Login />);

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
        render(<Login />);

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
});

