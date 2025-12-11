import { getPractices } from "@/app/actions/practices-actions";
import { getCurrentUser } from "@/app/actions/auth-actions";
import { convertPracticeToRow } from "@/lib/practices-utils";
import Pratiche from "@/app/pratiche/pratiche";

/**
 * Server component that renders only the practices
 * assigned to the current OPERATORE.
 */
export default async function MiePratichePage() {
  const currentUser = await getCurrentUser();
  const practices = await getPractices(true);
  const practiceRows = practices.map(convertPracticeToRow);

  return (
    <Pratiche
      practices={practiceRows}
      userRoleId={currentUser?.role_id}
      currentUserId={currentUser?.id}
      view="mine"
      paths={{ all: "/pratiche", mine: "/mie-pratiche" }}
    />
  );
}
