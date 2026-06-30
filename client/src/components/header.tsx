"use client";

import useAuth from "@/hooks/useAuth";
import Link from "next/link";


const Header = () => {
    const { logout, isAuthenticated } = useAuth();

    return (
        <header className="bg-[#F3FBFF] shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
            <div className="flex justify-between md:justify-start items-center max-w-7xl md:mx-auto py-5 px-6 ">
                <div className="flex gap-2 items-center">
                    <img src="/logo.svg" alt="Logo" width={24} height={24} />
                    <Link className="text-primary font-bold text-2xl md:text-[28px]" href="/">Lictia</Link>
                </div>
                <nav className="hidden md:block ml-8">
                    <ul className="flex gap-6">
                        <li>
                            <Link href="/convocatorias">Convocatorias</Link>
                        </li>
                        <li>
                            <Link href="/transparencia">Transparencia</Link>
                        </li>
                        <li>
                            <Link href="/servicios">Servicios</Link>
                        </li>
                        <li>
                            <Link href="/soporte">Soporte</Link>
                        </li>
                    </ul>
                </nav>
                {
                    !isAuthenticated &&
                    <div className="flex gap-4 ml-auto items-center">
                        <button className="px-4 py-2 text-primary font-semibold hidden md:block">
                            Iniciar sesión
                        </button>
                        <ButtonRegister />
                    </div>
                }
            </div>
        </header>
    );
};

const ButtonRegister = () => {
    return (
        <Link href="/auth/company/register" className="text-white text-sm font-bold bg-primary px-6 py-2.5 rounded-lg">
            Registrarme
        </Link>
    );
}

export default Header;