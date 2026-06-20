import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VerifyEmailPage from "./page";
import { verifyEmailService } from "@/services/auth.service";

const pushMock = vi.fn();
let getParamMock = vi.fn().mockReturnValue("valid-token");

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
    }),
    useSearchParams: () => ({
        get: getParamMock,
    }),
}));

vi.mock("@/services/auth.service", () => ({
    verifyEmailService: vi.fn(),
}));

describe("VerifyEmailPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getParamMock.mockReturnValue("valid-token");
    });

    it("displays loading message initially and calls verifyEmailService", async () => {
        vi.mocked(verifyEmailService).mockResolvedValue({
            success: true,
            message: "Email verificado exitosamente",
            code: "EMAIL_VERIFIED",
        });

        render(<VerifyEmailPage />);

        expect(screen.getByText(/verificando correo electrónico/i)).toBeInTheDocument();
        expect(verifyEmailService).toHaveBeenCalledWith("valid-token");

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: /cuenta verificada/i })).toBeInTheDocument();
        });
    });

    it("displays error message when token is missing", async () => {
        getParamMock.mockReturnValue(null);

        render(<VerifyEmailPage />);

        expect(screen.getByRole("heading", { name: /error de verificación/i })).toBeInTheDocument();
        expect(screen.getByText(/el enlace de verificación no contiene un token válido/i)).toBeInTheDocument();
        expect(verifyEmailService).not.toHaveBeenCalled();
    });

    it("displays error view when verifyEmailService fails", async () => {
        vi.mocked(verifyEmailService).mockRejectedValue(new Error("Token inválido o expirado"));

        render(<VerifyEmailPage />);

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: /error de verificación/i })).toBeInTheDocument();
            expect(screen.getByText("Token inválido o expirado")).toBeInTheDocument();
        });
    });

    it("displays error view when API returns success: false", async () => {
        vi.mocked(verifyEmailService).mockResolvedValue({
            success: false,
            message: "Error de validación del token",
            code: "TOKEN_INVALID",
        });

        render(<VerifyEmailPage />);

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: /error de verificación/i })).toBeInTheDocument();
            expect(screen.getByText("Error de validación del token")).toBeInTheDocument();
        });
    });

    it("navigates to /auth/login when clicking 'Ir al inicio de sesión' on success", async () => {
        vi.mocked(verifyEmailService).mockResolvedValue({
            success: true,
            message: "Email verificado exitosamente",
            code: "EMAIL_VERIFIED",
        });

        render(<VerifyEmailPage />);

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: /cuenta verificada/i })).toBeInTheDocument();
        });

        screen.getByRole("button", { name: /ir al inicio de sesión/i }).click();
        expect(pushMock).toHaveBeenCalledWith("/auth/login");
    });

    it("navigates to / when clicking 'Ir al inicio' on error", async () => {
        vi.mocked(verifyEmailService).mockRejectedValue(new Error("Fallo de red"));

        render(<VerifyEmailPage />);

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: /error de verificación/i })).toBeInTheDocument();
        });

        screen.getByRole("button", { name: /ir al inicio/i }).click();
        expect(pushMock).toHaveBeenCalledWith("/");
    });
});
