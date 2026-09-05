import { Helmet } from "react-helmet-async";
import { CONFIG } from "@/config/event";
import { PRICING } from "@/config/pricing";

interface StructuredDataProps {
  page?: "home" | "venue" | "faq" | "pricing" | "format" | "contact" | "general";
}

const StructuredData = ({ page = "general" }: StructuredDataProps) => {
  const siteUrl = CONFIG.SITE_URL;

  // --- WebSite schema (all pages) ---
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Formula Forum",
    "url": siteUrl,
    "description": "Formula Forum is the national insurance agency growth conference held annually in Orlando, Florida."
  };

  // --- Organization schema (all pages) ---
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Formula Forum",
    "url": siteUrl,
    "logo": `${siteUrl}/assets/logo.png`,
    "description": "Formula Forum organizes the national insurance agency growth conference in Orlando, bringing together agency owners, team members, producers, and industry partners.",
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
  // Only confirmed 2026 speakers. Justin, 2026-09-04: "The only speaker coming
  // back is Garrett right now." The other eleven were the 2025 lineup and were
  // still being published to search as this event's performers. Add names here
  // only once they are confirmed for 2026.
  const allSpeakers = [
    { name: "Garrett J. White", company: "Wake Up Warrior" }
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
    "image": [CONFIG.OG_IMAGE_1200x630.startsWith("http") ? CONFIG.OG_IMAGE_1200x630 : `${siteUrl}${CONFIG.OG_IMAGE_1200x630}`],
    "description": "Insurance agency growth conference in Orlando from October 14–16, 2026, with eight working sessions and a printed Formula workbook.",
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
      "lowPrice": String(PRICING.earlyBird.team.price),
      "highPrice": String(PRICING.earlyBird.agencyOwner.price),
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
          "text": "Use the room-block link on the Venue page or call the JW Marriott Orlando Bonnet Creek at +1 (407) 390-5000 and mention code F3-2026. The group rate is $239 per night. The cut-off date is September 15, 2026."
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
          "text": "Registration includes access to all sessions, the printed Formula workbook, networking events, meals during the conference, and the Agency AI Install Walkthrough when final-day attendance is confirmed."
        }
      },
      {
        "@type": "Question",
        "name": "Is the Agency AI Install Walkthrough included with my Formula ticket?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. It is included as a final-day attendee gift. You must have a registered Formula ticket and be in attendance on the final day when access is released."
        }
      },
      {
        "@type": "Question",
        "name": "Is the Agency AI Install being taught live during Formula?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Formula gift provides secure access to the guided Agency AI Install implementation walkthrough, build guides, starter files, and resources. It is not a seat at a future live Agency AI Install event."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to be technical to complete the AI Install?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. If you can create a folder, move files, and follow a guided checklist, you can complete the build. The training follows a clear order and includes verification checkpoints."
        }
      },
      {
        "@type": "Question",
        "name": "Can I build my business brain with Claude or Codex?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The core system works with both platforms. Attendees receive platform-specific setup files and instructions for Claude or Codex."
        }
      },
      {
        "@type": "Question",
        "name": "Does the AI Install send messages or change agency data automatically?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Nothing is sent without approval, numbers are not invented, and customer reports remain outside the business-brain folder. The training establishes clear safety and approval boundaries."
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
          "text": "Bring business cards and a laptop for workshop sessions. All materials, tools, and the Formula workbook will be provided."
        }
      }
    ]
  };

  // --- AggregateOffer schema (pricing) ---
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "AggregateOffer",
    "name": `${CONFIG.EVENT_NAME} Passes`,
    "description": `Access to the complete ${CONFIG.EVENT_NAME} insurance agency growth conference, including all sessions, the printed Formula workbook, and networking events.`,
    "priceCurrency": "USD",
    "lowPrice": String(PRICING.earlyBird.team.price),
    "highPrice": String(PRICING.earlyBird.agencyOwner.price),
    "offerCount": 2,
    "offers": [
      {
        "@type": "Offer",
        "name": "Agency Owner Pass",
        "price": String(PRICING.earlyBird.agencyOwner.price),
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": `${siteUrl}/pricing`,
        "priceValidUntil": "2026-10-14"
      },
      {
        "@type": "Offer",
        "name": "Team Member Pass",
        "price": String(PRICING.earlyBird.team.price),
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
    "name": "How Formula Forum Sessions Work",
    "description": "Five 60-minute Business sessions and three 40-minute Personal sessions follow the same eight-step Formula workbook pattern.",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Learn",
        "text": "Keep the Formula workbook closed and listen to operators who have already solved it."
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Assess",
        "text": "Score the three Mirror questions honestly against the five-star standard."
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Reflect",
        "text": "Write privately about what is actually true."
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Discuss",
        "text": "Work in quads for Business sessions and pairs for Body, Balance, and Being."
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "Choose the Domino",
        "text": "Choose the one move that starts the rest of the change."
      },
      {
        "@type": "HowToStep",
        "position": 6,
        "name": "Build 2027",
        "text": "Define the target, owner, support, measure, cadence, and first 30 days."
      },
      {
        "@type": "HowToStep",
        "position": 7,
        "name": "Align",
        "text": "Stress-test the build in the Walk & Talk and decide who needs to know and hold you to it."
      },
      {
        "@type": "HowToStep",
        "position": 8,
        "name": "Declare",
        "text": "Sign the commitment in the room in front of a witness."
      }
    ]
  };

  // Determine breadcrumb for each page
  const breadcrumbMap: Record<string, { name: string; path: string }> = {
    venue: { name: "Venue", path: "/venue" },
    faq: { name: "FAQ", path: "/faq" },
    pricing: { name: "Pricing", path: "/pricing" },
    format: { name: "Format", path: "/format" },
    contact: { name: "Contact", path: "/contact" },
    general: { name: "", path: "" }
  };

  const breadcrumb = breadcrumbMap[page];

  return (
    <Helmet>
      {/* WebSite and Organization schemas are in static index.html — no duplicates needed here */}

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
