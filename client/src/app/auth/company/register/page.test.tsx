import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CompanyRegisterPage from "./page";
import { registerCompanyService } from "@/services/auth.service";
import { AuthProvider } from "@/context/AuthContext";
import useAuth from "@/hooks/useAuth";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
    }),
    usePathname: () => "/auth/company/register",
}));

vi.mock("@/services/auth.service", () => ({
    registerCompanyService: vi.fn().mockResolvedValue({
        success: true,
        code: "COMPANY_REGISTRATION_COMPLETED",
        message: "Empresa registrada exitosamente",
    }),
}));

vi.mock("@/hooks/useAuth", () => ({
    default: vi.fn(),
}));

describe("CompanyRegisterPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({
            role: null,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            isAuthenticated: false,
        });
    });

    const renderRegister = () => {
        return render(
            <AuthProvider>
                <CompanyRegisterPage />
            </AuthProvider>
        );
    };

    it("renders the register form elements correctly", () => {
        renderRegister();

        expect(screen.getByRole("heading", { name: /registrar empresa/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/nombre de la empresa/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/ruc/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /registrarse/i })).toBeInTheDocument();
    });

    it("shows validation error messages when submitting empty fields", async () => {
        renderRegister();

        const submitButton = screen.getByRole("button", { name: /registrarse/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/el nombre de la empresa es requerido/i)).toBeInTheDocument();
            expect(screen.getByText(/el ruc es requerido/i)).toBeInTheDocument();
            expect(screen.getByText(/el correo electrónico es requerido/i)).toBeInTheDocument();
            expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument();
        });
    });

    it("shows validation error for invalid email format", async () => {
        renderRegister();

        const emailInput = screen.getByLabelText(/correo electrónico/i);
        fireEvent.change(emailInput, { target: { value: "invalidemail" } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
            expect(screen.getByText(/el correo electrónico no es válido/i)).toBeInTheDocument();
        });
    });

    it("shows validation error for invalid RUC (not 11 digits)", async () => {
        renderRegister();

        const rucInput = screen.getByLabelText(/ruc/i);
        
        // 9 digits
        fireEvent.change(rucInput, { target: { value: "123456789" } });
        fireEvent.blur(rucInput);

        await waitFor(() => {
            expect(screen.getByText(/el ruc debe tener exactamente 11 dígitos numéricos/i)).toBeInTheDocument();
        });

        // 11 non-numeric characters
        fireEvent.change(rucInput, { target: { value: "abcdefghijk" } });
        fireEvent.blur(rucInput);

        await waitFor(() => {
            expect(screen.getByText(/el ruc debe tener exactamente 11 dígitos numéricos/i)).toBeInTheDocument();
        });
    });

    it("submits the form successfully with valid values and shows success message", async () => {
        renderRegister();

        const companyNameInput = screen.getByLabelText(/nombre de la empresa/i);
        const rucInput = screen.getByLabelText(/ruc/i);
        const emailInput = screen.getByLabelText(/correo electrónico/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);
        const submitButton = screen.getByRole("button", { name: /registrarse/i });

        fireEvent.change(companyNameInput, { target: { value: "Mi Empresa S.A." } });
        fireEvent.change(rucInput, { target: { value: "20123456789" } });
        fireEvent.change(emailInput, { target: { value: "admin@miempresa.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(registerCompanyService).toHaveBeenCalledWith({
                companyName: "Mi Empresa S.A.",
                ruc: "20123456789",
                email: "admin@miempresa.com",
                password: "password123",
            });
        });

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: /registro exitoso/i })).toBeInTheDocument();
            expect(screen.getByText(/empresa registrada exitosamente/i)).toBeInTheDocument();
            expect(screen.getByRole("link", { name: /iniciar sesión/i })).toBeInTheDocument();
        });
    });

    it("displays api submission errors when service fails", async () => {
        vi.mocked(registerCompanyService).mockRejectedValueOnce(new Error("El RUC ya está registrado."));

        renderRegister();

        const companyNameInput = screen.getByLabelText(/nombre de la empresa/i);
        const rucInput = screen.getByLabelText(/ruc/i);
        const emailInput = screen.getByLabelText(/correo electrónico/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);
        const submitButton = screen.getByRole("button", { name: /registrarse/i });

        fireEvent.change(companyNameInput, { target: { value: "Mi Empresa S.A." } });
        fireEvent.change(rucInput, { target: { value: "20123456789" } });
        fireEvent.change(emailInput, { target: { value: "admin@miempresa.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("El RUC ya está registrado.")).toBeInTheDocument();
        });
    });

    it("redirects to active session dashboard if user has active session", async () => {
        vi.mocked(useAuth).mockReturnValue({
            role: "COMPANY",
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            isAuthenticated: true,
        });

        renderRegister();

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith("/company");
        });
    });
});
