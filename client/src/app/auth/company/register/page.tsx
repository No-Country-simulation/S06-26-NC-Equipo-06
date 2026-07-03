"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterFields, StepOneFields } from "./register.schema";
import useAuth from "@/hooks/useAuth";
import { redirectPerRole } from "@/context/AuthContext";
import { registerCompanyService } from "@/services/auth.service";
import HeaderAuth from "@/components/header-auth";
import StepOne from "./components/step-one";
import StepTwo from "./components/step-two";
import StepThree from "./components/step-three";

const CompanyRegisterPage = () => {
    const { role, isLoading } = useAuth();
    const router = useRouter();
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [step, setStep] = useState<number>(1);
    const [formData, setFormData] = useState({})

    const handleStepOneSubmit = (stepOneData: StepOneFields) => {
        setFormData(prev => ({ ...prev, ...stepOneData }));
        setStep(2);
    }

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
        <>
            <HeaderAuth />
            <main className="bg-background-2 pt-6">
                {
                    step === 1 && <StepOne onNext={handleStepOneSubmit} />
                }
                {
                    step === 2 && <StepTwo />
                }
                {
                    step === 3 && <StepThree />
                }
            </main>
        </>
    );
};

export default CompanyRegisterPage;