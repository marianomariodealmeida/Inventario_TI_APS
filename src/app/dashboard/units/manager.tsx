"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UnitsManager({ initial }: { initial: any[] }) {
  const supabase = createClient();
  const [units, setUnits] = useState(initial);
  const [name, setName] = useState("");
  const [type, setType] = useState<"school" | "headquarters">("school");
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const { data } = await supabase.from("units").select("*").order("name");
    setUnits(data ?? []);
  }

  async function create() {
    setError(null);
    const { error } = await supabase.from("units").insert({ name, type });
    if (error) return setError(error.message);
    setName("");
    reload();
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
        <h2 className="text-lg font-semibold">Nova unidade</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input className="input" placeholder="Nome" value={name}
                 onChange={(e) => setName(e.target.value)} />
          <select className="input" value={type}
                  onChange={(e) => setType(e.target.value as any)}>
            <option value="school">Escola / Colégio</option>
            <option value="headquarters">Sede administrativa</option>
          </select>
          <button className="btn-primary" onClick={create} disabled={!name}>Adicionar</button>
        </div>
      </section>
      <section className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr><th className="p-3">Nome</th><th className="p-3">Tipo</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.type === "headquarters" ? "Sede" : "Escola"}</td>
                <td className="p-3 text-right">
                  <button className="text-red-600 hover:underline" onClick={() => remove(u.id)}>
                    Excluir
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
