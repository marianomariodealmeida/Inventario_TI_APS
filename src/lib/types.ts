export type AppRole = "global_admin" | "unit_admin";
export type UnitType = "headquarters" | "school";
export type AssetStatus = "active" | "in_transfer" | "deactivated" | "maintenance";
export type MovementType = "transfer" | "deactivation" | "reactivation" | "status_change";
export type TicketStatus = "open" | "in_progress" | "resolved" | "cancelled";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "multiselect";
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

export type FormSchema = { fields: FieldDef[] };

export type Unit = { id: string; name: string; type: UnitType };
export type Category = { id: string; name: string; form_schema: FormSchema };
export type Profile = { id: string; full_name: string | null; role: AppRole; unit_id: string | null };

export type Asset = {
  id: string;
  unit_id: string;
  category_id: string;
  asset_number: string;
  serial_number: string | null;
  brand: string | null;
  model: string | null;
  origin: string;
  status: AssetStatus;
  specs: Record<string, unknown>;
  created_at: string;
};

export type Ticket = {
  id: string;
  ticket_number: string;
  asset_id: string;
  unit_id: string;
  title: string;
  description: string | null;
  status: TicketStatus;
  opened_at: string;
  closed_at: string | null;
};
