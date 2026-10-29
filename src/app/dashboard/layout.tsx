"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, User, LogOut, ChevronDown, Monitor } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, role, unit_id, units(name)")
        .eq("id", user.id)
        .single();
      
      if (!data?.unit_id) {
        alert("Sua conta ainda não foi vinculada a uma unidade. Contate o administrador geral.");
        supabase.auth.signOut();
        return router.push("/login");
      }
      setProfile(data);
    }
    loadSession();
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (!mounted || !profile) return null; // Evita erro de hidratação

  const isAdmin = profile.role === "global_admin";

  const nav = [
    { href: "/dashboard", label: "Início" },
    { href: "/dashboard/assets", label: "Ativos" },
    { href: "/dashboard/tickets", label: "Chamados" },
    ...(isAdmin ? [
      { href: "/dashboard/units", label: "Unidades" },
      { href: "/dashboard/users", label: "Usuários" }
    ] : []),
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          
          <div className="flex items-center gap-6">
            <span className="font-semibold text-lg">Inventário TI</span>
            <nav className="hidden sm:flex gap-4 text-sm">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-500">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Botão de Tema */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Alternar tema"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Menu de Usuário */}
            <div className="relative">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-500"
              >
                <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 dark:bg-slate-800 dark:text-brand-400">
                  <User size={16} />
                </div>
                <span className="hidden sm:block">{profile.full_name?.split(" ")[0]}</span>
                <ChevronDown size={14} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 z-50">
                  <div className="p-3 border-b dark:border-slate-700">
                    <p className="text-sm font-medium">{profile.full_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {isAdmin ? "Admin Geral" : "Admin de Unidade"} · {profile.units?.name}
                    </p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <LogOut size={16} />
                      Sair do sistema
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
