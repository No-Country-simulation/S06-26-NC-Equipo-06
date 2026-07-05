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
    verifyRucService: vi.fn().mockResolvedValue({
        companyName: "CONSTRUCTORA DEL NORTE S.A.C.",
        taxStatus: "HABIDO",
        fiscalAddress: "Av. Javier Prado Este 1230, San Isidro, Lima - Perú",
        fiscalStatus: true,
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

        expect(screen.getByRole("heading", { name: /crear tu cuenta/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/correo electrónico institucional/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /continuar/i })).toBeInTheDocument();
    });

    it("shows validation error messages when submitting empty fields", async () => {
        renderRegister();

        const submitButton = screen.getByRole("button", { name: /continuar/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/^el correo electrónico es requerido$/i)).toBeInTheDocument();
            expect(screen.getByText(/^la contraseña es requerida$/i)).toBeInTheDocument();
            expect(screen.getByText(/^la confirmación de la contraseña es requerida$/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it("shows validation error for invalid email format", async () => {
        renderRegister();

        const emailInput = screen.getByLabelText(/correo electrónico institucional/i);
        fireEvent.change(emailInput, { target: { value: "invalidemail" } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
            expect(screen.getByText(/el correo electrónico no es válido/i)).toBeInTheDocument();
        });
    });

    it("shows validation error for invalid RUC (not 11 digits)", async () => {
        renderRegister();

        // 1. Fill Step 1 correctly
        fireEvent.change(screen.getByLabelText(/correo electrónico institucional/i), { target: { value: "admin@miempresa.com" } });
        fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: "password123" } });
        fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: "password123" } });
        fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

        // 2. Wait for Step 2 to render and test RUC
        const rucInput = await screen.findByLabelText(/ruc/i);
        
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

        // Step 1
        fireEvent.change(screen.getByLabelText(/correo electrónico institucional/i), { target: { value: "admin@miempresa.com" } });
        fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: "password123" } });
        fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: "password123" } });
        fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

        // Step 2
        const rucInput = await screen.findByLabelText(/ruc/i);
        const submitButton = screen.getByRole("button", { name: /continuar/i });

        fireEvent.change(rucInput, { target: { value: "20123456789" } });

        // Esperar a que se autocompleten los valores
        await waitFor(() => {
            expect(screen.getByLabelText(/razón social/i)).toHaveValue("CONSTRUCTORA DEL NORTE S.A.C.");
            expect(screen.getByLabelText(/dirección fiscal/i)).toHaveValue("Av. Javier Prado Este 1230, San Isidro, Lima - Perú");
        });

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(registerCompanyService).toHaveBeenCalledWith({
                email: "admin@miempresa.com",
                password: "password123",
                ruc: "20123456789",
                companyName: "CONSTRUCTORA DEL NORTE S.A.C.",
                taxStatus: "HABIDO",
                fiscalAddress: "Av. Javier Prado Este 1230, San Isidro, Lima - Perú",
                fiscalStatus: true,
            });
        });

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: /verifica tu cuenta/i })).toBeInTheDocument();
            expect(screen.getByText(/hemos enviado un mail de verificación/i)).toBeInTheDocument();
            expect(screen.getByRole("link", { name: /verificar correo/i })).toBeInTheDocument();
        });
    });

    it("displays api submission errors when service fails", async () => {
        vi.mocked(registerCompanyService).mockRejectedValueOnce(new Error("El RUC ya está registrado."));

        renderRegister();

        // Step 1
        fireEvent.change(screen.getByLabelText(/correo electrónico institucional/i), { target: { value: "admin@miempresa.com" } });
        fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: "password123" } });
        fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: "password123" } });
        fireEvent.click(screen.getByRole("button", { name: /continuar/i }));

        // Step 2
        const rucInput = await screen.findByLabelText(/ruc/i);
        const submitButton = screen.getByRole("button", { name: /continuar/i });

        fireEvent.change(rucInput, { target: { value: "20123456789" } });

        // Esperar a que se autocompleten los valores
        await waitFor(() => {
            expect(screen.getByLabelText(/razón social/i)).toHaveValue("CONSTRUCTORA DEL NORTE S.A.C.");
        });

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
