import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginForm from "./LoginForm";

const loginMock = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
    default: () => ({
        login: loginMock,
    }),
}));

describe("LoginForm Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the form elements correctly", () => {
        render(<LoginForm />);

        expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
    });

    it("shows validation error messages when submitting empty fields", async () => {
        render(<LoginForm />);

        const submitButton = screen.getByRole("button", { name: /entrar/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/el correo electrónico es requerido/i)).toBeInTheDocument();
            expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
        });
    });

    it("shows error for invalid email format and too short password", async () => {
        render(<LoginForm />);

        const emailInput = screen.getByLabelText(/correo electrónico/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);

        fireEvent.change(emailInput, { target: { value: "invalid-email" } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
            expect(screen.getByText(/el correo electrónico no es válido/i)).toBeInTheDocument();
        });

        fireEvent.change(passwordInput, { target: { value: "123" } });
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
        });
    });

    it("submits the form successfully with valid values", async () => {
        loginMock.mockResolvedValueOnce({ success: true });
        render(<LoginForm />);

        const emailInput = screen.getByLabelText(/correo electrónico/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);
        const submitButton = screen.getByRole("button", { name: /entrar/i });

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(loginMock).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "password123",
            });
        });
    });

    it("displays error message when login fails", async () => {
        loginMock.mockRejectedValueOnce(new Error("Credenciales inválidas"));
        render(<LoginForm />);

        const emailInput = screen.getByLabelText(/correo electrónico/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);
        const submitButton = screen.getByRole("button", { name: /entrar/i });

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
        });
    });
});
