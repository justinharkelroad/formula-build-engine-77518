export const PRICING = {
  agent: {
    name: "Agent",
    old: 949,
    new: 849,
    url: "https://buy.stripe.com/dRmdR94VZ0ku7UY1io3wQ00",
    passType: "agent" as const,
  },
  team: {
    name: "Team Member", 
    old: 649,
    new: 549,
    url: "https://buy.stripe.com/5kQ3cv3RV5EOgrue5a3wQ01",
    passType: "team" as const,
  },
} as const;

export type PassType = "agent" | "team";
