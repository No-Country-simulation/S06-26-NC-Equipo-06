"use client";

import React from "react";
import { useFormik } from "formik";
import { loginSchema, LoginFields } from "../login.schema";
import useAuth from "@/hooks/useAuth";
import Link from "next/link";

const LoginForm = () => {
    const { login } = useAuth();

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

    return (
        <form onSubmit={formik.handleSubmit} className="bg-background rounded-3xl mx-4 p-8 mb-8">
            <div className="size-16 flex justify-center items-center bg-background-2 rounded-full mx-auto mb-4">
                <img className="h-6 w-auto" src="/Icon/shield.svg" alt="Icono de escudo" />
            </div>
            <h1 className="font-semibold text-[28px] text-center">Bienvenido a Lictia</h1>
            <p className="text-center text-text-1">
                Inicie sesión para acceder a la
                plataforma de contrataciones del
                Estado.
            </p>
            <div className="mb-3">
                <label htmlFor="email" className="font-medium text-text-2">Correo electrónico</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    className={`w-full rounded-xl py-4.5 px-4 border ${
                        formik.touched.email && formik.errors.email
                            ? "border-error"
                            : "border-grey-2"
                    }`}
                />
                {formik.touched.email && formik.errors.email ? (
                    <p className="text-error">{formik.errors.email}</p>
                ) : null}
            </div>
            <div className="mb-1">
                <label htmlFor="password" className="font-medium text-text-2">Contraseña</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    className={`w-full rounded-xl py-4.5 px-4 border ${
                        formik.touched.password && formik.errors.password
                            ? "border-error"
                            : "border-grey-2"
                    }`}
                />
                {formik.touched.password && formik.errors.password ? (
                    <p className="text-error">{formik.errors.password}</p>
                ) : null}
            </div>
            <div className="flex gap-1 justify-end mb-5">
                <Link href="/auth/reset-password" className="text-primary font-medium text-sm">Olvidé mi contraseña</Link>
            </div>
            <div className="flex gap-1 mb-6">
                <input type="checkbox" id="remember-me" />
                <label htmlFor="remember-me" className="text-text-2">Recordar mi sesión</label>
            </div>
            <button type="submit" disabled={formik.isSubmitting} className="w-full rounded-xl py-4 px-4 text-white bg-primary">
                Iniciar Sesión
            </button>
            {formik.status && formik.status.error ? (
                <div>{formik.status.error}</div>
            ) : null}
        </form>
    );
};

export default LoginForm;
