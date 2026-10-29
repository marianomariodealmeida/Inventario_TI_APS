import { listTickets } from "@/lib/queries";

export default async function TicketsPage() {
  const tickets = await listTickets();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Chamados</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
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
              <tr key={t.id} className="border-t">
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
