"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { redirectPerRole } from "@/context/AuthContext";
import LoginForm from "./components/LoginForm";
import Footer from "@/components/footer";
import Link from "next/link";
import HeaderAuth from "@/components/header-auth";

const Login = () => {
    const { role, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && role) {
            router.push(redirectPerRole(role));
        }
    }, [role, isLoading, router]);

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (role) {
        return null;
    }

    return (
        <>
            <HeaderAuth />
            <main className="bg-background-2 py-16">
                <LoginForm />
                <div className="flex gap-1 justify-center">
                    <p className="text-center text-text-2">
                        ¿No tienes una cuenta?
                    </p>
                    <Link href="/auth/company/register" className="text-primary">Registrarse</Link>
                </div>
            </main>
        </>
    );
};

export default Login;
