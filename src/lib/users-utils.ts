import type { User } from "@/app/actions/auth-actions";
import { formatDate } from "./practices-utils";

// Map role_id to Italian label
export function getRoleLabel(roleId: number): string {
  switch (roleId) {
    case 1:
      return "DATAWEB";
    case 2:
      return "AMMINISTRATORE_STUDIO";
    case 3:
      return "OPERATORE";
    default:
      return "Sconosciuto";
  }
}

// Convert User from API to UserRow for UI
export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  studio: string;
  status: string;
  createdAt: string;
}

export function convertUserToRow(
  user: User,
  studioNameMap?: Map<number, string>,
): UserRow {
  const studioName =
    user.studio_id && studioNameMap
      ? studioNameMap.get(user.studio_id) ?? "N/A"
      : user.studio_id
        ? `Studio ${user.studio_id}`
        : "Non impostato";

  return {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    role: getRoleLabel(user.role_id),
    studio: studioName,
    status: user.status || "N/A",
    createdAt: formatDate(user.created_at),
  };
}




