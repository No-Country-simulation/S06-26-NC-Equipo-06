"use client";

import React, { useEffect } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { loginSchema, LoginFields } from "./login.schema";
import useAuth from "@/hooks/useAuth";
import { redirectPerRole } from "@/context/AuthContext";

const Login = () => {
    const { login, role, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && role) {
            router.push(redirectPerRole(role));
        }
    }, [role, isLoading, router]);

    const formik = useFormik<LoginFields>({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: loginSchema,
        onSubmit: async (values, { setStatus }) => {
            console.log("Logueando...");
            setStatus(null); // Limpiar errores previos de envío
            try {
                await login(values);
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

    return (
        <div>
            <h1>Iniciar Sesión</h1>
            <form onSubmit={formik.handleSubmit}>
                {formik.status && formik.status.error ? (
                    <div>{formik.status.error}</div>
                ) : null}
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
                    Entrar
                </button>
            </form>
        </div>
    );
};

export default Login;

