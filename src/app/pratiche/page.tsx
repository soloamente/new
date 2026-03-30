import { getPractices } from "@/app/actions/practices-actions";
import { getCurrentUser } from "@/app/actions/auth-actions";
import { convertPracticeToRow } from "@/lib/practices-utils";
import Pratiche from "./pratiche";

/**
 * Server component wrapper that fetches all practices
 * and passes them to the client Pratiche component.
 */
export default async function PratichePage() {
  const currentUser = await getCurrentUser();
  const practices = await getPractices();
  const practiceRows = practices.map(convertPracticeToRow);

  return (
    <Pratiche
      practices={practiceRows}
      userRoleId={currentUser?.role_id}
      currentUserId={currentUser?.id}
      view="all"
    />
  );
}
