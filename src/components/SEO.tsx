import { Helmet } from "react-helmet-async";
import { CONFIG } from "@/config/event";

interface SEOProps {
  title: string;
  description: string;
  path?: string; // e.g., "/pricing"
  noindex?: boolean;
}

const SEO = ({ title, description, path = "/", noindex = false }: SEOProps) => {
  const canonical = `${CONFIG.SITE_URL}${path === "/" ? "" : path}`;
  const ogImage = CONFIG.OG_IMAGE_1200x630.startsWith("http") ? CONFIG.OG_IMAGE_1200x630 : `${CONFIG.SITE_URL}${CONFIG.OG_IMAGE_1200x630}`;
  const twitterImage = CONFIG.TW_IMAGE_1200x600.startsWith("http") ? CONFIG.TW_IMAGE_1200x600 : `${CONFIG.SITE_URL}${CONFIG.TW_IMAGE_1200x600}`;

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
