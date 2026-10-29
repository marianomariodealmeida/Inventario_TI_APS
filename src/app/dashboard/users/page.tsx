import { redirect } from "next/navigation";
import { getSession, listUnits } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import UsersManager from "./manager";

export default async function Page() {
  const session = await getSession();
  if (!session || session.profile.role !== "global_admin") redirect("/dashboard");

  const supabase = createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*, units(name)")
    .order("created_at", { ascending: false });

  const units = await listUnits();

  return <UsersManager initial={users ?? []} units={units} />;
}
