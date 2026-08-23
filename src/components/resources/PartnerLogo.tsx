import { useState } from "react";

interface PartnerLogoProps {
  /** Public path to the logo. Empty string renders the missing-asset state. */
  logo: string;
  logoAlt: string;
  name: string;
}

/**
 * Fixed-height white logo tile. The tile height is constant across every card so
 * the grid reads as one row of partners rather than a ransom note; the max-width
 * cap keeps a long wordmark from stretching edge-to-edge next to a square mark.
 *
 * A path that 404s falls back to the same labelled state as a missing path, so a
 * broken asset reads as "we owe you a logo" rather than a browser glyph.
 */
const PartnerLogo = ({ logo, logoAlt, name }: PartnerLogoProps) => {
  // Tracks the src that failed rather than a boolean, so pointing the component at
  // a different logo clears the fallback without an effect.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showFallback = !logo || failedSrc === logo;

  return (
    <div className="flex h-[84px] items-center justify-center rounded-xl bg-white px-5 py-3.5">
      {showFallback ? (
        <span className="text-center text-[0.5625rem] font-bold uppercase leading-relaxed tracking-[0.16em] text-black/45">
          Logo asset needed
          <br />
          {name}
        </span>
      ) : (
        <img
          src={logo}
          alt={logoAlt}
          loading="lazy"
          onError={() => setFailedSrc(logo)}
          className="h-auto max-h-full w-auto max-w-[200px] object-contain"
        />
      )}
    </div>
  );
};

export default PartnerLogo;
