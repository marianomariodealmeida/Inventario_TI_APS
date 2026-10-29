"use client";

import { useRouter } from "next/navigation";
import AssetForm from "@/components/AssetForm";
import { createClient } from "@/lib/supabase/client";
import type { Category, Unit } from "@/lib/types";

export default function NewAssetForm({
  categories, units, isGlobalAdmin, defaultUnitId,
}: {
  categories: Category[];
  units: Unit[];
  isGlobalAdmin: boolean;
  defaultUnitId: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function create(payload: any) {
    const { error } = await supabase.from("assets").insert({
      unit_id: payload.unit_id,
      category_id: payload.category_id,
      asset_number: payload.asset_number,
      serial_number: payload.serial_number || null,
      brand: payload.brand || null,
      model: payload.model || null,
      origin: payload.origin,
      specs: payload.specs ?? {},
    });
    if (error) throw error;
    router.push("/dashboard/assets");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Novo ativo</h1>
      <AssetForm
        categories={categories}
        units={units}
        isGlobalAdmin={isGlobalAdmin}
        defaultUnitId={defaultUnitId}
        onSubmit={create}
      />
    </div>
  );
}
