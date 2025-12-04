import { getClients } from "@/app/actions/clients-actions";
import { getPractices } from "@/app/actions/practices-actions";
import { convertClientToRowWithPractices } from "@/lib/clients-utils";
import Clienti from "./clienti";

/**
 * Server component wrapper that fetches clients and practices data
 * and passes it to the client Clienti component
 */
export default async function ClientiPage() {
  // Fetch both clients and practices in parallel
  const [clients, practices] = await Promise.all([
    getClients(),
    getPractices(),
  ]);

  // Convert clients to rows with practices data
  const clientRows = clients.map((client) =>
    convertClientToRowWithPractices(client, practices),
  );

  return <Clienti clients={clientRows} />;
}
