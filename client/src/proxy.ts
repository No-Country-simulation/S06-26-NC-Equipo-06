import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Extrae de forma robusta el subdominio a partir del host utilizando el dominio raíz configurado.
 * Retorna null si estamos en el dominio principal de la aplicación.
 */
export function getSubdomain(hostname: string): string | null {
  let host = hostname.split(":")[0].toLowerCase();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  let base = rootDomain.toLowerCase().split(":")[0];

  // Inferencia dinámica para entornos Vercel si no se configuró la variable de entorno
  if (!process.env.NEXT_PUBLIC_ROOT_DOMAIN && host.endsWith(".vercel.app")) {
    const parts = host.split(".");
    if (parts.length >= 3) {
      base = parts.slice(-3).join(".");
    }
  }

  // Normalizar: remover 'www.' del inicio del host y del dominio base
  if (host.startsWith("www.")) {
    host = host.slice(4);
  }
  if (base.startsWith("www.")) {
    base = base.slice(4);
  }

  // Si es exactamente el dominio raíz
  if (host === base) {
    return null;
  }

  // Si el host contiene el dominio base, extraemos lo que está antes de él
  if (host.endsWith(`.${base}`)) {
    let subdomain = host.slice(0, -(base.length + 1)); // Remover el "." y el dominio base
    
    // Normalizar: si termina con '.www' (ej. lima.www.saas.com), removerlo
    if (subdomain.endsWith(".www")) {
      subdomain = subdomain.slice(0, -4);
    }

    // Ignorar "www" o cadenas vacías como subdominios
    if (subdomain === "www" || !subdomain) {
      return null;
    }
    return subdomain;
  }

  return null;
}

export function proxy(request: NextRequest) {
  console.log("--> PROXY TRIGGERED:", request.headers.get("host"), request.nextUrl.pathname);
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  const subdomain = getSubdomain(hostname);

  if (!subdomain) {
    // Si estamos en el dominio principal y el usuario intenta ingresar directamente
    // a la ruta interna de municipalidades, bloqueamos con un 404 de seguridad.
    if (url.pathname.startsWith("/municipal")) {
      url.pathname = "/404";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Si estamos en un subdominio municipal, reescribimos internamente la ruta
  url.pathname = `/municipal/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Excluir llamadas de API, recursos estáticos, imágenes optimizadas y assets comunes
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$).*)",
  ],
};

