const HeaderAuth = () => {
    return (
        <header className="relative z-10 flex gap-2 items-center w-full justify-center py-4.5 bg-background-2 shadow-custom">
            <img className="h-6 w-auto" src="/logo.svg" alt="Logo Lictia" />
            <p className="text-2xl font-bold text-primary">Lictia</p>
        </header>
    );
};

export default HeaderAuth;