import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  console.log("--> PROXY TRIGGERED:", request.headers.get("host"), request.nextUrl.pathname);
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // 1. Excluir el dominio principal de la reescritura
  const isMainDomain = hostname.startsWith("localhost") 
    ? hostname === "localhost:3000" 
    : hostname === "saas.com" || hostname === "www.saas.com";

  if (isMainDomain) {
    // Si intentan entrar a /municipal directamente desde el dominio principal (sin subdominio),
    // reescribimos a una ruta inexistente para forzar un 404 de seguridad.
    if (url.pathname.startsWith("/municipal")) {
      url.pathname = "/404";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // 2. Extraer el subdominio (ej: de "lima.localhost:3000" extrae "lima")
  const subdomain = hostname.split(".")[0];

  // 3. Reescritura hacia el módulo de municipalidades dinámicas
  // El usuario seguirá viendo "lima.localhost:3000/login" en su navegador, 
  // pero Next.js cargará los archivos de "src/app/municipal/lima/login" internamente.
  url.pathname = `/municipal/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Excluir llamadas de API, recursos estáticos, imágenes optimizadas y assets comunes
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$).*)",
  ],
};
