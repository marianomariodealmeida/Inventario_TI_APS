import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const { email, password, full_name, unit_id, role } = await req.json();

  // 1. Verifica se quem está pedindo é Global Admin
  const cookieStore = cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabaseAuth.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "global_admin") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  // 2. Usa a chave Admin para criar o usuário
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name }
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  // 3. Atualiza o perfil do usuário recém-criado (o trigger já criou, mas falta vincular unidade e role)
  const { error: profileError } = await supabaseAdmin.from("profiles").update({
    unit_id: unit_id || null,
    role: role || "unit_admin",
    full_name: full_name
  }).eq("id", newUser.user.id);

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

  // Verifica permissão
  const cookieStore = cookies();
  const supabaseAuth = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } });
  const { data: { user } } = await supabaseAuth.auth.getUser();
  const { data: profile } = await supabaseAuth.from("profiles").select("role").eq("id", user?.id).single();
  if (profile?.role !== "global_admin") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  // Deleta usando Admin key (o cascade apagará da tabela profiles também)
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
