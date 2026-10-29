import { redirect } from "next/navigation";
import { getSession, listAssets } from "@/lib/queries";
import NewTicketForm from "./form";

export default async function Page() {
  const session = await getSession();
  if (!session || !session.profile) redirect("/login");
  
  const assets = await listAssets();

  return (
    <NewTicketForm 
      assets={assets as any} 
      unitId={session.profile.unit_id!} 
    />
  );
}
