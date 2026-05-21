import { getPractices } from "@/app/actions/practices-actions";
import { getCurrentUser } from "@/app/actions/auth-actions";
import { getUsers } from "@/app/actions/users-actions";
import { convertPracticeToRow } from "@/lib/practices-utils";
import { redirect } from "next/navigation";
import Pratiche from "./pratiche";

export default async function PratichePage() {
  const currentUser = await getCurrentUser();

  if (currentUser?.role_id === 3) {
    redirect("/mie-pratiche");
  }

  const [practices, studioUsers] = await Promise.all([
    getPractices(),
    currentUser?.role_id === 2 ? getUsers() : Promise.resolve([]),
  ]);

  const practiceRows = practices.map(convertPracticeToRow);

  // For admins: prepend themselves so they can also assign to themselves
  const assignableUsers =
    currentUser?.role_id === 2
      ? [
          { id: currentUser.id, name: currentUser.name },
          ...studioUsers.map((u) => ({ id: u.id, name: u.name })),
        ]
      : undefined;

  return (
    <Pratiche
      practices={practiceRows}
      userRoleId={currentUser?.role_id}
      currentUserId={currentUser?.id}
      assignableUsers={assignableUsers}
      view="all"
    />
  );
}
