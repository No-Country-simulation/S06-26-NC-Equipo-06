import { LoginFields } from "@/app/auth/login/login.schema";
import { RegisterFields } from "@/app/auth/company/register/register.schema";
import { AuthResponse, AuthResponseWithRole } from "@/app/auth/types";
import axios from "axios";

const base_url = process.env.NEXT_PUBLIC_API_URL;

export const loginService = async (credentials: LoginFields): Promise<AuthResponseWithRole> => {
    try {
        const response = await axios.post(`${base_url}/api/v1/auth-users/login`, credentials, {
            withCredentials: true,
        });

        if (!response.data) {
            throw new Error("El servidor respondió correctamente pero sin datos.");
        }

        return response.data as AuthResponseWithRole;
    } catch (error) {
        let errorMessage = "Error desconocido";

        if (axios.isAxiosError(error)) {
            if (error.response) {
                const apiResponse = error.response.data as AuthResponseWithRole | undefined;
                errorMessage = apiResponse?.message || `Error del servidor (${error.response.status})`;
            } else if (error.request) {
                errorMessage = "No se recibió respuesta del servidor. Verifica tu conexión.";
            } else {
                errorMessage = error.message;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

export const resendVerificationEmailService = async (email: string): Promise<AuthResponse> => {
    return { success: true, message: "Correo de verificación reenviado", code: "200" };
};

export const verifySessionService = async (): Promise<AuthResponseWithRole> => {
    try {
        const response = await axios.get(`${base_url}/api/v1/auth-users/verify-auth`, {
            withCredentials: true,
        });

        if (!response.data) {
            throw new Error("El servidor respondió correctamente pero sin datos.");
        }

        return response.data as AuthResponseWithRole;
    } catch (error) {
        let errorMessage = "Sesión no válida o expirada";

        if (axios.isAxiosError(error)) {
            if (error.response) {
                const apiResponse = error.response.data as AuthResponse | undefined;
                errorMessage = apiResponse?.message || `Error del servidor (${error.response.status})`;
            } else if (error.request) {
                errorMessage = "No se recibió respuesta del servidor. Verifica tu conexión.";
            } else {
                errorMessage = error.message;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

export const logoutService = async (): Promise<AuthResponse> => {
    try {
        const response = await axios.post(`${base_url}/api/v1/auth-users/logout`, {}, {
            withCredentials: true,
        });

        if (!response.data) {
            throw new Error("El servidor respondió correctamente pero sin datos.");
        }

        return response.data as AuthResponse;
    } catch (error) {
        let errorMessage = "Error al cerrar sesión";

        if (axios.isAxiosError(error)) {
            if (error.response) {
                const apiResponse = error.response.data as AuthResponse | undefined;
                errorMessage = apiResponse?.message || `Error del servidor (${error.response.status})`;
            } else if (error.request) {
                errorMessage = "No se recibió respuesta del servidor. Verifica tu conexión.";
            } else {
                errorMessage = error.message;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

export const registerCompanyService = async (fields: RegisterFields): Promise<AuthResponse> => {
    try {
        const response = await axios.post(`${base_url}/api/v1/auth-users/register`, fields);

        if (!response.data) {
            throw new Error("El servidor respondió correctamente pero sin datos.");
        }

        // Si la respuesta indica éxito falso
        if (response.data.success === false) {
            throw new Error(response.data.message || "Error al registrar la empresa");
        }

        return response.data as AuthResponse;
    } catch (error) {
        let errorMessage = "Error al registrar la empresa";

        if (axios.isAxiosError(error)) {
            if (error.response) {
                const apiResponse = error.response.data as AuthResponse | undefined;
                errorMessage = apiResponse?.message || `Error del servidor (${error.response.status})`;
            } else if (error.request) {
                errorMessage = "No se recibió respuesta del servidor. Verifica tu conexión.";
            } else {
                errorMessage = error.message;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

export const verifyEmailService = async (token: string): Promise<AuthResponse> => {
    try {
        const response = await axios.post(`${base_url}/api/v1/auth-users/verify-email/${token}`);

        if (!response.data) {
            throw new Error("El servidor respondió correctamente pero sin datos.");
        }

        // Si la respuesta indica éxito falso
        if (response.data.success === false) {
            throw new Error(response.data.message || "Error al verificar el correo electrónico");
        }

        return response.data as AuthResponse;
    } catch (error) {
        let errorMessage = "Error al verificar el correo electrónico";

        if (axios.isAxiosError(error)) {
            if (error.response) {
                const apiResponse = error.response.data as AuthResponse | undefined;
                errorMessage = apiResponse?.message || `Error del servidor (${error.response.status})`;
            } else if (error.request) {
                errorMessage = "No se recibió respuesta del servidor. Verifica tu conexión.";
            } else {
                errorMessage = error.message;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};