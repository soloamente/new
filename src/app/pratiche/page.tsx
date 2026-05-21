import { getPractices } from "@/app/actions/practices-actions";
import { getCurrentUser } from "@/app/actions/auth-actions";
import { convertPracticeToRow } from "@/lib/practices-utils";
import { redirect } from "next/navigation";
import Pratiche from "./pratiche";

export default async function PratichePage() {
  const currentUser = await getCurrentUser();

  if (currentUser?.role_id === 3) {
    redirect("/mie-pratiche");
  }

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
