// Countdown management functions
const COUNTDOWN_STORAGE_KEY = 'f3_countdown_data';
const COUNTDOWN_RESET_DAYS = 7;

interface CountdownData {
  currentDeadline: string;
  resetCount: number;
  originalDeadline: string;
}

export const getCountdownDeadline = (): { deadline: string; resetCount: number; isOriginal: boolean } => {
  const now = new Date();
  const initialDeadline = new Date(now.getTime() + (COUNTDOWN_RESET_DAYS * 24 * 60 * 60 * 1000)).toISOString();
  
  try {
    const stored = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
    let countdownData: CountdownData;
    
    if (stored) {
      countdownData = JSON.parse(stored);
    } else {
      countdownData = {
        currentDeadline: initialDeadline,
        resetCount: 0,
        originalDeadline: initialDeadline
      };
    }
    
    const now = new Date();
    const currentTarget = new Date(countdownData.currentDeadline);
    
    // If deadline has passed, calculate next reset
    if (now >= currentTarget) {
      const nextDeadline = new Date(now.getTime() + (COUNTDOWN_RESET_DAYS * 24 * 60 * 60 * 1000));
      countdownData = {
        ...countdownData,
        currentDeadline: nextDeadline.toISOString(),
        resetCount: countdownData.resetCount + 1
      };
      
      localStorage.setItem(COUNTDOWN_STORAGE_KEY, JSON.stringify(countdownData));
      
      // Track reset event for analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'countdown_reset', {
          reset_count: countdownData.resetCount,
          new_deadline: countdownData.currentDeadline
        });
      }
    }
    
    return {
      deadline: countdownData.currentDeadline,
      resetCount: countdownData.resetCount,
      isOriginal: countdownData.resetCount === 0
    };
  } catch (error) {
    console.error('Error managing countdown:', error);
    const fallbackDeadline = new Date(new Date().getTime() + (COUNTDOWN_RESET_DAYS * 24 * 60 * 60 * 1000)).toISOString();
    return {
      deadline: fallbackDeadline,
      resetCount: 0,
      isOriginal: true
    };
  }
};

