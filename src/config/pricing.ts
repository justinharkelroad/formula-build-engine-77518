export const PRICING = {
  earlyBird: {
    agencyOwner: {
      name: "Agency Owner",
      fullPrice: 897,
      price: 697,
      url: "https://buy.stripe.com/28E7sLgEH7MW8Z26CI3wQ08",
      passType: "agencyOwner" as const,
    },
    team: {
      name: "Team Member",
      fullPrice: 597,
      price: 397,
      url: "https://buy.stripe.com/9B67sLgEHc3c1wAgdi3wQ0a",
      passType: "team" as const,
    },
  },
  vip: {
    agencyOwner: {
      name: "Agency Owner",
      fullPrice: 897,
      price: 538,
      url: "https://buy.stripe.com/cNieVd9cfd7g1wA4uA3wQ0b",
      passType: "agencyOwner" as const,
    },
    team: {
      name: "Team Member",
      fullPrice: 597,
      price: 358,
      url: "https://buy.stripe.com/14A4gz7474AK0sw6CI3wQ0c",
      passType: "team" as const,
    },
  },
} as const;

export type PassType = "agencyOwner" | "team";
export type PricingTier = "earlyBird" | "vip";
