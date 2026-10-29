import Link from "next/link";
import { listAssets } from "@/lib/queries";

const statusLabel: Record<string, string> = {
  active: "Ativo",
  in_transfer: "Em transferência",
  deactivated: "Desativado",
  maintenance: "Manutenção",
};

export default async function AssetsPage() {
  const assets = await listAssets();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ativos</h1>
        <Link className="btn-primary" href="/dashboard/assets/new">Novo ativo</Link>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Nº Ativo</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Marca / Modelo</th>
              <th className="p-3">Unidade</th>
              <th className="p-3">Origem</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 && (
              <tr><td className="p-3 text-slate-500" colSpan={7}>Nenhum ativo cadastrado.</td></tr>
            )}
            {assets.map((a: any) => (
              <tr key={a.id} className="border-t">
                <td className="p-3 font-medium">{a.asset_number}</td>
                <td className="p-3">{a.categories?.name}</td>
                <td className="p-3">{[a.brand, a.model].filter(Boolean).join(" / ")}</td>
                <td className="p-3">{a.units?.name}</td>
                <td className="p-3">{a.origin}</td>
                <td className="p-3">{statusLabel[a.status] ?? a.status}</td>
                <td className="p-3 text-right">
                  <Link className="text-brand-600 hover:underline"
                        href={`/dashboard/assets/${a.id}`}>
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
