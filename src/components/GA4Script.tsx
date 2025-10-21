import { ANALYTICS_CONFIG } from '../config/analytics';

const GA4Script = () => {
  if (!ANALYTICS_CONFIG.ENABLED || ANALYTICS_CONFIG.GA4_MEASUREMENT_ID === "G-XXXXXXXXXX") {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.GA4_MEASUREMENT_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ANALYTICS_CONFIG.GA4_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `
        }}
      />
    </>
  );
};

export default GA4Script;