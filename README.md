# Inventário de TI — Rede Educacional

Sistema multi-unidade para gestão de ativos de TI (sede + escolas),
com formulários dinâmicos por categoria, transferência/desativação
auditável e módulo de chamados.

## Stack
- Next.js 14 (App Router)
- Supabase (Postgres + Auth + RLS)
- Tailwind CSS
- Deploy: Vercel / Netlify

## Setup local

```bash
npm install
cp .env.local.example .env.local      # preencha URL + ANON_KEY
npx supabase login
npx supabase link --project-ref <REF>
npx supabase db push
npm run dev
