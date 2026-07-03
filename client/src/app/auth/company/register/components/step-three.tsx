import Link from "next/link";

interface StepThreeProps {
    successMessage?: string;
}

const StepThree = ({ successMessage }: StepThreeProps) => {
    return (
        <div className="bg-background border border-background-2 rounded-3xl mx-4 p-8 mb-10 text-center flex flex-col items-center">
            <div className="size-16 flex justify-center items-center bg-background-2 rounded-full mb-4">
                <svg
                    className="size-8 text-success"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            </div>
            <h1 className="text-[28px] font-semibold text-text-2 mb-2">Registro Exitoso</h1>
            <p className="text-text-1 mb-8">
                {successMessage || "Tu empresa ha sido registrada correctamente."}
            </p>
            <Link href="/auth/login" className="btn btn-primary w-full block text-center">
                Iniciar sesión
            </Link>
        </div>
    );
};

export default StepThree;