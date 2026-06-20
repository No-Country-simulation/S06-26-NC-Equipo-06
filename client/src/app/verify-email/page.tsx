"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmailService } from "@/services/auth.service";

const VerifyEmailContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus("error");
                setErrorMessage("El enlace de verificación no contiene un token válido.");
                return;
            }

            try {
                const res = await verifyEmailService(token);
                if (res.success) {
                    setStatus("success");
                } else {
                    setStatus("error");
                    setErrorMessage(res.message || "No se pudo verificar el correo.");
                }
            } catch (error) {
                setStatus("error");
                if (error instanceof Error) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage("Ocurrió un error inesperado al verificar tu correo.");
                }
            }
        };

        verify();
    }, [token]);

    if (status === "loading") {
        return (
            <div>
                <h1>Verificando correo electrónico</h1>
                <p>Por favor, espera un momento mientras validamos tu cuenta...</p>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div>
                <h1>¡Cuenta verificada!</h1>
                <p>Tu correo electrónico ha sido verificado con éxito. Ya puedes iniciar sesión.</p>
                <button type="button" onClick={() => router.push("/auth/login")}>
                    Ir al inicio de sesión
                </button>
            </div>
        );
    }

    return (
        <div>
            <h1>Error de verificación</h1>
            <p>{errorMessage}</p>
            <button type="button" onClick={() => router.push("/")}>
                Ir al inicio
            </button>
        </div>
    );
};

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Cargando verificación...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
