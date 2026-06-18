"use client";

import useAuth from "@/hooks/useAuth";

const Header = () => {
    const { logout } = useAuth();

    return (
        <header>
            <button onClick={logout}>Cerrar Sesión</button>
        </header>
    );
};

export default Header;