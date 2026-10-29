import { getSession, listUnits } from "@/lib/queries";
import { redirect } from "next/navigation";
import UnitsManager from "./manager";

export default async function Page() {
  const session = await getSession();
  
  // A checagem dupla abaixo é o que o TypeScript exige:
  if (!session || !session.profile) redirect("/login");
  
  if (session.profile.role !== "global_admin") redirect("/dashboard");
  
  const units = await listUnits();
  return <UnitsManager initial={units as any} />;
}
