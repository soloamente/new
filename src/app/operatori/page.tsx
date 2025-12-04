import { getOperators } from "@/app/actions/users-actions";
import { getPractices } from "@/app/actions/practices-actions";
import { convertOperatorToRow, type OperatorRow } from "@/lib/operators-utils";
import { getCurrentUser } from "@/app/actions/auth-actions";
import Operatori from "./operatori";

/**
 * Server component wrapper that fetches operators and practices data
 * and passes it to the client Operatori component
 */
export default async function OperatoriPage() {
  // Fetch operators, practices, and current user in parallel
  const [operators, practices, currentUser] = await Promise.all([
    getOperators(),
    getPractices(),
    getCurrentUser(),
  ]);

  // Filter operators by studio_id if user is AMMINISTRATORE_STUDIO
  // DATAWEB sees all operators, AMMINISTRATORE_STUDIO sees only their studio's operators
  const filteredOperators =
    currentUser?.role_id === 2 && currentUser.studio_id
      ? operators.filter((op) => op.studio_id === currentUser.studio_id)
      : operators;

  // Convert operators to rows with practices data
  const operatorRows: OperatorRow[] = filteredOperators.map((operator) =>
    convertOperatorToRow(operator, practices),
  );

  return <Operatori operators={operatorRows} />;
}
