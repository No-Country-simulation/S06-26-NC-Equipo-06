import Link from "next/link";

interface StepThreeProps {
    email?: string;
}

const StepThree = ({ email }: StepThreeProps) => {
    return (
        <div className="bg-background border border-background-2 rounded-3xl mx-4 p-8 mb-10 max-w-143 md:mx-auto">
            <h1 className="mb-1">Verifica tu cuenta</h1>
            <p className="mb-12">
                Hemos enviado un mail de verificación a su correo electrónico institucional {email}.
            </p>
            <p className="mb-10 text-center">
                ¿No recibiste el mail? <Link href="/auth/company/resend-verification-email" className="text-primary font-semibold">
                    Reenviar mail
                </Link>
            </p>
            <Link href="/auth/company/verify-email" className="btn btn-primary w-full block text-center">
                Verificar Correo
            </Link>
        </div>
    );
};

export default StepThree;