import { Crown, Award, Star } from "lucide-react";

export type PartnerTierKey = "platinum" | "gold" | "silver" | "bronze";

export interface PartnerTierConfig {
  name: string;
  price: number;
  priceInCents: number;
  passes: number;
  icon: typeof Crown;
  colorGradient: string;
  badgeColor: string;
  paymentLink: string;
  leadListTiming: string;
  appPlacement: string;
  videoScreenPlacement: string;
  hasGeneralSessionVideo: boolean;
  hasStageTime: boolean;
  highlights: string[];
}

export const PARTNER_TIERS: Record<PartnerTierKey, PartnerTierConfig> = {
  platinum: {
    name: "Platinum",
    price: 15000,
    priceInCents: 1500000,
    passes: 8,
    icon: Crown,
    colorGradient: "from-slate-400 to-slate-600",
    badgeColor: "bg-gradient-to-br from-slate-400 to-slate-600",
    paymentLink: "https://buy.stripe.com/28EaEXdsvebk1wAbX23wQ0d",
    leadListTiming: "30 days before the event + an exclusive email blast",
    appPlacement: "Primary + VIP placement",
    videoScreenPlacement: "General Session break screens + partnership-room & hallway screens",
    hasGeneralSessionVideo: true,
    hasStageTime: true,
    highlights: [
      "Premium booth: Two 6-ft tables in a prime spot",
      "Co-branding on Welcome Reception & Thursday-Night Event",
      "8 full-access passes",
      "5-min live stage slot during a General Session",
      "Logo on event Step-and-Repeat backdrop",
      "1-on-1 video-podcast interview",
      "30-sec video ad on General Session break screens",
      "Branded F³ swag for your team",
      "Video loop on partnership-room & hallway screens",
      "Attendee lead list 30 days pre-event + exclusive email blast",
      "Primary + VIP mobile app placement",
      "Full photo/video package",
    ],
  },
  gold: {
    name: "Gold",
    price: 10000,
    priceInCents: 1000000,
    passes: 6,
    icon: Award,
    colorGradient: "from-amber-400 to-yellow-600",
    badgeColor: "bg-gradient-to-br from-amber-400 to-yellow-600",
    paymentLink: "https://buy.stripe.com/8x2bJ1corffob7a0ek3wQ0e",
    leadListTiming: "10 days before the event",
    appPlacement: "VIP listing",
    videoScreenPlacement: "General Session break screens + hallway/partnership-room screens",
    hasGeneralSessionVideo: true,
    hasStageTime: false,
    highlights: [
      "Two 6-ft tables (premium placement)",
      "Option to co-brand Welcome Reception & Thursday-Night Event",
      "6 full-access passes",
      "On-stage verbal shout-out during General Session",
      "1-on-1 video-podcast interview",
      "30-sec video ad on General Session break screens",
      "Team swag packs",
      "Video loop on hallway/partnership-room screens",
      "Lead list 10 days pre-event",
      "VIP mobile app listing",
      "Post-event photo/video bundle",
    ],
  },
  silver: {
    name: "Silver",
    price: 7500,
    priceInCents: 750000,
    passes: 4,
    icon: Star,
    colorGradient: "from-slate-300 to-slate-500",
    badgeColor: "bg-gradient-to-br from-slate-300 to-slate-500",
    paymentLink: "https://buy.stripe.com/bJeeVd0FJd7gb7a5yE3wQ02",
    leadListTiming: "5 days after the event",
    appPlacement: "Standard listing",
    videoScreenPlacement: "Hallway/partnership-room screens",
    hasGeneralSessionVideo: false,
    hasStageTime: false,
    highlights: [
      "One 6-ft table booth",
      "4 full-access passes",
      "General Session voice call-out",
      "1-on-1 video-podcast interview",
      "Team swag packs",
      "Video loop on hallway/partnership-room screens",
      "Lead list 5 days post-event",
      "Standard mobile app listing",
      "Post-event photo/video bundle",
    ],
  },
  bronze: {
    name: "Bronze",
    price: 5000,
    priceInCents: 500000,
    passes: 2,
    icon: Star,
    colorGradient: "from-amber-600 to-amber-800",
    badgeColor: "bg-gradient-to-br from-amber-600 to-amber-800",
    paymentLink: "https://buy.stripe.com/14A28r9cf5EO0swaSY3wQ03",
    leadListTiming: "10 days after the event",
    appPlacement: "Standard listing",
    videoScreenPlacement: "Hallway/partnership-room screens",
    hasGeneralSessionVideo: false,
    hasStageTime: false,
    highlights: [
      "One 6-ft table booth",
      "2 full-access passes",
      "1-on-1 video-podcast interview",
      "Team swag packs",
      "30-sec hallway/partnership-room video loop",
      "Lead list 10 days post-event",
      "Standard mobile app listing",
      "Post-event photo/video bundle",
    ],
  },
};

export const isPartnerTier = (tier: string): tier is PartnerTierKey =>
  tier in PARTNER_TIERS;
