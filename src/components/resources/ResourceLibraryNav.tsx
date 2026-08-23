import { Link } from "react-router-dom";
import { RESOURCE_LIBRARY } from "@/config/resources/library";

interface ResourceLibraryNavProps {
  /** Route of the page currently being viewed — omitted from the list. */
  currentPath: string;
}

/**
 * Secondary navigation between workbook resource pages. Deliberately small: the
 * attendee scanned a QR code for one session, so this is a way out, not a menu.
 */
const ResourceLibraryNav = ({ currentPath }: ResourceLibraryNavProps) => {
  const others = RESOURCE_LIBRARY.filter((entry) => entry.path !== currentPath);
  if (others.length === 0) return null;

  return (
    <nav
      aria-label="Other Formula workbook resources"
      className="px-[clamp(1.25rem,5vw,3rem)] pb-[clamp(2rem,6vw,3rem)]"
    >
      <div className="mx-auto max-w-7xl border-t border-white/10 pt-7">
        <div className="mb-3.5 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-white/45">
          Other Formula resources
        </div>
        <div className="flex flex-wrap gap-2">
          {others.map((entry) => (
            <Link
              key={entry.path}
              to={entry.path}
              className="inline-flex min-h-[36px] items-center rounded-full border border-white/20 px-3 py-[0.4375rem] text-[0.6875rem] font-semibold tracking-[0.02em] text-white/80 transition-colors hover:border-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--secondary)/0.55)]"
            >
              {entry.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default ResourceLibraryNav;
