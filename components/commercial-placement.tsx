import { isCommercialPlacementEnabled } from "../lib/operations/policy";

export function CommercialPlacement({ kind }: { kind: "advertising" | "affiliate" }) {
  if (!isCommercialPlacementEnabled(kind)) return null;
  return null;
}
