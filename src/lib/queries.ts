import { createClient } from "@/lib/supabase/server";

export async function getSession() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, unit_id, units(name)")
    .eq("id", user.id)
    .single();
  return { user, profile };
}

export async function listUnits() {
  const supabase = createClient();
  const { data } = await supabase.from("units").select("*").order("name");
  return data ?? [];
}

export async function listCategories() {
  const supabase = createClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return (data ?? []) as any[];
}

export async function listAssets() {
  const supabase = createClient();
  const { data } = await supabase
    .from("assets")
    .select("*, units(name), categories(name)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAsset(id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("assets")
    .select("*, units(name), categories(name, form_schema)")
    .eq("id", id)
    .single();
  return data;
}

export async function listTickets() {
  const supabase = createClient();
  const { data } = await supabase
    .from("tickets")
    .select("*, units(name), assets(asset_number, brand, model)")
    .order("opened_at", { ascending: false });
  return data ?? [];
}
