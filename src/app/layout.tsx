import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventário TI — Rede Educacional",
  description: "Gestão de ativos de TI por unidade",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
