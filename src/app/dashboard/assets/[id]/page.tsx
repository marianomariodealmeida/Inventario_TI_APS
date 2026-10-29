import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession, listCategories, listUnits } from "@/lib/queries";
import AssetDetail from "./detail";

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !session.profile) redirect("/login");

  const supabase = createClient();
  const { data: asset } = await supabase
    .from("assets")
    .select("*, categories(name)")
    .eq("id", params.id)
    .single();
  if (!asset) notFound();

  const [{ data: movements }, { data: tickets }] = await Promise.all([
    supabase.from("asset_movements")
      .select("*, from_unit:from_unit_id(name), to_unit:to_unit_id(name)")
      .eq("asset_id", params.id)
      .order("created_at", { ascending: false }),
    supabase.from("tickets")
      .select("*")
      .eq("asset_id", params.id)
      .order("opened_at", { ascending: false }),
  ]);

  const [categories, units] = await Promise.all([listCategories(), listUnits()]);

  return (
    <AssetDetail
      asset={asset}
      categories={categories as any}
      units={units as any}
      movements={movements ?? []}
      tickets={tickets ?? []}
      isGlobalAdmin={session.profile.role === "global_admin"}
      currentUnitId={session.profile.unit_id!}
    />
  );
}
