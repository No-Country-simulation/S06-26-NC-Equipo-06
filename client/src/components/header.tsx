"use client";

import useAuth from "@/hooks/useAuth";
import Link from "next/link";


const Header = () => {
    const { logout, isAuthenticated } = useAuth();

    return (
        <header className="bg-[#F3FBFF] shadow-custom">
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
                    !isAuthenticated ?
                        <div className="flex gap-4 ml-auto items-center">
                            <Link href="/auth/login" className="px-4 py-2 text-primary font-semibold hidden md:block">
                                Iniciar sesión
                            </Link>
                            <ButtonRegister />
                        </div> :
                        <div className="flex items-center ml-auto gap-2">
                            <div className="size-8 flex justify-center items-center rounded-full bg-grey-1">
                                <img className="h-3.5 w-auto" src="/Icon/user.svg" alt="icono de usuario" />
                            </div>
                            <p className="text-primary text-sm font-semibold">Municipalidad de Lima</p>
                            <button>
                                <img src="/Icon/arrow-down.svg" alt="icono de flecha" className="h-2 w-auto" />
                            </button>
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