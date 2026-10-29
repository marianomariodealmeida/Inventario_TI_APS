import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/queries";

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { profile } = session;
  const isAdmin = profile.role === "global_admin";

  if (!profile.unit_id) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="card max-w-md">
          <h1 className="text-lg font-semibold">Perfil pendente</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sua conta ainda não foi vinculada a uma unidade. Contate o
            administrador geral.
          </p>
        </div>
      </main>
    );
  }

  const nav = [
    { href: "/dashboard", label: "Início" },
    { href: "/dashboard/assets", label: "Ativos" },
    { href: "/dashboard/tickets", label: "Chamados" },
    ...(isAdmin ? [{ href: "/dashboard/units", label: "Unidades" }] : []),
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <div className="flex items-center gap-6">
            <span className="font-semibold">Inventário TI</span>
            <nav className="flex gap-4 text-sm">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="text-slate-600 hover:text-brand-600">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div className="font-medium text-slate-800">{profile.full_name}</div>
            <div>{isAdmin ? "Admin geral" : "Admin de unidade"}</div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
