import { getPractices } from "@/app/actions/practices-actions";
import { convertPracticeToRow } from "@/lib/practices-utils";
import Pratiche from "./pratiche";

/**
 * Server component wrapper that fetches practices data
 * and passes it to the client Pratiche component
 */
export default async function PratichePage() {
  const practices = await getPractices();
  const practiceRows = practices.map(convertPracticeToRow);

  return <Pratiche practices={practiceRows} />;
}
