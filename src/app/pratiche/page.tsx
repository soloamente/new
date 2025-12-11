import { getPractices } from "@/app/actions/practices-actions";
import { getCurrentUser } from "@/app/actions/auth-actions";
import { convertPracticeToRow } from "@/lib/practices-utils";
import Pratiche from "./pratiche";

interface PratichePageProps {
  searchParams: Promise<{ assigned_to_me?: string }>;
}

/**
 * Server component wrapper that fetches practices data
 * and passes it to the client Pratiche component
 */
export default async function PratichePage({
  searchParams,
}: PratichePageProps) {
  const params = await searchParams;
  const currentUser = await getCurrentUser();
  
  // Check if user is OPERATORE and if assigned_to_me filter is requested
  const isOperator = currentUser?.role_id === 3;
  const assignedToMe = isOperator && params.assigned_to_me === "true";
  
  // Fetch practices with appropriate filter
  const practices = await getPractices(assignedToMe);
  const practiceRows = practices.map(convertPracticeToRow);

  return (
    <Pratiche
      practices={practiceRows}
      userRoleId={currentUser?.role_id}
      currentUserId={currentUser?.id}
    />
  );
}
