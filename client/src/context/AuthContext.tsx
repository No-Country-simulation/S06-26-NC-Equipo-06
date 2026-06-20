"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Role, AuthResponseWithRole } from "@/app/auth/types";
import { LoginFields } from "@/app/auth/login/login.schema";
import { loginService, verifySessionService, logoutService } from "@/services/auth.service";

export const redirectPerRole = (role: Role) => {
    switch (role) {
        case "ADMIN":
            return "/admin";
        case "COMPANY":
            return "/company";
        case "MUNICIPAL_ADMIN":
            return "/municipal";
        case "MUNICIPAL_EVALUATOR":
            return "/municipal";
        default:
            return "/";
    }
};

export interface AuthContextType {
    role: Role | null;
    isLoading: boolean;
    login: (credentials: LoginFields) => Promise<AuthResponseWithRole>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [role, setRole] = useState<Role | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasChecked, setHasChecked] = useState<boolean>(false);
    const router = useRouter();

    const login = async (credentials: LoginFields) => {
        const response = await loginService(credentials);
        setRole(response.role);
        localStorage.setItem("has_session", "true");
        router.push(redirectPerRole(response.role));
        return response;
    };

    const logout = async () => {
        try {
            await logoutService();
            localStorage.removeItem("has_session");
            window.location.href = "/";
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            // Verificar si existe la bandera en localStorage
            const hasSession = localStorage.getItem("has_session") === "true";

            if (!hasSession) {
                setRole(null);
                setIsLoading(false);
                setHasChecked(true);
                return;
            }

            setIsLoading(true);
            try {
                const res = await verifySessionService();
                if (res.success && res.role) {
                    setRole(res.role);
                } else {
                    setRole(null);
                    localStorage.removeItem("has_session");
                }
            } catch {
                // Si la sesión no es válida o expira, reseteamos el rol y la bandera
                setRole(null);
                localStorage.removeItem("has_session");
            } finally {
                setIsLoading(false);
                setHasChecked(true);
            }
        };

        if (!hasChecked) {
            checkSession();
        }
    }, [hasChecked]);

    return (
        <AuthContext.Provider value={{ role, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
