import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResidIA · Gestor Web",
  description: "Libro de Incidencias Digital de tu residencia. Registro único, trazable y en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
