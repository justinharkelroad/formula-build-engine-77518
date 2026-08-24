import { createClient } from "@supabase/supabase-js";

const REQUIRED_ACK = "counts-only-read-authorized";
const KNOWN_PASS_TYPES = ["agencyOwner", "team", "partner", "unknown"];
const PARTNER_PASSES = { platinum: 8, gold: 6, silver: 4, bronze: 2 };
const PAGE_SIZE = 1000;

function stop(code) {
  console.error(JSON.stringify({ ok: false, error_code: code }));
  process.exit(1);
}

if (process.env.FORMULA_ROSTER_AUDIT_ACK !== REQUIRED_ACK) {
  stop("formula_roster_audit_ack_required");
}

const supabaseUrl = process.env.FORMULA_ROSTER_AUDIT_SUPABASE_URL;
const serviceRoleKey = process.env.FORMULA_ROSTER_AUDIT_SERVICE_ROLE_KEY;
const acknowledgedProjectRef = process.env.FORMULA_ROSTER_AUDIT_PROJECT_REF;

if (!supabaseUrl || !serviceRoleKey || !acknowledgedProjectRef) {
  stop("formula_roster_audit_server_environment_required");
}

let projectRef;
try {
  const host = new URL(supabaseUrl).hostname;
  const match = host.match(/^([a-z]{20})\.supabase\.co$/);
  projectRef = match?.[1];
} catch {
  stop("formula_roster_audit_url_invalid");
}

if (!projectRef || projectRef !== acknowledgedProjectRef) {
  stop("formula_roster_audit_project_ack_mismatch");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function isMissingTable(error) {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

async function readAll(table, columns) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      if (isMissingTable(error)) return { exists: false, rows: [] };
      stop(`formula_roster_audit_${table}_read_failed`);
    }

    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return { exists: true, rows };
}

async function countRows(table, filters = []) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [column, value] of filters) query = query.eq(column, value);
  const { count, error } = await query;
  if (error) {
    if (isMissingTable(error)) return { exists: false, count: 0 };
    stop(`formula_roster_audit_${table}_count_failed`);
  }
  return { exists: true, count: count ?? 0 };
}

function textPresent(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeEmail(value) {
  return textPresent(value) ? value.trim().toLowerCase() : null;
}

const purchasesResult = await readAll(
  "purchases",
  "id,email,name,quantity,pass_type,tier",
);
const partnersResult = await readAll("partner_profiles", "id,tier,attendees");

if (!purchasesResult.exists && !partnersResult.exists) {
  stop("formula_roster_audit_no_expected_source_tables");
}

const purchases = purchasesResult.rows;
const partnerProfiles = partnersResult.rows;
const partnerAttendees = partnerProfiles.flatMap((profile) =>
  Array.isArray(profile.attendees) ? profile.attendees : [],
);

const purchasedSeatQuantities = purchases.reduce(
  (sum, row) => sum + Math.max(Number(row.quantity) || 0, 0),
  0,
);
const partnerPassAllotments = purchases
  .filter((row) => row.pass_type === "partner")
  .reduce(
    (sum, row) =>
      sum +
      (PARTNER_PASSES[row.tier] ?? 0) * Math.max(Number(row.quantity) || 0, 0),
    0,
  );

const attendeePurchases = purchases.filter((row) => row.pass_type !== "partner");
const namedPurchaseRecords = attendeePurchases.filter((row) => textPresent(row.name)).length;
const namedPartnerRecords = partnerAttendees.filter((row) => textPresent(row?.name)).length;
const quantityWithoutNames = attendeePurchases.reduce((sum, row) => {
  const quantity = Math.max(Number(row.quantity) || 0, 0);
  return sum + Math.max(quantity - (textPresent(row.name) ? 1 : 0), 0);
}, 0);

const missingNames =
  quantityWithoutNames +
  partnerAttendees.filter((row) => !textPresent(row?.name)).length;
const missingEmails =
  attendeePurchases.filter((row) => !textPresent(row.email)).length +
  partnerAttendees.filter((row) => !textPresent(row?.email)).length;

const normalizedEmails = [
  ...attendeePurchases.map((row) => normalizeEmail(row.email)),
  ...partnerAttendees.map((row) => normalizeEmail(row?.email)),
].filter(Boolean);
const emailCounts = new Map();
for (const normalized of normalizedEmails) {
  emailCounts.set(normalized, (emailCounts.get(normalized) ?? 0) + 1);
}
const duplicateNormalizedEmailCount = [...emailCounts.values()].filter(
  (count) => count > 1,
).length;

const passTypeDistribution = Object.fromEntries(
  [...KNOWN_PASS_TYPES, "other"].map((passType) => [passType, 0]),
);
for (const row of purchases) {
  const bucket = KNOWN_PASS_TYPES.includes(row.pass_type) ? row.pass_type : "other";
  passTypeDistribution[bucket] += 1;
}
const unknownPassTypeCount = passTypeDistribution.unknown + passTypeDistribution.other;

const representedSources = await countRows("formula_registration_sources");
const resolvedSources = representedSources.exists
  ? await countRows("formula_registration_sources", [["reconciliation_state", "resolved"]])
  : { exists: false, count: 0 };

const namedReady = attendeePurchases.filter(
  (row) =>
    Math.max(Number(row.quantity) || 0, 0) === 1 &&
    textPresent(row.name) &&
    textPresent(row.email) &&
    KNOWN_PASS_TYPES.includes(row.pass_type) &&
    row.pass_type !== "unknown" &&
    row.pass_type !== "partner",
).length;
const partnerRosterMissingEmail = partnerAttendees.filter(
  (row) => textPresent(row?.name) && !textPresent(row?.email),
).length;

console.log(
  JSON.stringify(
    {
      ok: true,
      source_tables: {
        purchases: purchasesResult.exists,
        partner_profiles: partnersResult.exists,
        formula_registration_sources: representedSources.exists,
      },
      counts: {
        purchase_rows: purchases.length,
        purchased_seat_quantities: purchasedSeatQuantities,
        named_attendee_records: namedPurchaseRecords + namedPartnerRecords,
        partner_pass_allotments: partnerPassAllotments,
        partner_attendee_array_entries: partnerAttendees.length,
        missing_names: missingNames,
        missing_emails: missingEmails,
        duplicate_normalized_email_count: duplicateNormalizedEmailCount,
        pass_type_distribution: passTypeDistribution,
        unknown_pass_type_count: unknownPassTypeCount,
        quantity_without_names_count: quantityWithoutNames,
        source_rows_already_represented: representedSources.count,
      },
      reconciliation_categories: {
        named_ready: namedReady,
        quantity_without_names: quantityWithoutNames,
        missing_email: missingEmails,
        duplicate_email: duplicateNormalizedEmailCount,
        conflicting_source: duplicateNormalizedEmailCount,
        unclassified_pass_type: unknownPassTypeCount,
        partner_roster_missing_email: partnerRosterMissingEmail,
        already_registered: representedSources.count,
        manual_review:
          duplicateNormalizedEmailCount + unknownPassTypeCount + partnerRosterMissingEmail,
        resolved: resolvedSources.count,
      },
    },
    null,
    2,
  ),
);
