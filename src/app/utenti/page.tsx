import { getUsers } from "@/app/actions/users-actions";
import { getStudios } from "@/app/actions/studios-actions";
import { convertUserToRow } from "@/lib/users-utils";
import Utenti from "./utenti";

/**
 * Server component wrapper that fetches users and studios data
 * and passes it to the client Utenti component
 */
export default async function UtentiPage() {
  const [users, studios] = await Promise.all([getUsers(), getStudios()]);

  // Create a map of studio_id -> studio name for efficient lookup
  const studioNameMap = new Map(
    studios.map((studio) => [studio.id, studio.name]),
  );

  const userRows = users.map((user) => convertUserToRow(user, studioNameMap));

  return <Utenti users={userRows} />;
}

