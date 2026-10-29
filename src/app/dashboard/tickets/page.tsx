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
          <thead className="bg-slate-100 text-left dark:bg-slate-800 dark:text-slate-200">
            <tr>
              <th className="p-3">Nº</th>
              <th className="p-3">Título</th>
              <th className="p-3">Setor</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Impacto</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 && (
              <tr><td className="p-3 text-slate-500" colSpan={6}>Nenhum chamado aberto.</td></tr>
            )}
            {tickets.map((t: any) => (
              <tr key={t.id} className="border-t dark:border-slate-800">
                <td className="p-3 font-medium">#{t.ticket_number}</td>
                <td className="p-3">{t.title}</td>
                <td className="p-3">{t.team || "—"}</td>
                <td className="p-3">{t.ticket_category || "—"}</td>
                <td className="p-3">{t.impact || "—"}</td>
                <td className="p-3">
                  <span className="rounded bg-blue-100 text-blue-800 px-2 py-1 text-xs dark:bg-blue-900 dark:text-blue-200">
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
