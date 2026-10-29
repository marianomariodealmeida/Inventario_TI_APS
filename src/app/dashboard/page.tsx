import { getSession, listAssets, listTickets } from "@/lib/queries";

export default async function DashboardHome() {
  const [session, assets, tickets] = await Promise.all([
    getSession() as any,
    listAssets(),
    listTickets(),
  ]);

  const profile = session.profile;
  const activeAssets = assets.filter((a: any) => a.status === "active").length;
  const deactivated = assets.filter((a: any) => a.status === "deactivated").length;
  const openTickets = tickets.filter((t: any) => t.status === "open").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Olá, {profile.full_name}</h1>
        <p className="text-sm text-slate-500">{profile.units?.name ?? "—"}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Ativos em uso" value={activeAssets} />
        <Stat label="Desativados" value={deactivated} />
        <Stat label="Chamados abertos" value={openTickets} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
