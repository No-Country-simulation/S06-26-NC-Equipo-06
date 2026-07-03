"use client";

import React from "react";
import { useFormik } from "formik";
import { loginSchema, LoginFields } from "../login.schema";
import useAuth from "@/hooks/useAuth";
import Link from "next/link";
import InputPassword from "@/components/input-password";

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
        <form onSubmit={formik.handleSubmit} className="bg-background rounded-3xl p-8 mb-8 max-w-110 mx-auto">
            <div className="size-16 flex justify-center items-center bg-background-2 rounded-full mx-auto mb-4">
                <img className="h-6 w-auto md:h-7.5" src="/Icon/shield.svg" alt="Icono de escudo" />
            </div>
            <h1 className="font-semibold text-[28px] md:text-[32px] text-center">Bienvenido a Lictia</h1>
            <p className="text-center text-text-1 mb-4">
                Inicie sesión para acceder a la
                plataforma de contrataciones del
                Estado.
            </p>
            <div className="mb-3">
                <label htmlFor="email" className="font-medium text-text-2 block mb-2">Correo electrónico</label>
                <div className={`flex items-center gap-3 w-full rounded-xl py-4.5 px-4 border ${formik.touched.email && formik.errors.email
                    ? "border-error"
                    : "border-grey-2"
                    }`}>
                    <img src="/Icon/Message.svg" alt="Email icon" className="h-6 w-auto" />
                    <input
                        type="email"
                        id="email"
                        name="email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                        placeholder="ejemplo@licitaciones.gob.pe"
                        className="w-full bg-transparent outline-none border-none text-text-2 placeholder-grey-3"
                    />
                </div>
                {formik.touched.email && formik.errors.email ? (
                    <p className="text-error mt-1">{formik.errors.email}</p>
                ) : null}
            </div>
            <div className="mb-1">
                <InputPassword
                    label="Contraseña"
                    id="password"
                    name="password"
                    icon="/Icon/pass.svg"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    error={formik.errors.password}
                    touched={formik.touched.password}
                />
            </div>
            <div className="flex gap-1 justify-end mb-5">
                <Link href="/auth/reset-password" className="text-primary font-medium text-sm">Olvidé mi contraseña</Link>
            </div>
            <div className="flex gap-1 mb-6">
                <input type="checkbox" id="remember-me" />
                <label htmlFor="remember-me" className="text-text-2">Recordar mi sesión</label>
            </div>
            <button type="submit" disabled={formik.isSubmitting} className="w-full rounded-xl py-4 px-4 text-white bg-primary font-bold">
                Iniciar Sesión
            </button>
            {formik.status && formik.status.error ? (
                <div className="text-error mt-4 text-center">{formik.status.error}</div>
            ) : null}
        </form>
    );
};

export default LoginForm;
