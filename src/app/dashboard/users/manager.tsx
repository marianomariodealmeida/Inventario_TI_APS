"use client";

import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";

export default function UsersManager({ initial, units }: { initial: any[], units: any[] }) {
  const [users, setUsers] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("unit_admin");
  const [unitId, setUnitId] = useState(units[0]?.id || "");

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName, role, unit_id: unitId })
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error);

    setEmail(""); setPassword(""); setFullName("");
    window.location.reload();
  }

  async function deleteUser(id: string) {
    if (!confirm("Excluir este usuário? Esta ação não pode ser desfeita.")) return;
    setLoading(true);
    const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) window.location.reload();
    else alert("Erro ao excluir usuário.");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Usuários</h1>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2"><UserPlus size={18}/> Novo Usuário</h2>
        <form onSubmit={createUser} className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <input className="input" placeholder="Nome Completo" required value={fullName} onChange={e => setFullName(e.target.value)} />
          <input className="input" type="email" placeholder="E-mail" required value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Senha Inicial" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
          
          <select className="input" value={role} onChange={e => setRole(e.target.value)}>
            <option value="unit_admin">Admin de Unidade</option>
            <option value="global_admin">Admin Geral</option>
          </select>
          
          <select className="input" value={unitId} onChange={e => setUnitId(e.target.value)}>
            {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Salvando..." : "Criar Usuário"}
          </button>
        </form>
      </section>

      <section className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Papel</th>
              <th className="p-3">Unidade</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t dark:border-slate-800">
                <td className="p-3">{u.full_name}</td>
                <td className="p-3">{u.role === "global_admin" ? "Admin Geral" : "Admin Unidade"}</td>
                <td className="p-3">{u.units?.name || "—"}</td>
                <td className="p-3 text-right">
                  <button 
                    className="text-red-600 hover:text-red-800 dark:text-red-400 disabled:opacity-50" 
                    onClick={() => deleteUser(u.id)}
                    disabled={loading}
                  >
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
