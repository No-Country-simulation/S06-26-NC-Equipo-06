"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterFields } from "./register.schema";
import useAuth from "@/hooks/useAuth";
import { redirectPerRole } from "@/context/AuthContext";
import { registerCompanyService } from "@/services/auth.service";

const CompanyRegisterPage = () => {
    const { role, isLoading } = useAuth();
    const router = useRouter();
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>("");

    useEffect(() => {
        if (!isLoading && role) {
            router.push(redirectPerRole(role));
        }
    }, [role, isLoading, router]);

    const formik = useFormik<RegisterFields>({
        initialValues: {
            companyName: "",
            ruc: "",
            email: "",
            password: "",
        },
        validationSchema: registerSchema,
        onSubmit: async (values, { setStatus }) => {
            console.log("Registrando empresa...");
            setStatus(null);
            try {
                const response = await registerCompanyService(values);
                if (response.success) {
                    setIsSuccess(true);
                    setSuccessMessage(response.message || "Registro completado con éxito.");
                } else {
                    setStatus({ error: response.message || "Error al registrar la empresa." });
                }
            } catch (error) {
                if (error instanceof Error) {
                    setStatus({ error: error.message });
                } else {
                    setStatus({ error: "Error inesperado." });
                }
            }
        },
    });

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (role) {
        return null;
    }

    if (isSuccess) {
        return (
            <div>
                <h1>Registro Exitoso</h1>
                <p>{successMessage}</p>
                <a href="/auth/login">Iniciar sesión</a>
            </div>
        );
    }

    return (
        <div>
            <h1>Registrar Empresa</h1>
            <form onSubmit={formik.handleSubmit}>
                {formik.status && formik.status.error ? (
                    <div>{formik.status.error}</div>
                ) : null}

                <div>
                    <label htmlFor="companyName">Nombre de la empresa:</label>
                    <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.companyName}
                    />
                    {formik.touched.companyName && formik.errors.companyName ? (
                        <div>{formik.errors.companyName}</div>
                    ) : null}
                </div>

                <div>
                    <label htmlFor="ruc">RUC:</label>
                    <input
                        type="text"
                        id="ruc"
                        name="ruc"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.ruc}
                    />
                    {formik.touched.ruc && formik.errors.ruc ? (
                        <div>{formik.errors.ruc}</div>
                    ) : null}
                </div>

                <div>
                    <label htmlFor="email">Correo electrónico:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                    />
                    {formik.touched.email && formik.errors.email ? (
                        <div>{formik.errors.email}</div>
                    ) : null}
                </div>

                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                    />
                    {formik.touched.password && formik.errors.password ? (
                        <div>{formik.errors.password}</div>
                    ) : null}
                </div>

                <button type="submit" disabled={formik.isSubmitting}>
                    Registrarse
                </button>
            </form>
        </div>
    );
};

export default CompanyRegisterPage;