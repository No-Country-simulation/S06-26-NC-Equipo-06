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
                    setErrorMsg(res.message || "Municipio no registrado.");
                }
            } catch (error) {
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
        return (
            <div>
                <h1>404</h1>
                <h2>Municipio No Encontrado</h2>
                <p>
                    {errorMsg || `El municipio "${municipalSlug}" no está registrado en nuestra plataforma Lictia.`}
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
