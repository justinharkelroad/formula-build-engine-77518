export const PRICING = {
  earlyBird: {
    agencyOwner: {
      name: "Agency Owner",
      fullPrice: 897,
      price: 697,
      url: "https://buy.stripe.com/14A3cv7474AK3EIbX23wQ0f",
      passType: "agencyOwner" as const,
    },
    team: {
      name: "Team Member",
      fullPrice: 597,
      price: 397,
      url: "https://buy.stripe.com/fZuaEX9cfc3c6QU6CI3wQ0g",
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
