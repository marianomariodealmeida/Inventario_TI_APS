"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewTicketForm({ unitId, userName }: { unitId: string, userName: string }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [team, setTeam] = useState("TI - Gerência");
  const [impact, setImpact] = useState("1 pessoa não consegue trabalhar");
  const [ticketCategory, setTicketCategory] = useState("Suporte Geral");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Opções baseadas nas imagens enviadas
  const teams = [
    "TI - Gerência", "TI - Logística - Henilda", "TI - Oficina - Jaerlison", 
    "TI - Redes e Infraestrutura", "TI - Sistemas e Web"
  ];

  const impacts = [
    "Muitas pessoas não conseguem trabalhar", "Muitas pessoas afetadas", 
    "1 pessoa não consegue trabalhar", "1 pessoa afetada"
  ];

  const categories = [
    "OFICINA TI", "GERENCIAMENTO DE SERVIÇOS", "TELEFONIA - MOVEL (Voz/ Dados)", 
    "TELEFONIA - INTERNET", "TELEFONIA - FIXO", "SUPORTE GERAL", "REPARO - OUTROS", 
    "REPARO - IPAD", "REPARO - CELULAR", "PREPARAÇÃO EVENTOS", "NOTA FISCAL", 
    "INGLÊS CORPORATIVO", "ENTREGA DISPOSITIVOS", "AD", "Software", "Hardware", 
    "Rede", "Outro"
  ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    // Gera um número de chamado automático (ex: TK-16854321)
    const generatedTicketNumber = `TK-${Date.now().toString().slice(-6)}`;

    const { error } = await supabase.from("tickets").insert({
      ticket_number: generatedTicketNumber,
      unit_id: unitId,
      title: title,
      description: summary, // Resumo vai para a coluna description
      team: team,
      impact: impact,
      ticket_category: ticketCategory,
      // Como o novo formulário não tem ativo, deixamos como null
    });
    
    setSaving(false);
    if (error) return setError(error.message);
    
    router.push("/dashboard/tickets");
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Nova Tíquete | {team}</h1>
      </div>
      
      <form onSubmit={submit} className="card space-y-5">
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        
        {/* Seleção do Setor */}
        <div>
          <label className="label font-bold">Destino / Setor</label>
          <select className="input" value={team} onChange={(e) => setTeam(e.target.value)}>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Título */}
        <div>
          <label className="label font-bold">Título: (obrigatório)</label>
          <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        {/* Resumo (Textarea) */}
        <div>
          <label className="label font-bold">Resumo:</label>
          <textarea 
            className="input min-h-[150px]" 
            placeholder="Digite alguma coisa ou cole capturas de tela"
            value={summary} 
            onChange={(e) => setSummary(e.target.value)} 
          />
        </div>

        {/* Grid de metadados */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label font-bold">Emissor:</label>
            <input className="input bg-slate-100 dark:bg-slate-800 cursor-not-allowed" disabled value={userName} />
          </div>

          <div>
            <label className="label font-bold">Impacto:</label>
            <select className="input" value={impact} onChange={(e) => setImpact(e.target.value)}>
              {impacts.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="label font-bold">Categoria:</label>
            <select className="input" value={ticketCategory} onChange={(e) => setTicketCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-800">
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={saving || !title}>
            {saving ? "Salvando..." : "Abrir Chamado"}
          </button>
        </div>
      </form>
    </div>
  );
}
