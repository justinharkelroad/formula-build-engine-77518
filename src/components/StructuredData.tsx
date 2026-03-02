import { Helmet } from "react-helmet-async";
import { CONFIG } from "@/config/event";

interface StructuredDataProps {
  page?: "home" | "venue" | "faq" | "speakers" | "pricing" | "format" | "contact" | "general";
}

const StructuredData = ({ page = "general" }: StructuredDataProps) => {
  const siteUrl = CONFIG.SITE_URL;

  // --- WebSite schema (all pages) ---
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Formula Forum",
    "alternateName": "F³",
    "url": siteUrl,
    "description": "Formula Forum is the national insurance agency growth conference held annually in Orlando, Florida."
  };

  // --- Organization schema (all pages) ---
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Formula Forum",
    "alternateName": "F³",
    "url": siteUrl,
    "logo": `${siteUrl}/assets/logo.png`,
    "description": "Formula Forum organizes the national insurance agency growth conference in Orlando, bringing together agency owners, producers, and industry partners.",
    "email": CONFIG.ORGANIZER_EMAIL,
    "telephone": CONFIG.ORGANIZER_PHONE,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": CONFIG.ORGANIZER_PHONE,
      "email": CONFIG.ORGANIZER_EMAIL,
      "contactType": "customer service"
    },
    "sameAs": [
      "https://www.facebook.com/FormulaForum",
      "https://www.instagram.com/formulaforum",
      "https://www.linkedin.com/company/formula-forum"
    ]
  };

  // --- Speakable schema (all public pages) ---
  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": "[data-speakable='true']"
    }
  };

  // --- BreadcrumbList schema (interior pages) ---
  const getBreadcrumbSchema = (pageName: string, pagePath: string) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": pageName,
        "item": `${siteUrl}${pagePath}`
      }
    ]
  });

  // --- Event schema (home/venue) ---
  const allSpeakers = [
    { name: "Garrett J. White", company: "Wake Up Warrior" },
    { name: "Gregg Blanchard", company: "Allstate Insurance" },
    { name: "Vlad Cherchenko", company: "Insurance Sales Lab" },
    { name: "Kelly Spicer", company: "Allstate Insurance" },
    { name: "Nicholas Sakha", company: "Allstate Insurance" },
    { name: "Joe Marranucci", company: "Walk on Ventures" },
    { name: "David Williams", company: "Team Hired" },
    { name: "Jeremy Fitzsimmons", company: "Allstate Insurance" },
    { name: "Ben Berman", company: "EOS" },
    { name: "Yandi Eirea", company: "Allstate Insurance" },
    { name: "Justin Harkelroad", company: "Standard Playbook" },
    { name: "Rob McAfee", company: "Farmers Insurance" }
  ];

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": `${CONFIG.EVENT_NAME} - Insurance Agency Growth Conference`,
    "startDate": CONFIG.START_DATETIME_ISO,
    "endDate": CONFIG.END_DATETIME_ISO,
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "sameAs": [
      "https://www.facebook.com/FormulaForum",
      "https://www.instagram.com/formulaforum",
      "https://www.linkedin.com/company/formula-forum"
    ],
    "location": {
      "@type": "Place",
      "name": "JW Marriott Orlando Bonnet Creek Resort & Spa",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": CONFIG.VENUE_STREET,
        "addressLocality": CONFIG.CITY,
        "addressRegion": CONFIG.STATE,
        "postalCode": CONFIG.VENUE_POSTAL,
        "addressCountry": CONFIG.COUNTRY
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 28.3569,
        "longitude": -81.5300
      }
    },
    "image": [`${siteUrl}${CONFIG.OG_IMAGE_1200x630}`],
    "description": "Three-day insurance agency growth conference in Orlando with workshops, breakouts, a printed Book of Formulas playbook, and a 90-day scale-up blueprint.",
    "organizer": {
      "@type": "Organization",
      "name": "Formula Forum",
      "url": siteUrl,
      "logo": `${siteUrl}/assets/logo.png`
    },
    "performer": allSpeakers.map(s => ({
      "@type": "Person",
      "name": s.name,
      "worksFor": { "@type": "Organization", "name": s.company }
    })),
    "offers": {
      "@type": "AggregateOffer",
      "url": `${siteUrl}/pricing`,
      "priceCurrency": "USD",
      "lowPrice": "347",
      "highPrice": "647",
      "offerCount": 2,
      "availability": "https://schema.org/InStock",
      "validFrom": "2026-01-01T00:00:00-05:00"
    }
  };

  // --- FAQPage schema (faq) ---
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Are tickets refundable?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. All sales are final. Tickets may be transferred to another person up to 7 days before the event at no additional cost."
        }
      },
      {
        "@type": "Question",
        "name": "How do I book the hotel room block?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use the room-block link on the Venue page or call the JW Marriott Orlando Bonnet Creek at +1 (407) 390-5000 and mention code F3-2025. The group rate is $239 per night. The cut-off date is September 15, 2026."
        }
      },
      {
        "@type": "Question",
        "name": "What is the dress code?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Business casual is the recommended dress code for all Formula Forum sessions and networking events."
        }
      },
      {
        "@type": "Question",
        "name": "Can I transfer my ticket?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, tickets are transferable until October 7, 2026. Contact the Formula Forum team with the new attendee's information and they will handle the transfer at no additional cost."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a group discount?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Teams of five or more save 20% on registration. Email Gregg@f3florida.com for a custom group discount code."
        }
      },
      {
        "@type": "Question",
        "name": "What's included in the registration fee?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Registration includes access to all sessions, the printed Book of Formulas playbook, networking events, and meals during the conference."
        }
      },
      {
        "@type": "Question",
        "name": "Will sessions be recorded?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. For the privacy and engagement of attendees, sessions are not recorded. This ensures open, honest discussions and protects the confidential strategies shared."
        }
      },
      {
        "@type": "Question",
        "name": "What should I bring?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bring business cards and a laptop for workshop sessions. All materials, tools, and the Book of Formulas playbook will be provided."
        }
      }
    ]
  };

  // --- Person/ItemList schema (speakers) ---
  const speakersSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Formula Forum 2026 Speakers",
    "numberOfItems": allSpeakers.length,
    "itemListElement": allSpeakers.map((s, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Person",
        "name": s.name,
        "worksFor": { "@type": "Organization", "name": s.company },
        "url": `${siteUrl}/speakers`
      }
    }))
  };

  // --- AggregateOffer schema (pricing) ---
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "AggregateOffer",
    "name": `${CONFIG.EVENT_NAME} Passes`,
    "description": `Access to the complete ${CONFIG.EVENT_NAME} insurance agency growth conference, including all sessions, printed playbook, and networking events.`,
    "priceCurrency": "USD",
    "lowPrice": "347",
    "highPrice": "647",
    "offerCount": 2,
    "offers": [
      {
        "@type": "Offer",
        "name": "Agency Owner Pass",
        "price": "647",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": `${siteUrl}/pricing`,
        "priceValidUntil": "2026-10-14"
      },
      {
        "@type": "Offer",
        "name": "Team Member Pass",
        "price": "347",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": `${siteUrl}/pricing`,
        "priceValidUntil": "2026-10-14"
      }
    ],
    "seller": {
      "@type": "Organization",
      "name": "Formula Forum"
    }
  };

  // --- HowTo schema (format) ---
  const formatSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "The Formula Forum Format Framework",
    "description": "A proprietary four-step session format designed for implementation, not passive listening. Each session follows this cycle to ensure attendees leave with actionable plans.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Speaker",
        "text": "Focused 15-20 minute training sessions delivering actionable insights from real operators who have built and scaled insurance agencies."
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Takeaways",
        "text": "Attendees spend 2-3 minutes typing out their key takeaways and specific action items while the content is fresh."
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Breakouts",
        "text": "Small groups spend 10 minutes sharing their takeaways and listening to what others captured, creating peer accountability and diverse perspectives."
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Speaker Close",
        "text": "The speaker returns for 3 minutes to solidify the training, answer rapid-fire questions, and outline next steps."
      }
    ]
  };

  // Determine breadcrumb for each page
  const breadcrumbMap: Record<string, { name: string; path: string }> = {
    venue: { name: "Venue", path: "/venue" },
    faq: { name: "FAQ", path: "/faq" },
    speakers: { name: "Speakers", path: "/speakers" },
    pricing: { name: "Pricing", path: "/pricing" },
    format: { name: "Format", path: "/format" },
    contact: { name: "Contact", path: "/contact" },
    general: { name: "", path: "" }
  };

  const breadcrumb = breadcrumbMap[page];

  return (
    <Helmet>
      {/* WebSite schema — all pages */}
      <script type="application/ld+json">
        {JSON.stringify(webSiteSchema)}
      </script>

      {/* Organization schema — all pages */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      {/* Speakable schema — all pages */}
      <script type="application/ld+json">
        {JSON.stringify(speakableSchema)}
      </script>

      {/* BreadcrumbList — interior pages only */}
      {page !== "home" && breadcrumb && breadcrumb.name && (
        <script type="application/ld+json">
          {JSON.stringify(getBreadcrumbSchema(breadcrumb.name, breadcrumb.path))}
        </script>
      )}

      {/* Event schema — home + venue */}
      {(page === "home" || page === "venue") && (
        <script type="application/ld+json">
          {JSON.stringify(eventSchema)}
        </script>
      )}

      {/* FAQPage schema */}
      {page === "faq" && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}

      {/* Speakers ItemList schema */}
      {page === "speakers" && (
        <script type="application/ld+json">
          {JSON.stringify(speakersSchema)}
        </script>
      )}

      {/* Pricing AggregateOffer schema */}
      {page === "pricing" && (
        <script type="application/ld+json">
          {JSON.stringify(pricingSchema)}
        </script>
      )}

      {/* Format HowTo schema */}
      {page === "format" && (
        <script type="application/ld+json">
          {JSON.stringify(formatSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default StructuredData;
