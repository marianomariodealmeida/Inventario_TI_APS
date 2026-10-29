import Link from "next/link";
import { listTickets } from "@/lib/queries";
import { PlusCircle } from "lucide-react";

export default async function TicketsPage() {
  const tickets = await listTickets();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chamados</h1>
        <Link className="btn-primary flex gap-2" href="/dashboard/tickets/new">
          <PlusCircle size={18} /> Novo Chamado
        </Link>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 text-left">
            <tr>
              <th className="p-3">Nº</th>
              <th className="p-3">Ativo</th>
              <th className="p-3">Motivo</th>
              <th className="p-3">Unidade</th>
              <th className="p-3">Status</th>
              <th className="p-3">Abertura</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 && (
              <tr><td className="p-3 text-slate-500" colSpan={6}>Nenhum chamado.</td></tr>
            )}
            {tickets.map((t: any) => (
              <tr key={t.id} className="border-t dark:border-slate-800">
                <td className="p-3 font-medium">#{t.ticket_number}</td>
                <td className="p-3">{t.assets?.asset_number} — {t.assets?.brand}</td>
                <td className="p-3">{t.title}</td>
                <td className="p-3">{t.units?.name}</td>
                <td className="p-3">{t.status}</td>
                <td className="p-3">{new Date(t.opened_at).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
