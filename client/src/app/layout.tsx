import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Footer from "@/components/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lictia",
  description: "Lictia, tu plataforma para el control de licencias médicas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html
        lang="en"
        className={`${inter.variable} ${geistMono.variable} h-full antialiased bg-background`}
      >
        <body className="min-h-full flex flex-col">
          <AuthProvider>{children}</AuthProvider>
        </body>
      </html>
      <Footer />
    </>
  );
}



