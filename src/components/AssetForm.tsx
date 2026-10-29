"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Asset, Category, FieldDef, Unit } from "@/lib/types";

type Props = {
  categories: Category[];
  units: Unit[];
  isGlobalAdmin: boolean;
  defaultUnitId: string;
  initial?: Partial<Asset>;
  onSubmit: (payload: any) => Promise<void> | void;
  onDelete?: () => void;
};

export default function AssetForm({
  categories, units, isGlobalAdmin, defaultUnitId, initial, onSubmit, onDelete,
}: Props) {
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? categories[0]?.id ?? "");
  const category = categories.find((c) => c.id === categoryId);
  const fields = category?.form_schema?.fields ?? [];
  const [specs, setSpecs] = useState<Record<string, any>>(initial?.specs ?? {});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      unit_id: initial?.unit_id ?? defaultUnitId,
      category_id: initial?.category_id ?? categories[0]?.id,
      asset_number: initial?.asset_number ?? "",
      serial_number: initial?.serial_number ?? "",
      brand: initial?.brand ?? "",
      model: initial?.model ?? "",
      origin: initial?.origin ?? "",
    },
  });

  function updateSpec(name: string, value: any) {
    setSpecs((s) => ({ ...s, [name]: value }));
  }

  async function submit(values: any) {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ ...values, category_id: categoryId, specs });
    } catch (e: any) {
      setError(e.message ?? "Erro ao salvar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Dados do ativo</h2>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Unidade</label>
            <select className="input" {...register("unit_id")} disabled={!isGlobalAdmin}>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Categoria</label>
            <select
              className="input"
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setSpecs({}); }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Número de Ativo</label>
            <input className="input" {...register("asset_number", { required: true })} />
          </div>
          <div>
            <label className="label">Número de série</label>
            <input className="input" {...register("serial_number")} />
          </div>
          <div>
            <label className="label">Marca</label>
            <input className="input" {...register("brand")} />
          </div>
          <div>
            <label className="label">Modelo</label>
            <input className="input" {...register("model")} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Origem (local de uso)</label>
            <input className="input" placeholder="Ex.: Laboratório 2, Secretaria..."
                   {...register("origin", { required: true })} />
          </div>
        </div>
      </section>

      {fields.length > 0 && (
        <section className="card space-y-4">
          <h2 className="text-lg font-semibold">Especificações — {category?.name}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <DynamicField
                key={f.name}
                field={f}
                value={specs[f.name]}
                onChange={(v) => updateSpec(f.name, v)}
              />
            ))}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between">
        <div>
          {onDelete && (
            <button type="button" className="btn-danger" onClick={onDelete}>
              Excluir ativo
            </button>
          )}
        </div>
        <button className="btn-primary" disabled={submitting}>
          {submitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}

function DynamicField({
  field, value, onChange,
}: { field: FieldDef; value: any; onChange: (v: any) => void }) {
  if (field.type === "select") {
    return (
      <div>
        <label className="label">{field.label}{field.required && " *"}</label>
        <select className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  if (field.type === "multiselect") {
    const selected: string[] = Array.isArray(value) ? value : [];
    return (
      <div className="sm:col-span-2">
        <label className="label">{field.label}{field.required && " *"}</label>
        <div className="flex flex-wrap gap-2">
          {field.options?.map((o) => {
            const checked = selected.includes(o);
            return (
              <label key={o} className="inline-flex items-center gap-2 rounded border px-2 py-1 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    onChange(checked ? selected.filter((x) => x !== o) : [...selected, o])
                  }
                />
                {o}
              </label>
            );
          })}
        </div>
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div className="sm:col-span-2">
        <label className="label">{field.label}{field.required && " *"}</label>
        <textarea className="input" rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  return (
    <div>
      <label className="label">{field.label}{field.required && " *"}</label>
      <input
        className="input"
        type={field.type === "number" ? "number" : "text"}
        value={value ?? ""}
        onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
      />
    </div>
  );
}
