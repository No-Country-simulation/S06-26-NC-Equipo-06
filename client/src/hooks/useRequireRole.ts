import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Role } from "@/app/auth/types";

/**
 * Hook para requerir que un usuario esté autenticado y tenga uno de los roles permitidos.
 * Si no está autenticado, redirige al login.
 * Si está autenticado pero con un rol no permitido, redirige al inicio ("/").
 *
 * @param allowedRoles Listado de roles que tienen permiso para acceder a la ruta.
 * @param redirectTo Ruta a la cual redirigir si no hay sesión activa (por defecto "/auth/login").
 */
export const useRequireRole = (allowedRoles: Role[], redirectTo: string = "/auth/login") => {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!role) {
        router.push(redirectTo);
      } else if (!allowedRoles.includes(role)) {
        router.push("/");
      }
    }
  }, [role, isLoading, router, allowedRoles, redirectTo]);

  return {
    isLoading,
    isAuthorized: !isLoading && role !== null && allowedRoles.includes(role),
  };
};
