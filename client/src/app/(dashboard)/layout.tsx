"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import useAuth from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !role) {
      router.push("/auth/login");
    }
  }, [role, isLoading, router]);

  if (isLoading) {
    return <div>Cargando sesión...</div>;
  }

  if (!role) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
    </>
  );
}

