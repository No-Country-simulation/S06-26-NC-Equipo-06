import { LoginFields } from "@/app/auth/login/login.schema";
import { AuthResponse } from "@/app/auth/types";

const base_url = process.env.NEXT_PUBLIC_API_URL;

export const loginService = async (credentials: LoginFields): Promise<AuthResponse> => {
    // Aquí se implementará la llamada real al endpoint de backend más adelante
    return { success: true, message: "Inicio de sesión correcto", code: "200" };
};

export const resendVerificationEmailService = async (email: string): Promise<AuthResponse> => {
    return { success: true, message: "Correo de verificación reenviado", code: "200" };
};

export const verifySessionService = async (): Promise<AuthResponse> => {
    // Se enviara el token y el refresh token mediante cookies
    return { success: true, message: "Sesión verificada", code: "200" };
};

export const logoutService = async (): Promise<AuthResponse> => {
    // Se enviara el token y el refresh token mediante cookies
    return { success: true, message: "Sesión cerrada", code: "200" };
};

