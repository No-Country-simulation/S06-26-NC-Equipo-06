import { LoginFields } from "@/app/auth/login/login.schema";
import { LoginResponse } from "@/app/auth/types";

export const loginService = async (credentials: LoginFields): Promise<LoginResponse> => {
    // Aquí se implementará la llamada real al endpoint de backend más adelante
    return { success: true, message: "Inicio de sesión correcto", code: "200" };
};
