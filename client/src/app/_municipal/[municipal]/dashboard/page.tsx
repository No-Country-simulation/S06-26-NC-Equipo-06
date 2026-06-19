"use client";

import React from "react";
import { useParams } from "next/navigation";

const MunicipalDashboardPage = () => {
    const params = useParams();
    const municipalSlug = params?.municipal as string;

    return (
        <div>
            <h1>
                Panel de Control Municipal - {municipalSlug ? municipalSlug.toUpperCase() : ""}
            </h1>
            <p>
                Bienvenido al gestor de licencias de la municipalidad de {municipalSlug}.
            </p>
        </div>
    );
};

export default MunicipalDashboardPage;
