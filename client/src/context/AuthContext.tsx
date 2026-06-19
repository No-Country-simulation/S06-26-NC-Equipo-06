"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Role, AuthResponseWithRole } from "@/app/auth/types";
import { LoginFields } from "@/app/auth/login/login.schema";
import { loginService, verifySessionService, logoutService } from "@/services/auth.service";

export const redirectPerRole = (role: Role) => {
    switch (role) {
        case "ADMIN":
            return "/admin";
        case "COMPANY":
            return "/tenant";
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
    login: (credentials: LoginFields) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [role, setRole] = useState<Role | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasChecked, setHasChecked] = useState<boolean>(false);
    const router = useRouter();
    const pathname = usePathname();

    const login = async (credentials: LoginFields) => {
        const response = await loginService(credentials);
        setRole(response.role);
        router.push(redirectPerRole(response.role));
    };

    const logout = async () => {
        try {
            await logoutService();

            window.location.href = "/";
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            setIsLoading(true);
            try {
                const res = await verifySessionService();
                if (res.success && res.role) {
                    setRole(res.role);
                } else {
                    setRole(null);
                }
            } catch (error) {
                // Si la sesión no es válida o expira, reseteamos el rol
                setRole(null);
            } finally {
                setIsLoading(false);
                setHasChecked(true);
            }
        };

        if (pathname === "/") {
            setIsLoading(false);
        } else if (!hasChecked) {
            checkSession();
        }
    }, [pathname, hasChecked]);

    return (
        <AuthContext.Provider value={{ role, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
