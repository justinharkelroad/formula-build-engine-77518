/**
 * The eight workbook session pages, in the workbook's own session order. Drives the secondary
 * cross-page nav at the bottom of every resource page.
 *
 * Funding the Build is deliberately absent — it supports the 2027 Business Map,
 * not one of the eight sessions.
 */
export interface ResourceLibraryEntry {
  path: string;
  label: string;
}

export const RESOURCE_LIBRARY: ResourceLibraryEntry[] = [
  { path: "/resources/sales-sequence", label: "1 · The Sales Sequence" },
  { path: "/resources/growth-through-service", label: "2 · Growth Through Service" },
  { path: "/resources/body", label: "3 · The Body Session" },
  { path: "/resources/operating-system", label: "4 · The Operating System" },
  { path: "/resources/training", label: "5 · Commitment to Training" },
  { path: "/resources/balance", label: "6 · The Balance Session" },
  { path: "/resources/making-it-rain", label: "7 · Making It Rain" },
  { path: "/resources/being", label: "8 · The Being Session" },
];
