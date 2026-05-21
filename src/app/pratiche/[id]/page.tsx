import { notFound, redirect } from "next/navigation";
import { getPractice, getPracticeAudits } from "@/app/actions/practices-actions";
import { getOperators } from "@/app/actions/users-actions";
import { getCurrentUser } from "@/app/actions/auth-actions";
import PracticeDetail from "./practice-detail";

interface PracticeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PracticeDetailPage({
  params,
}: PracticeDetailPageProps) {
  const { id } = await params;
  const practiceId = Number.parseInt(id, 10);

  if (Number.isNaN(practiceId)) {
    notFound();
  }

  const [practice, audits, operators, currentUser] = await Promise.all([
    getPractice(practiceId),
    getPracticeAudits(practiceId),
    getOperators(),
    getCurrentUser(),
  ]);

  if (!practice) {
    notFound();
  }

  if (currentUser?.role_id === 3 && practice.assigned_to !== currentUser.id) {
    redirect("/mie-pratiche");
  }

  return <PracticeDetail practice={practice} audits={audits} operators={operators} userRoleId={currentUser?.role_id} />;
}
