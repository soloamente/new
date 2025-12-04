import { notFound } from "next/navigation";
import { getPractice } from "@/app/actions/practices-actions";
import PracticeDetail from "./practice-detail";

interface PracticeDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Server component that fetches practice data
 * and passes it to the client PracticeDetail component
 */
export default async function PracticeDetailPage({
  params,
}: PracticeDetailPageProps) {
  const { id } = await params;
  const practiceId = Number.parseInt(id, 10);

  // Validate ID is a number
  if (Number.isNaN(practiceId)) {
    notFound();
  }

  const practice = await getPractice(practiceId);

  if (!practice) {
    notFound();
  }

  return <PracticeDetail practice={practice} />;
}

