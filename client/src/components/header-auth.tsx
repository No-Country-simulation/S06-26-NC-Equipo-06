const HeaderAuth = () => {
    return (
        <header className="relative z-10 bg-background-2 shadow-custom">
            <div className="flex gap-2 items-center w-full px-6 py-4.5 max-w-7xl mx-auto">
                <img className="h-6 w-auto" src="/logo.svg" alt="Logo Lictia" />
                <p className="text-2xl font-bold text-primary">Lictia</p>
            </div>
        </header>
    );
};

export default HeaderAuth;