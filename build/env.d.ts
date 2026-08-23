// Ambient declarations for the build-time TypeScript program.
//
// build/prerenderMeta.ts imports src/config/event.ts to reuse the site's canonical
// URL, event name and social image, keeping one source of truth with SEO.tsx. That
// module references window.gtag, whose global augmentation lives in
// src/hooks/useAnalytics.ts — a file the build program does not include. Declaring
// it here keeps the build config typechecked without pulling the app program in.
interface Window {
  gtag?: (...args: unknown[]) => void;
}
