// Kept apart from formulaSurvey.ts so the site-wide analytics hook can import
// it without pulling the survey definition into the main bundle.

/** Survey pages run no advertising or analytics trackers. */
export function isNoTrackingPath(pathname: string): boolean {
  return /^\/survey(\/|$)/.test(pathname);
}

const GA4_DISABLE_KEY = "ga-disable-G-THCBG6D7ZM";

/**
 * Stops trackers that were already loaded on an earlier page from recording
 * anything while a survey is open. Returns the function that resumes them.
 */
export function pauseTracking(): () => void {
  const w = window as unknown as Record<string, unknown> & { fbq?: (...args: unknown[]) => void };
  w[GA4_DISABLE_KEY] = true;
  try {
    w.fbq?.("consent", "revoke");
  } catch {
    // A blocked or half-loaded pixel is fine: nothing is sent either way.
  }
  return () => {
    w[GA4_DISABLE_KEY] = false;
    try {
      w.fbq?.("consent", "grant");
    } catch {
      // Same as above.
    }
  };
}
