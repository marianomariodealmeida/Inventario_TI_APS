"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pencil, Trash2, X } from "lucide-react";

export default function UnitsManager({ initial }: { initial: any[] }) {
  const supabase = createClient();
  const [units, setUnits] = useState(initial);
  const [name, setName] = useState("");
  const [type, setType] = useState<"school" | "headquarters">("school");
  const [error, setError] = useState<string | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);

  async function reload() {
    const { data } = await supabase.from("units").select("*").order("name");
    setUnits(data ?? []);
  }

  async function save() {
    setError(null);
    if (editingId) {
      const { error } = await supabase.from("units").update({ name, type }).eq("id", editingId);
      if (error) return setError(error.message);
      setEditingId(null);
    } else {
      const { error } = await supabase.from("units").insert({ name, type });
      if (error) return setError(error.message);
    }
    setName("");
    setType("school");
    reload();
  }

  function startEdit(unit: any) {
    setEditingId(unit.id);
    setName(unit.name);
    setType(unit.type);
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setType("school");
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta unidade?")) return;
    const { error } = await supabase.from("units").delete().eq("id", id);
    if (error) return setError(error.message);
    reload();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Unidades</h1>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      
      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">{editingId ? "Editar Unidade" : "Nova unidade"}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <input className="input sm:col-span-2" placeholder="Nome" value={name}
                 onChange={(e) => setName(e.target.value)} />
          <select className="input" value={type}
                  onChange={(e) => setType(e.target.value as any)}>
            <option value="school">Escola / Colégio</option>
            <option value="headquarters">Sede administrativa</option>
          </select>
          <div className="flex gap-2">
            <button className="btn-primary w-full" onClick={save} disabled={!name}>
              {editingId ? "Salvar" : "Adicionar"}
            </button>
            {editingId && (
              <button className="btn-secondary" onClick={cancelEdit} title="Cancelar">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Tipo</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr key={u.id} className="border-t dark:border-slate-800">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.type === "headquarters" ? "Sede" : "Escola"}</td>
                <td className="p-3 flex justify-end gap-3">
                  <button className="text-brand-600 hover:text-brand-800 dark:text-brand-400" onClick={() => startEdit(u)}>
                    <Pencil size={16} />
                  </button>
                  <button className="text-red-600 hover:text-red-800 dark:text-red-400" onClick={() => remove(u.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
