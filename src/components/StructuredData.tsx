import { Helmet } from "react-helmet-async";
import { CONFIG } from "@/config/event";

interface StructuredDataProps {
  page?: "home" | "venue" | "faq" | "speakers" | "pricing" | "general";
}

const StructuredData = ({ page = "general" }: StructuredDataProps) => {
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Formula Forum 2025 - Insurance Agency Growth Conference",
    "startDate": "2025-10-15T08:00:00-04:00",
    "endDate": "2025-10-17T17:00:00-04:00",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "sameAs": [
      "https://www.facebook.com/FormulaForum",
      "https://www.instagram.com/formulaforum",
      "https://www.linkedin.com/company/formula-forum"
      // Future external URLs to add:
      // "https://www.facebook.com/events/[EVENT_ID]", // Facebook Event URL
      // "https://www.eventbrite.com/e/[EVENT_ID]", // Eventbrite URL  
      // "https://example.com/press-release", // Press release permalink
      // "https://www.visitorlando.com/events/[EVENT_ID]" // Visit Orlando listing
    ],
    "location": {
      "@type": "Place",
      "name": "JW Marriott Orlando Bonnet Creek Resort & Spa",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "14900 Chelonia Parkway",
        "addressLocality": "Orlando",
        "addressRegion": "FL",
        "postalCode": "32821",
        "addressCountry": "US"
      }
    },
    "image": [`${CONFIG.SITE_URL}${CONFIG.OG_IMAGE_1200x630}`],
    "description": "Two-day insurance agency growth conference in Orlando with workshops, breakouts, and a 90-day scale-up blueprint.",
    "organizer": {
      "@type": "Organization",
      "name": "Formula Forum",
      "url": "https://f3florida.com",
      "logo": "https://f3florida.com/assets/logo.png",
      "sameAs": [
        "https://www.facebook.com/FormulaForum",
        "https://www.instagram.com/formulaforum", 
        "https://www.linkedin.com/company/formula-forum"
      ]
    },
    "offers": {
      "@type": "Offer",
      "url": "https://f3florida.com/pricing",
      "priceCurrency": "USD",
      "price": "849",
      "availability": "https://schema.org/InStock",
      "validFrom": "2025-05-01T00:00:00-04:00"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Formula Forum",
    "url": "https://f3florida.com",
    "logo": "https://f3florida.com/assets/logo.png",
    "sameAs": [
      "https://www.facebook.com/FormulaForum",
      "https://www.instagram.com/formulaforum", 
      "https://www.linkedin.com/company/formula-forum"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Are tickets refundable?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No refunds. You can transfer a ticket to another person up to 7 days before the event."
        }
      },
      {
        "@type": "Question",
        "name": "How do I book the hotel room block?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use our room-block link on the Venue page or call the hotel with code F3-2025. Cut-off Sep 15, 2025."
        }
      },
      {
        "@type": "Question",
        "name": "What is the dress code?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Business casual."
        }
      }
    ]
  };

  const speakersSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Garrett J. White",
    "jobTitle": "Founder",
    "worksFor": {
      "@type": "Organization",
      "name": "Warrior Empire"
    },
    "description": "International keynote speaker and founder of Warrior Empire, helping business leaders achieve peak performance.",
    "image": "/lovable-uploads/6e08b5ff-0c12-49b2-a4ba-2e47d8f1c256.png",
    "url": "https://f3florida.com/speakers"
  };

  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "name": "Formula Forum 2025 Agent Pass",
    "description": "Access to the complete Formula Forum 2025 insurance agency growth conference",
    "price": "849",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://f3florida.com/pricing",
    "seller": {
      "@type": "Organization",
      "name": "Formula Forum"
    },
    "priceValidUntil": "2025-10-15"
  };

  return (
    <Helmet>
      {(page === "home" || page === "venue") && (
        <script type="application/ld+json">
          {JSON.stringify(eventSchema)}
        </script>
      )}
      {page === "faq" && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
      {page === "speakers" && (
        <script type="application/ld+json">
          {JSON.stringify(speakersSchema)}
        </script>
      )}
      {page === "pricing" && (
        <script type="application/ld+json">
          {JSON.stringify(pricingSchema)}
        </script>
      )}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
    </Helmet>
  );
};

export default StructuredData;