import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCTAClick } from "@/hooks/useAnalytics";
import { getPostEventCtaLabel } from "@/config/postEvent";

// Formula Forum 2026 is over and ticket sales are closed. This used to open a
// Stripe pass picker; it now sends visitors to the reunion-call block on the
// homepage, which links to the Zoom registration (or the AI portal after Nov 2).
const PassTypeDialog = () => (
  <Button asChild variant="cta" size="lg" className="whitespace-nowrap">
    <Link
      to="/"
      state={{ scrollTo: "reunion-call" }}
      onClick={() => trackCTAClick("nav_post_event_cta")}
    >
      {getPostEventCtaLabel()}
      <ArrowRight className="ml-2" size={16} />
    </Link>
  </Button>
);

export default PassTypeDialog;
