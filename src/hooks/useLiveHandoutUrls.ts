import { useEffect, useMemo, useState } from "react";
import type { BaseResourcePartner } from "@/config/resources/types";
import {
  fetchHandoutsByOrg,
  resolveHandoutUrl,
  type HandoutsByOrg,
} from "@/lib/partnerHandouts";

/**
 * Swap each partner's baked-in Formula resource URL for whatever that partner
 * currently has in the Partner Hub.
 *
 * Renders immediately with the reviewed URLs, then re-renders once the mirror
 * answers — so the card is never empty, never blocked on the network, and is
 * correct in the prerendered HTML. If the fetch fails the reviewed URLs stand.
 *
 * Partners with no supplied resource pass through untouched: without an orgId
 * there is nothing to resolve, and the card keeps its not-supplied state.
 */
export const useLiveHandoutUrls = (
  partners: BaseResourcePartner[]
): BaseResourcePartner[] => {
  const [handouts, setHandouts] = useState<HandoutsByOrg | null>(null);

  useEffect(() => {
    let active = true;
    void fetchHandoutsByOrg().then((result) => {
      if (active) setHandouts(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => {
    if (!handouts || handouts.size === 0) return partners;

    return partners.map((partner) => {
      const url = resolveHandoutUrl(
        handouts,
        partner.formulaResourceOrgId,
        partner.formulaResourceUrl,
        partner.formulaResourceSlot
      );
      return url === partner.formulaResourceUrl
        ? partner
        : { ...partner, formulaResourceUrl: url };
    });
  }, [handouts, partners]);
};
