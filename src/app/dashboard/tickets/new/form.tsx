"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewTicketForm({ assets, unitId }: { assets: any[], unitId: string }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [ticketNumber, setTicketNumber] = useState("");
  const [assetId, setAssetId] = useState(assets[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    const { error } = await supabase.from("tickets").insert({
      ticket_number: ticketNumber,
      asset_id: assetId,
      unit_id: unitId,
      title,
      description: description || null,
    });
    
    setSaving(false);
    if (error) return setError(error.message);
    
    router.push("/dashboard/tickets");
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Novo Chamado</h1>
      
      <form onSubmit={submit} className="card space-y-4">
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Nº do Chamado</label>
            <input className="input" required value={ticketNumber} onChange={(e) => setTicketNumber(e.target.value)} />
          </div>
          <div>
            <label className="label">Ativo Relacionado</label>
            <select className="input" required value={assetId} onChange={(e) => setAssetId(e.target.value)}>
              <option value="">Selecione um ativo...</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>{a.asset_number} - {a.brand} {a.model} ({a.units?.name})</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Descrição breve (Motivo)</label>
            <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Detalhes (opcional)</label>
            <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Salvando..." : "Abrir Chamado"}
          </button>
        </div>
      </form>
    </div>
  );
}
