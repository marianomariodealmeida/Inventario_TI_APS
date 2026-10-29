import { redirect } from "next/navigation";
import { getSession, listCategories, listUnits } from "@/lib/queries";
import NewAssetForm from "./form";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");
  const [categories, units] = await Promise.all([listCategories(), listUnits()]);
  return (
    <NewAssetForm
      categories={categories as any}
      units={units as any}
      isGlobalAdmin={session.profile.role === "global_admin"}
      defaultUnitId={session.profile.unit_id!}
    />
  );
}
