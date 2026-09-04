import { Helmet } from "react-helmet-async";
import { CONFIG } from "@/config/event";
import { ogImageFor } from "@/config/ogImages";

interface SEOProps {
  title: string;
  description: string;
  path?: string; // e.g., "/pricing"
  noindex?: boolean;
  /** Route-specific 1200x630 share image. Falls back to src/config/ogImages.ts, then CONFIG.OG_IMAGE_1200x630. */
  ogImage?: string;
}

const absolute = (url: string): string => (url.startsWith("http") ? url : `${CONFIG.SITE_URL}${url}`);

const SEO = ({ title, description, path = "/", noindex = false, ogImage: ogImageProp }: SEOProps) => {
  const canonical = `${CONFIG.SITE_URL}${path === "/" ? "" : path}`;
  const routeImage = ogImageProp || ogImageFor(path);
  const ogImage = absolute(routeImage ?? CONFIG.OG_IMAGE_1200x630);
  const twitterImage = absolute(routeImage ?? CONFIG.TW_IMAGE_1200x600);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index,follow"} />
      {!noindex && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:type" content="event" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${CONFIG.EVENT_NAME} - ${CONFIG.TAGLINE}`} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={CONFIG.EVENT_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@formulaforum" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={twitterImage} />
    </Helmet>
  );
};

export default SEO;
