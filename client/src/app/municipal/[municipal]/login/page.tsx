"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Login from "@/app/auth/login/page";
import { verifyMunicipalSlugService } from "@/services/municipal.service";

const MunicipalLoginPage = () => {
    const params = useParams();
    const municipalSlug = params?.municipal as string;
    const [isValidating, setIsValidating] = useState<boolean>(true);
    const [isValid, setIsValid] = useState<boolean>(false);
    const [isConnectionError, setIsConnectionError] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    useEffect(() => {
        const validateSubdomain = async () => {
            if (!municipalSlug) {
                setIsValidating(false);
                setErrorMsg("No se especificó un municipio válido.");
                return;
            }
            try {
                const res = await verifyMunicipalSlugService(municipalSlug);
                if (res.success) {
                    setIsValid(true);
                } else {
                    setIsValid(false);
                    setIsConnectionError(false);
                    setErrorMsg(res.message || "Municipio no registrado.");
                }
            } catch (error) {
                setIsValid(false);
                setIsConnectionError(true);
                if (error instanceof Error) {
                    setErrorMsg(error.message);
                } else {
                    setErrorMsg("Error al validar el municipio.");
                }
            } finally {
                setIsValidating(false);
            }
        };

        validateSubdomain();
    }, [municipalSlug]);

    if (isValidating) {
        return (
            <div>
                <p>Validando municipio...</p>
            </div>
        );
    }

    if (!isValid) {
        if (isConnectionError) {
            return (
                <div>
                    <h1>Error de Conexión</h1>
                    <p>
                        No se pudo establecer comunicación con el servidor. Detalle: {errorMsg}
                    </p>
                    <a href="http://localhost:3000">
                        Ir al inicio general
                    </a>
                </div>
            );
        }

        return (
            <div>
                <h1>Esta municipalidad no está registrada</h1>
                <p>
                    {errorMsg || `La municipalidad de "${municipalSlug}" no está registrada en Lictia. Por favor, verifica el enlace o contacta con el administrador.`}
                </p>
                <a href="http://localhost:3000">
                    Ir al inicio general
                </a>
            </div>
        );
    }

    return <Login />;
};

export default MunicipalLoginPage;
