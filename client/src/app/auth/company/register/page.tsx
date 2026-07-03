"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterFields, StepOneFields, StepTwoFields } from "./register.schema";
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
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [step, setStep] = useState<number>(1);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState<string | null>(null);

    const handleStepOneSubmit = (stepOneData: StepOneFields) => {
        setFormData(prev => ({ ...prev, ...stepOneData }));
        setStep(2);
    };

    const handleStepTwoSubmit = async (stepTwoData: StepTwoFields) => {
        setError(null);
        const { repeatPassword, ...restFormData } = formData as any;
        const finalValues = {
            ...restFormData,
            ...stepTwoData
        } as RegisterFields;

        try {
            // Validamos contra el esquema completo antes de enviar
            await registerSchema.validate(finalValues);

            console.log("Registrando empresa...");
            const response = await registerCompanyService(finalValues);
            
            if (response.success) {
                setSuccessMessage(response.message || "Registro completado con éxito.");
                setStep(3); // Mostramos el StepThree de éxito
            } else {
                setError(response.message || "Error al registrar la empresa.");
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error inesperado.");
            }
        }
    };

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
            <main className="bg-background-2 pt-6">
                {error && (
                    <div className="mx-4 mb-4 p-4 text-error bg-error/5 border border-error rounded-xl text-center text-sm">
                        {error}
                    </div>
                )}
                {
                    step === 1 && <StepOne onNext={handleStepOneSubmit} />
                }
                {
                    step === 2 && <StepTwo onNext={handleStepTwoSubmit} />
                }
                {
                    step === 3 && <StepThree successMessage={successMessage} />
                }
            </main>
        </>
    );
};

export default CompanyRegisterPage;