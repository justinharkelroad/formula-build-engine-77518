import { Helmet } from "react-helmet-async";
import { CONFIG } from "@/config/event";

interface SEOProps {
  title: string;
  description: string;
  path?: string; // e.g., "/pricing"
}

const SEO = ({ title, description, path = "/" }: SEOProps) => {
  const origin = typeof window !== "undefined" ? window.location.origin : CONFIG.SITE_URL;
  const canonical = `${CONFIG.SITE_URL}${path === "/" ? "" : path}`;
  const ogImage = `${CONFIG.SITE_URL}${CONFIG.OG_IMAGE_1200x630}`;
  const twitterImage = `${CONFIG.SITE_URL}${CONFIG.TW_IMAGE_1200x600}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow" />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content="event" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={twitterImage} />
    </Helmet>
  );
};

export default SEO;
