import { redirect } from "next/navigation";
import { getSession } from "@/lib/queries";
import NewTicketForm from "./form";

export default async function Page() {
  const session = await getSession();
  if (!session || !session.profile) redirect("/login");
  
  return (
    <NewTicketForm 
      unitId={session.profile.unit_id!} 
      userName={session.profile.full_name || "Usuário"}
    />
  );
}
