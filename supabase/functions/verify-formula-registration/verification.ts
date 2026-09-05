export type VerificationStatus =
  | "registration_confirmed"
  | "payment_recorded"
  | "pending"
  | "not_found"
  | "unavailable";

export interface CheckoutPurchase {
  id: string;
  quantity: number | null;
  pass_type: string | null;
}

export interface RegistrationSource {
  source_id: string;
  reconciliation_state: string;
  registration_id: string | null;
}

export interface EventRegistration {
  id: string;
  registration_state: string;
}

export interface FormulaEntitlement {
  event_registration_id: string;
  access_state: string;
  event_attendance_allowed: boolean;
}

export interface VerificationDependencies {
  retrieveCheckoutSession(
    sessionId: string,
  ): Promise<{ paymentStatus: string }>;
  listPurchases(sessionId: string): Promise<CheckoutPurchase[]>;
  listRegistrationSources(purchaseIds: string[]): Promise<RegistrationSource[]>;
  listRegistrations(registrationIds: string[]): Promise<EventRegistration[]>;
  listEntitlements(registrationIds: string[]): Promise<FormulaEntitlement[]>;
}

export class CheckoutSessionNotFoundError extends Error {}

export function isValidCheckoutSessionId(sessionId: string): boolean {
  return sessionId.length <= 255 &&
    /^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(sessionId);
}

export async function verifyFormulaRegistration(
  sessionId: string,
  dependencies: VerificationDependencies,
): Promise<VerificationStatus> {
  if (!isValidCheckoutSessionId(sessionId)) return "not_found";

  try {
    const checkout = await dependencies.retrieveCheckoutSession(sessionId);
    if (checkout.paymentStatus !== "paid") return "pending";

    const purchases = await dependencies.listPurchases(sessionId);
    if (purchases.length === 0) return "pending";

    // A positive result covers the whole checkout. Multi-seat purchases without
    // attendee names and non-attendee pass types require roster follow-up.
    if (
      purchases.some((purchase) =>
        purchase.quantity !== 1 ||
        !["agencyOwner", "team"].includes(purchase.pass_type ?? "")
      )
    ) {
      return "payment_recorded";
    }

    const purchaseIds = purchases.map((purchase) => String(purchase.id));
    const sources = await dependencies.listRegistrationSources(purchaseIds);
    const readySourceStates = new Set(["resolved", "already_registered"]);

    const resolvedSources = purchases.map((purchase) => {
      const matches = sources.filter((source) =>
        String(source.source_id) === String(purchase.id)
      );
      if (
        matches.length !== 1 ||
        !readySourceStates.has(matches[0].reconciliation_state) ||
        !matches[0].registration_id
      ) {
        return null;
      }
      return matches[0];
    });
    if (resolvedSources.some((source) => source === null)) {
      return "payment_recorded";
    }

    const registrationIds = Array.from(
      new Set(resolvedSources.map((source) => source!.registration_id!)),
    );
    if (registrationIds.length !== purchases.length) {
      return "payment_recorded";
    }
    const registrations = await dependencies.listRegistrations(registrationIds);
    const registrationById = new Map(
      registrations.map((registration) => [registration.id, registration]),
    );
    if (
      registrationIds.some((id) => {
        const registration = registrationById.get(id);
        return !registration ||
          !["invited", "claimed", "checked_in"].includes(
            registration.registration_state,
          );
      })
    ) {
      return "payment_recorded";
    }

    const entitlements = await dependencies.listEntitlements(registrationIds);
    const entitlementByRegistration = new Map(
      entitlements.map((entitlement) => [
        entitlement.event_registration_id,
        entitlement,
      ]),
    );
    if (
      registrationIds.some((id) => {
        const entitlement = entitlementByRegistration.get(id);
        return !entitlement || entitlement.access_state !== "active" ||
          entitlement.event_attendance_allowed !== true;
      })
    ) {
      return "payment_recorded";
    }

    return "registration_confirmed";
  } catch (error) {
    if (error instanceof CheckoutSessionNotFoundError) return "not_found";
    return "unavailable";
  }
}
