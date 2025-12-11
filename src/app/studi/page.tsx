import { getStudios } from "@/app/actions/studios-actions";
import { convertStudioToRow } from "@/lib/studios-utils";
import Studi from "./studi";

/**
 * Server component wrapper that fetches studios data
 * and passes it to the client Studi component
 */
export default async function StudiPage() {
  const studios = await getStudios();
  const studioRows = studios.map(convertStudioToRow);

  return <Studi studios={studioRows} />;
}





