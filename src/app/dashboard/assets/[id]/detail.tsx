"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AssetForm from "@/components/AssetForm";
import { createClient } from "@/lib/supabase/client";

export default function AssetDetail({
  asset, categories, units, movements, tickets, isGlobalAdmin, currentUnitId,
}: any) {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<"edit" | "transfer" | "tickets">("edit");

  async function save(payload: any) {
    const { error } = await supabase.from("assets").update({
      unit_id: payload.unit_id,
      category_id: payload.category_id,
      asset_number: payload.asset_number,
      serial_number: payload.serial_number || null,
      brand: payload.brand || null,
      model: payload.model || null,
      origin: payload.origin,
      specs: payload.specs ?? {},
    }).eq("id", asset.id);
    if (error) throw error;
    router.refresh();
  }

  async function remove() {
    if (!confirm("Excluir este ativo? Essa ação não pode ser desfeita.")) return;
    const { error } = await supabase.from("assets").delete().eq("id", asset.id);
    if (error) return alert(error.message);
    router.push("/dashboard/assets");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{asset.asset_number}</h1>
        <p className="text-sm text-slate-500">
          {asset.categories?.name} · {asset.brand} {asset.model}
        </p>
      </div>

      <div className="flex gap-2 border-b">
        {[
          ["edit", "Dados"],
          ["transfer", "Transferência / Desativação"],
          ["tickets", "Chamados"],
        ].map(([key, label]) => (
          <button key={key}
            className={`px-3 py-2 text-sm ${tab === key ? "border-b-2 border-brand-600 font-medium text-brand-700" : "text-slate-600"}`}
            onClick={() => setTab(key as any)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "edit" && (
        <AssetForm
          categories={categories}
          units={units}
          isGlobalAdmin={isGlobalAdmin}
          defaultUnitId={currentUnitId}
          initial={asset}
          onSubmit={save}
          onDelete={remove}
        />
      )}

      {tab === "transfer" && (
        <MovementPanel asset={asset} units={units} movements={movements} />
      )}

      {tab === "tickets" && (
        <TicketsPanel assetId={asset.id} unitId={asset.unit_id} tickets={tickets} />
      )}
    </div>
  );
}

function MovementPanel({ asset, units, movements }: any) {
  const router = useRouter();
  const supabase = createClient();
  const [type, setType] = useState<"transfer" | "deactivation">("transfer");
  const [toUnit, setToUnit] = useState<string>(asset.unit_id);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const { error: mErr } = await supabase.from("asset_movements").insert({
        asset_id: asset.id,
        from_unit_id: asset.unit_id,
        to_unit_id: type === "transfer" ? toUnit : null,
        movement_type: type,
        reason,
      });
      if (mErr) throw mErr;

      const patch = type === "transfer"
        ? { unit_id: toUnit, status: "active" }
        : { status: "deactivated" };

      const { error: aErr } = await supabase.from("assets").update(patch).eq("id", asset.id);
      if (aErr) throw aErr;

      setReason("");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Transferir ou desativar</h2>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <div>
          <label className="label">Ação</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="transfer">Transferir para outra unidade</option>
            <option value="deactivation">Desativar equipamento</option>
          </select>
        </div>
        {type === "transfer" && (
          <div>
            <label className="label">Unidade destino</label>
            <select className="input" value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
              {units.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="label">Motivo</label>
          <textarea className="input" rows={3} value={reason}
                    onChange={(e) => setReason(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={submit} disabled={saving}>
          {saving ? "Registrando..." : "Registrar"}
        </button>
      </section>

      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">Histórico de movimentações</h2>
        {movements.length === 0 ? (
          <p className="text-sm text-slate-500">Sem movimentações registradas.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {movements.map((m: any) => (
              <li key={m.id} className="rounded border bg-slate-50 p-3">
                <div className="font-medium">{m.movement_type}</div>
                <div className="text-slate-600">
                  {m.from_unit?.name ?? "—"} → {m.to_unit?.name ?? "—"}
                </div>
                {m.reason && <div className="text-slate-500">{m.reason}</div>}
                <div className="text-xs text-slate-400">
                  {new Date(m.created_at).toLocaleString("pt-BR")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TicketsPanel({ assetId, unitId, tickets }: any) {
  const router = useRouter();
  const supabase = createClient();
  const [ticketNumber, setTicketNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
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
    setTicketNumber(""); setTitle(""); setDescription("");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Abrir chamado</h2>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Nº do Chamado</label>
            <input className="input" value={ticketNumber}
                   onChange={(e) => setTicketNumber(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Descrição breve</label>
            <input className="input" value={title}
                   onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sm:col-span-3">
            <label className="label">Detalhes (opcional)</label>
            <textarea className="input" rows={3} value={description}
                      onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <button className="btn-primary" onClick={open}
                disabled={saving || !ticketNumber || !title}>
          {saving ? "Salvando..." : "Abrir chamado"}
        </button>
      </section>

      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">Chamados do ativo</h2>
        {tickets.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum chamado registrado.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {tickets.map((t: any) => (
              <li key={t.id} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">#{t.ticket_number} — {t.title}</div>
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs">{t.status}</span>
                </div>
                {t.description && <p className="mt-1 text-slate-600">{t.description}</p>}
                <div className="text-xs text-slate-400 mt-1">
                  {new Date(t.opened_at).toLocaleString("pt-BR")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
