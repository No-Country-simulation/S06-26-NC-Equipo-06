"use client";

import useAuth from "@/hooks/useAuth";
import Link from "next/link";

const Header = () => {
    const { logout, isAuthenticated } = useAuth();

    return (
        <header className="py-5 px-6 bg-[#F3FBFF] flex justify-between items-center">
            <div className="flex gap-2 items-center">
                <img src="/logo.svg" alt="Logo" width={24} height={24} />
                <Link className="text-primary font-bold text-2xl" href="/">Lictia</Link>
            </div>
            {
                !isAuthenticated && <ButtonRegister />
            }
        </header>
    );
};

const ButtonRegister = () => {
    return (
        <Link href="/auth/company/register" className="text-sm font-bold bg-primary px-6 py-2.5 rounded-lg">
            Registrarse
        </Link>
    );
}

export default Header;