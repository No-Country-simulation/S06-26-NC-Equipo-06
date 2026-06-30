import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-background-2 w-full shadow-[0_4px_16px_rgba(0,0,0,0.15)] md:py-14">
            <div className="flex flex-col md:flex-row justify-between md:items-center p-6 md:max-w-7xl md:mx-auto">
                <ul className="flex gap-4 w-fit mx-auto md:mx-0 text-center text-sm text-text-1 md:order-2">
                    <li>Términos y Condiciones</li>
                    <li>Privacidad</li>
                    <li>Ayuda</li>
                </ul>
                <div>
                    <Link href="/" className="hidden md:block font-semibold text-xl text-text-1">
                        Lictia
                    </Link>
                    <small className="block mx-auto text-center mt-2 max-w-50 md:max-w-fit font-medium text-text-1">
                        © <time dateTime="2026">2026</time> Lictia. Todos los derechos reservados.
                    </small>
                </div>
            </div>
        </footer>
    );
}
export default Footer;