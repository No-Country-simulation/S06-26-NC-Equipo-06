import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // 1. Excluir el dominio principal de la reescritura
  // Si el usuario accede a localhost:3000, saas.com o www.saas.com, no se realiza ninguna reescritura.
  const isMainDomain = hostname.startsWith("localhost") 
    ? hostname === "localhost:3000" 
    : hostname === "saas.com" || hostname === "www.saas.com";

  if (isMainDomain) {
    return NextResponse.next();
  }

  // 2. Extraer el subdominio (ej: de "lima.localhost:3000" extrae "lima")
  const subdomain = hostname.split(".")[0];

  // 3. Reescritura invisible hacia el módulo de municipalidades dinámicas
  // El usuario seguirá viendo "lima.localhost:3000/login" en su navegador, 
  // pero Next.js cargará los archivos de "src/app/_municipal/lima/login" internamente.
  url.pathname = `/_municipal/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Excluir llamadas de API, recursos estáticos, imágenes optimizadas y assets comunes
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$).*)",
  ],
};
