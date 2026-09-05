import {
  type VerificationDependencies,
  type VerificationStatus,
  verifyFormulaRegistration,
} from "./verification.ts";

const SESSION_ID = "cs_test_readiness123";

function assertStatus(
  actual: VerificationStatus,
  expected: VerificationStatus,
): void {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, received ${actual}`);
  }
}

function dependencies(
  overrides: Partial<VerificationDependencies> = {},
): VerificationDependencies {
  return {
    retrieveCheckoutSession: async () => ({ paymentStatus: "paid" }),
    listPurchases: async () => [{ id: "p1", quantity: 1, pass_type: "team" }],
    listRegistrationSources: async () => [{
      source_id: "p1",
      reconciliation_state: "resolved",
      registration_id: "r1",
    }],
    listRegistrations: async () => [{
      id: "r1",
      registration_state: "invited",
    }],
    listEntitlements: async () => [{
      event_registration_id: "r1",
      access_state: "active",
      event_attendance_allowed: true,
    }],
    ...overrides,
  };
}

Deno.test("confirms a fully reconciled paid checkout", async () => {
  const status = await verifyFormulaRegistration(SESSION_ID, dependencies());
  assertStatus(status, "registration_confirmed");
});

Deno.test("keeps a mixed resolved and unresolved checkout in attendee setup", async () => {
  const status = await verifyFormulaRegistration(
    SESSION_ID,
    dependencies({
      listPurchases: async () => [
        { id: "p1", quantity: 1, pass_type: "team" },
        { id: "p2", quantity: 1, pass_type: "team" },
      ],
      listRegistrationSources: async () => [
        {
          source_id: "p1",
          reconciliation_state: "resolved",
          registration_id: "r1",
        },
        {
          source_id: "p2",
          reconciliation_state: "manual_review",
          registration_id: null,
        },
      ],
    }),
  );
  assertStatus(status, "payment_recorded");
});

Deno.test("requires one distinct registration for every purchased seat", async () => {
  const status = await verifyFormulaRegistration(
    SESSION_ID,
    dependencies({
      listPurchases: async () => [
        { id: "p1", quantity: 1, pass_type: "agencyOwner" },
        { id: "p2", quantity: 1, pass_type: "team" },
      ],
      listRegistrationSources: async () => [
        {
          source_id: "p1",
          reconciliation_state: "resolved",
          registration_id: "r1",
        },
        {
          source_id: "p2",
          reconciliation_state: "already_registered",
          registration_id: "r1",
        },
      ],
    }),
  );
  assertStatus(status, "payment_recorded");
});

Deno.test("follows a single already_registered source by registration_id", async () => {
  const status = await verifyFormulaRegistration(
    SESSION_ID,
    dependencies({
      listRegistrationSources: async () => [{
        source_id: "p1",
        reconciliation_state: "already_registered",
        registration_id: "r1",
      }],
    }),
  );
  assertStatus(status, "registration_confirmed");
});

Deno.test("does not confirm a suspended entitlement", async () => {
  const status = await verifyFormulaRegistration(
    SESSION_ID,
    dependencies({
      listEntitlements: async () => [{
        event_registration_id: "r1",
        access_state: "suspended",
        event_attendance_allowed: true,
      }],
    }),
  );
  assertStatus(status, "payment_recorded");
});

Deno.test("requires active event attendance permission", async () => {
  const status = await verifyFormulaRegistration(
    SESSION_ID,
    dependencies({
      listEntitlements: async () => [{
        event_registration_id: "r1",
        access_state: "active",
        event_attendance_allowed: false,
      }],
    }),
  );
  assertStatus(status, "payment_recorded");
});

Deno.test("rejects a malformed session without calling dependencies", async () => {
  let called = false;
  const status = await verifyFormulaRegistration(
    "not-a-checkout-session",
    dependencies({
      retrieveCheckoutSession: async () => {
        called = true;
        return { paymentStatus: "paid" };
      },
    }),
  );
  assertStatus(status, "not_found");
  if (called) throw new Error("Malformed input reached the Stripe dependency");
});

Deno.test("reports a service outage separately from processing", async () => {
  const status = await verifyFormulaRegistration(
    SESSION_ID,
    dependencies({
      retrieveCheckoutSession: () =>
        Promise.reject(new Error("service unavailable")),
    }),
  );
  assertStatus(status, "unavailable");
});
