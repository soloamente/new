import { notFound } from "next/navigation";
import { getPractice, getPracticeAudits } from "@/app/actions/practices-actions";
import { getOperators } from "@/app/actions/users-actions";
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

  const [practice, audits, operators] = await Promise.all([
    getPractice(practiceId),
    getPracticeAudits(practiceId),
    getOperators(),
  ]);

  if (!practice) {
    notFound();
  }

  return <PracticeDetail practice={practice} audits={audits} operators={operators} />;
}