export const CONFIG = {
  EVENT_NAME: "Formula Forum 2026",
  BRAND_SHORT: "Formula",
  TAGLINE: "National Insurance Agency Growth Conference",
  START_DATETIME_ISO: "2026-10-14T09:00:00-04:00",
  END_DATETIME_ISO: "2026-10-16T17:00:00-04:00",
  CITY: "Orlando",
  STATE: "FL",
  VENUE_NAME: "JW Marriott Orlando Bonnet Creek",
  VENUE_STREET: "14900 Chelonia Pkwy",
  VENUE_POSTAL: "32821",
  COUNTRY: "US",
  SITE_URL: "https://theformulaforum.com",
  REGISTER_URL: "https://theformulaforum.com/pricing",
  CONTACT_URL: "https://theformulaforum.com/contact",
  PARTNERS_URL: "https://theformulaforum.com/partners",
  ORGANIZER_NAME: "Formula Forum",
  ORGANIZER_URL: "https://theformulaforum.com",
  ORGANIZER_EMAIL: "info@f3florida.com",
  ORGANIZER_PHONE: "260-515-1349",
  CURRENCY: "USD",
  BASE_TICKET_PRICE: "347",
  // Physical room capacity, counting attendee tickets AND partner passes.
  // Public copy quotes "250 attendees" — that is the attendee-facing figure and
  // is deliberately a different number from this one. Partner passes (8/6/4/2 by
  // tier) occupy seats but are not sold as attendee tickets.
  SEAT_CAP: 300,
  EARLY_BIRD_END_ISO: "2026-09-15T23:59:00-04:00",
  OG_IMAGE_1200x630: "https://koubtooblwjcwubcuhml.supabase.co/storage/v1/object/public/images/SEO%20IMAGE.jpg",
  TW_IMAGE_1200x600: "https://koubtooblwjcwubcuhml.supabase.co/storage/v1/object/public/images/SEO%20IMAGE.jpg",
  HOTEL_BOOK_URL: "https://book.passkey.com/event/51189838/owner/49980248/home",
  LOGO_PARTNERS: [
    {
      name: "Agency Toolchest",
      tier: "Platinum",
      logoUrl: "/assets/sponsors/agency-toolchest.png",
      linkUrl: "https://agencytoolchest.com",
      podcast: {
        company: "Agency Toolchest",
        guestName: "Todd Mclain",
        headshotUrl: "/assets/partners/todd-mclain.png",
        headshotWidth: 872,
        headshotHeight: 884,
        vimeoId: "1222089520",
        contactLabel: "Book a demo",
        contactUrl: "https://agencytoolchest.com",
        contactDisplay: "agencytoolchest.com",
        contactDescription: "Todd shared Agency Toolchest as the best way to connect and book a demo.",
      },
    },
    {
      name: "MediaAlpha",
      tier: "Platinum",
      logoUrl: "/assets/sponsors/mediaalpha.png",
      linkUrl: "https://mediaalpha.com",
      podcast: {
        company: "MediaAlpha",
        guestName: "Tigran Mekikian",
        headshotUrl: "/assets/partners/tigran-mekikian.png",
        headshotWidth: 512,
        headshotHeight: 512,
        vimeoId: "1223154108",
        contactLabel: "Email the team",
        contactUrl: "mailto:agentsupport@mediaalpha.com,agentsales@mediaalpha.com",
        contactDisplay: "agentsupport@mediaalpha.com · agentsales@mediaalpha.com",
        contactDescription: "Tigran shared these team inboxes as the best way for new and existing agents to connect with MediaAlpha.",
      },
    },
    {
      name: "SecureEVAs",
      tier: "Platinum",
      logoUrl: "/assets/sponsors/secure-evas.png",
      linkUrl: "https://secureevas.com",
      podcast: {
        company: "Secure EVAS",
        guestName: "Chris Cole",
        headshotUrl: "/assets/partners/chris-cole.png",
        headshotWidth: 906,
        headshotHeight: 898,
        vimeoId: "1222215006",
        contactLabel: "Call Chris",
        contactUrl: "tel:+15713732206",
        contactDisplay: "571-373-2206",
        contactDescription: "Chris shared his phone number as the best way to connect with Secure EVAS.",
      },
    },
    { name: "Standard", tier: "Platinum", logoUrl: "/assets/sponsors/the-standard.png", linkUrl: "https://standardplaybook.com" }
  ],
  // Supporting 2026 sponsors — rendered below the Platinum grid on the homepage.
  // These are deliberately NOT tier: "Platinum"; keep tiers accurate before promoting one.
  LOGO_SPONSORS: [
    { name: "EverQuote", tier: "Sponsor", logoUrl: "/assets/sponsors/everquote.png", linkUrl: "https://www.everquote.com/pro/" },
    {
      name: "Filtered Quotes",
      tier: "Sponsor",
      logoUrl: "/assets/sponsors/filtered-quotes.png",
      linkUrl: "https://filteredquotes.com",
      podcast: {
        company: "Filtered Quotes",
        guestName: "Jared Phillips",
        headshotUrl: "/assets/partners/jared-phillips.png",
        headshotWidth: 782,
        headshotHeight: 796,
        vimeoId: "1222214833",
        contactLabel: "Sign up",
        contactUrl: "https://filteredquotes.com",
        contactDisplay: "filteredquotes.com",
        contactDescription: "Jared shared Filtered Quotes as the place to sign up and get taken care of.",
      },
    },
    { name: "Hagerty", tier: "Sponsor", logoUrl: "/assets/sponsors/hagerty.png", linkUrl: "https://www.hagerty.com" },
    { name: "QuoteWizard by LendingTree", tier: "Sponsor", logoUrl: "/assets/sponsors/quotewizard.png", linkUrl: "https://agents.quotewizard.com" },
    { name: "Wintrust Agent Finance", tier: "Sponsor", logoUrl: "/assets/sponsors/wintrust-agent-finance.png", linkUrl: "https://www.agentfinance.com" },
    { name: "Search Perfect", tier: "Sponsor", logoUrl: "/assets/sponsors/search-perfect.png", linkUrl: "https://searchperfect.ca" },
    { name: "Ricochet360", tier: "Sponsor", logoUrl: "/assets/sponsors/ricochet360.png", linkUrl: "https://ricochet360.com" },
    { name: "Arbeit", tier: "Sponsor", logoUrl: "/assets/sponsors/arbeit.png", linkUrl: "https://arbeitsoftware.com" },
    { name: "Post Pros", tier: "Sponsor", logoUrl: "/assets/sponsors/post-pros.svg", linkUrl: "https://postpros.com/insurance" },
    {
      name: "NW Preferred Federal Credit Union",
      tier: "Sponsor",
      logoUrl: "/assets/sponsors/nw-preferred.png",
      linkUrl: "https://nwpreferredfcu.com",
      podcast: {
        company: "NW Preferred FCU",
        guestName: "Fred Jordan",
        headshotUrl: "/assets/partners/fred-jordan.png",
        headshotWidth: 1408,
        headshotHeight: 1444,
        vimeoId: "1220555093",
        contactLabel: "Call Fred",
        contactUrl: "tel:+15034319868",
        contactDisplay: "503-431-9868",
        contactDescription: "Fred shared his phone number as the best way to connect with NW Preferred FCU.",
      },
    },
    { name: "Performology", tier: "Sponsor", logoUrl: "/assets/sponsors/performology.svg", linkUrl: "https://performology.com" },
    { name: "GOAL", tier: "Sponsor", logoUrl: "/assets/sponsors/goal.svg", linkUrl: "https://checkoutgoal.com" },
    {
      name: "Mav",
      tier: "Bronze",
      logoUrl: "/assets/sponsors/mav.png",
      linkUrl: "https://hiremav.com",
      podcast: {
        company: "Mav",
        guestName: "Matthew Black",
        headshotUrl: "/assets/partners/matthew-black.png",
        headshotWidth: 388,
        headshotHeight: 388,
        vimeoId: "1221786634",
        contactLabel: "Visit Mav",
        contactUrl: "https://hiremav.com",
        contactDisplay: "hiremav.com",
        contactDescription: "Visit Mav to learn more and get started with Matthew and the team.",
      },
    },
    { name: "SmartFinancial", tier: "Sponsor", logoUrl: "/assets/sponsors/smart-financial.png", linkUrl: "https://smartfinancial.com" },
    { name: "SmarketingMail", tier: "Sponsor", logoUrl: "/assets/sponsors/smarketing-mail.png", linkUrl: "https://smarketingmail.com" },
    { name: "Quote Nerds", tier: "Sponsor", logoUrl: "/assets/sponsors/quote-nerds.png", linkUrl: "https://quotenerds.com" },
    // No customer-facing site — renders as a logo tile with no link.
    { name: "Ivantage", tier: "Sponsor", logoUrl: "/assets/sponsors/ivantage.png", linkUrl: "" },
    { name: "YPC Media", tier: "Sponsor", logoUrl: "/assets/sponsors/ypc-media.png", linkUrl: "https://www.ypcmedia.com" },
    {
      name: "National General",
      tier: "Sponsor",
      logoUrl: "/assets/sponsors/national-general.png",
      linkUrl: "https://nationalgeneral.com",
      podcast: {
        company: "National General",
        guestName: "Monica & Dom",
        headshotUrl: "/assets/partners/monica-and-dom.png?v=monica-20260902",
        headshotWidth: 2048,
        headshotHeight: 1638,
        vimeoId: "1223165390",
        contactLabel: "Call Dom",
        contactUrl: "tel:+12168023959",
        contactDisplay: "monica.jenkins1@allstate.com · I813022@allstate.com · 216-802-3959",
        contactDescription: "Monica and Dom invited agents to reach out directly. Dom shared his Allstate email and phone number for follow-up.",
      },
    },
    { name: "DMS", tier: "Sponsor", logoUrl: "/assets/sponsors/dms.png", linkUrl: "https://digitalmediasolutions.com" },
    {
      name: "LeadMiner",
      tier: "Sponsor",
      logoUrl: "/assets/sponsors/leadminer.png",
      linkUrl: "https://leadminer.ai",
      podcast: {
        company: "LeadMiner",
        guestName: "Scott",
        headshotUrl: "/assets/partners/scott-leadminer.png?v=scott-20260902",
        headshotWidth: 200,
        headshotHeight: 200,
        vimeoId: "1223169978",
        contactLabel: "Book with Scott",
        contactUrl: "https://leadminer.ai",
        contactDisplay: "scott@leadminer.ai · leadminer.ai",
        contactDescription: "Scott invited agents to email him directly or book a call through LeadMiner's website.",
      },
    },
    { name: "ServiceMaster Restore", tier: "Sponsor", logoUrl: "/assets/sponsors/servicemaster-restore.svg", linkUrl: "https://www.servicemasterrestore.com" },
    { name: "Melon Local", tier: "Sponsor", logoUrl: "/assets/sponsors/melon-local.png", linkUrl: "https://melonlocal.com" },
    { name: "Slide Insurance", tier: "Sponsor", logoUrl: "/assets/sponsors/slide-insurance.svg", linkUrl: "https://slideinsurance.com" },
    // Only ships a white-on-transparent lockup; recoloured to black for the light tiles.
    { name: "CRC Tapco", tier: "Sponsor", logoUrl: "/assets/sponsors/crc-tapco.png", linkUrl: "https://www.crctapco.com" },
    { name: "Ask Fetch", tier: "Sponsor", logoUrl: "/assets/sponsors/ask-fetch.png", linkUrl: "https://askfetch.com" }
  ],
  SPEAKERS: [
    { name: "Garrett J. White", title: "Founder, Warrior", company: "Warrior Empire", photo: "/assets/speakers/garrett.jpg" },
    { name: "Kory [LastName]", title: "Allstate Agent of the Year", company: "Crane Agency", photo: "/assets/speakers/kory.jpg" }
  ]
} as const;
