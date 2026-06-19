"use client";

import React from "react";
import Header from "@/components/header";
import { useRequireRole } from "@/hooks/useRequireRole";

export default function CompanyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoading, isAuthorized } = useRequireRole(["COMPANY"]);

  if (isLoading) {
    return <div>Cargando sesión...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
    </>
  );
}
