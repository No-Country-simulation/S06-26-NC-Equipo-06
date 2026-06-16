import { LoginFields } from "@/app/auth/login/login.schema";

export const loginService = async (credentials: LoginFields): Promise<{ success: boolean; token?: string }> => {
    // Aquí se implementará la llamada real al endpoint de backend más adelante
    return { success: true, token: "mock-jwt-token" };
};
