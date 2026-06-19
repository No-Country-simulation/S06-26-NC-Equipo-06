"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function MunicipalRootPage() {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (role === "MUNICIPAL_ADMIN" || role === "MUNICIPAL_EVALUATOR") {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [role, isLoading, router]);

  return (
    <div>
      <p>Redirigiendo...</p>
    </div>
  );
}
